import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ScannerService } from "@/lib/scanner";
import { adminDb } from "@/lib/firebase-admin";

export const maxDuration = 60; // Allow longer timeout for AI analysis

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { repoId, owner, repo } = await req.json();
        console.log(`Starting scan for ${owner}/${repo} (ID: ${repoId})`);

        if (!repoId || !owner || !repo) {
            console.error("Missing required fields:", { repoId, owner, repo });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Initialize Scanner
        const scanner = new ScannerService();

        // 2. Run Scan
        const result = await scanner.scanRepository(session.accessToken, owner, repo);

        // Validate result to prevent undefined values in Firestore
        if (!result || !result.findings || !Array.isArray(result.findings)) {
            console.error("Invalid scan result:", result);
            return NextResponse.json({
                error: "Scan completed but returned invalid data. Please try again."
            }, { status: 500 });
        }

        // Ensure summary exists
        const validatedResult = {
            findings: result.findings,
            summary: result.summary || "No summary available"
        };

        // 3. Save to Firestore
        if (adminDb && (session.user as any)?.id) {
            const userId = (session.user as any).id;
            const scanId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Get all existing scans for this repo
            const scansRef = adminDb
                .collection("users")
                .doc(userId)
                .collection("repositories")
                .doc(repoId)
                .collection("scans");

            const existingScans = await scansRef.orderBy("createdAt", "desc").get();

            // Delete scans beyond the last 2 (keep only 2 most recent)
            if (existingScans.size >= 2) {
                const scansToDelete = existingScans.docs.slice(1); // Keep the most recent, delete others
                for (const scanDoc of scansToDelete) {
                    await scanDoc.ref.delete();
                    console.log(`Deleted old scan: ${scanDoc.id}`);
                }
            }

            // Save new scan result
            await scansRef.doc(scanId).set({
                id: scanId,
                status: "completed",
                findings: validatedResult.findings,
                summary: validatedResult.summary,
                repositoryId: repoId,
                repositoryName: repo,
                repositoryFullName: `${owner}/${repo}`,
                createdAt: timestamp,
                completedAt: timestamp
            });

            // Update repo summary
            await adminDb
                .collection("users")
                .doc(userId)
                .collection("repositories")
                .doc(repoId)
                .set({
                    scanSummary: {
                        issues: {
                            critical: validatedResult.findings.filter(f => f.severity === "Critical").length,
                            high: validatedResult.findings.filter(f => f.severity === "High").length,
                            medium: validatedResult.findings.filter(f => f.severity === "Medium").length,
                            low: validatedResult.findings.filter(f => f.severity === "Low").length,
                        },
                        ignored: 0,
                        last_scan: timestamp
                    }
                }, { merge: true });
        }

        return NextResponse.json({ success: true, result: validatedResult });

    } catch (error: any) {
        console.error("Scan API Error Details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return NextResponse.json({ error: error.message || "Scan failed" }, { status: 500 });
    }
}
