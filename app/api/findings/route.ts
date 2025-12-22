import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

// Enable caching for 30 seconds
export const revalidate = 30;

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!adminDb || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        const userId = (session.user as any).id;
        const cacheKey = `findings_${userId}`;

        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached findings');
            return NextResponse.json(cached.data);
        }

        // Get all repositories for this user
        const reposSnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("repositories")
            .get();

        // Fetch all scans in parallel instead of sequentially
        const scanPromises = reposSnapshot.docs.map(async (repoDoc) => {
            const repoData = repoDoc.data();
            const repoId = repoDoc.id;

            try {
                // Get the latest scan for this repository
                if (!adminDb) {
                    return null;
                }

                const scansSnapshot = await adminDb
                    .collection("users")
                    .doc(userId)
                    .collection("repositories")
                    .doc(repoId)
                    .collection("scans")
                    .orderBy("createdAt", "desc")
                    .limit(1)
                    .get();

                if (scansSnapshot.empty) {
                    return null;
                }

                const latestScan = scansSnapshot.docs[0].data();

                if (!latestScan.findings || !Array.isArray(latestScan.findings)) {
                    return null;
                }

                // Add repository context to each finding
                return latestScan.findings.map((finding: any) => ({
                    ...finding,
                    repositoryName: repoData.name || latestScan.repositoryName,
                    repositoryFullName: latestScan.repositoryFullName,
                    scanId: latestScan.id,
                    scannedAt: latestScan.createdAt
                }));
            } catch (error) {
                console.error(`Error fetching scan for repo ${repoId}:`, error);
                return null;
            }
        });

        // Wait for all scans to complete in parallel
        const scanResults = await Promise.all(scanPromises);

        // Flatten and filter out null results
        const allFindings = scanResults
            .filter(result => result !== null)
            .flat();

        // Calculate summary stats efficiently
        const summary = allFindings.reduce((acc, finding) => {
            acc.totalIssues++;

            switch (finding.severity) {
                case "Critical":
                    acc.critical++;
                    break;
                case "High":
                    acc.high++;
                    break;
                case "Medium":
                    acc.medium++;
                    break;
                case "Low":
                    acc.low++;
                    break;
            }

            return acc;
        }, {
            totalIssues: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            autoIgnored: 0,
            newInLast7Days: 0,
            solvedInLast7Days: 0
        });

        const response = {
            success: true,
            findings: allFindings,
            summary
        };

        // Cache the response
        if (userId) {
            cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            // Clean up old cache entries (simple cleanup)
            if (cache.size > 100) {
                const oldestKey = cache.keys().next().value;
                if (oldestKey) {
                    cache.delete(oldestKey);
                }
            }
        }

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("Get All Findings API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch findings" }, { status: 500 });
    }
}
