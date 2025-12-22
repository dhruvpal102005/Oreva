import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

interface Finding {
    id: string;
    type: string;
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    location: string;
    description: string;
    fix: string;
    fixTime: string;
    codeSnippet?: string;
    subIssues?: Array<{
        id: string;
        cve?: string;
        severity: string;
        package?: string;
        version?: string;
        analysis?: string;
    }>;
}

interface ScanData {
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
    findings: Finding[];
    createdAt: string;
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!adminDb || !(session.user as any)?.id) {
            return NextResponse.json({
                counts: { dependencies: 0, sast: 0, iac: 0, totalHoursSaved: 0 },
                findings: { dependencies: [], sast: [], iac: [] }
            });
        }

        const userId = (session.user as any).id;

        // 1. Get all repositories for the user
        const reposSnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("repositories")
            .get();

        if (reposSnapshot.empty) {
            return NextResponse.json({
                counts: { dependencies: 0, sast: 0, iac: 0, totalHoursSaved: 0 },
                findings: { dependencies: [], sast: [], iac: [] }
            });
        }

        // 2. Fetch latest scan for each repository
        const allScans: ScanData[] = [];

        for (const repoDoc of reposSnapshot.docs) {
            const repoData = repoDoc.data();
            const repoId = repoDoc.id;

            // Get the most recent scan
            const scansSnapshot = await adminDb
                .collection("users")
                .doc(userId)
                .collection("repositories")
                .doc(repoId)
                .collection("scans")
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();

            if (!scansSnapshot.empty) {
                const scanDoc = scansSnapshot.docs[0];
                const scanData = scanDoc.data();

                allScans.push({
                    repositoryId: repoId,
                    repositoryName: scanData.repositoryName || repoData.name || "Unknown",
                    repositoryFullName: scanData.repositoryFullName || repoData.full_name || "Unknown",
                    findings: scanData.findings || [],
                    createdAt: scanData.createdAt
                });
            }
        }

        // 3. Aggregate and categorize findings
        let dependencyFindings: any[] = [];
        let sastFindings: any[] = [];
        let iacFindings: any[] = [];
        let totalHoursSaved = 0;


        console.log(`📊 Processing ${allScans.length} scans...`);

        // Helper function to normalize file paths
        const normalizeFilePath = (location: string): string => {
            let normalized = location;

            // Remove 'src/' prefix if present
            if (normalized.startsWith('src/')) {
                normalized = normalized.replace(/^src\//, '');
            }

            // Fix common extension mismatches
            // .tsx -> .ts for API routes (most API routes are .ts not .tsx)
            if (normalized.includes('/api/') && normalized.endsWith('.tsx')) {
                normalized = normalized.replace(/\.tsx$/, '.ts');
            }

            return normalized;
        };

        for (const scan of allScans) {
            console.log(`📦 Repo: ${scan.repositoryName}, Findings: ${scan.findings?.length || 0}`);

            if (!scan.findings || scan.findings.length === 0) {
                continue;
            }

            for (const finding of scan.findings) {
                // Normalize the file path
                const normalizedLocation = normalizeFilePath(finding.location);

                // Add repository context to finding
                const enrichedFinding = {
                    ...finding,
                    repositoryName: scan.repositoryName,
                    repositoryFullName: scan.repositoryFullName,
                    originalLocation: finding.location,
                    location: `${scan.repositoryName} | ${normalizedLocation}`
                };

                // Calculate hours saved
                const fixTimeMatch = finding.fixTime?.match(/(\d+)\s*(min|hr)/);
                if (fixTimeMatch) {
                    const value = parseInt(fixTimeMatch[1]);
                    const unit = fixTimeMatch[2];
                    totalHoursSaved += unit === 'hr' ? value : value / 60;
                }

                // Categorize by type
                console.log(`  🔍 Finding: ${finding.name} (${finding.type})`);

                if (finding.type === "Dependency Vulnerability") {
                    dependencyFindings.push(enrichedFinding);
                } else if (finding.type?.includes("IaC") || finding.type?.includes("Infrastructure")) {
                    iacFindings.push(enrichedFinding);
                } else {
                    // Everything else is SAST (code vulnerabilities)
                    sastFindings.push(enrichedFinding);
                }
            }
        }

        console.log(`✅ Categorized: ${dependencyFindings.length} dependencies, ${sastFindings.length} SAST, ${iacFindings.length} IaC`);

        // 4. Group findings by repository and file
        const groupByRepoAndFile = (findings: any[]) => {
            const grouped: Record<string, any> = {};

            findings.forEach(finding => {
                // Use location as key (already includes repo name)
                const key = finding.location;

                if (!grouped[key]) {
                    grouped[key] = {
                        fileName: finding.originalLocation?.split('/').pop() || finding.originalLocation || "package.json",
                        path: finding.location,
                        issues: []
                    };
                }


                grouped[key].issues.push({
                    id: finding.id,
                    name: finding.name,
                    description: finding.description,
                    severity: finding.severity,
                    cve: finding.subIssues?.[0]?.cve,
                    versionUpgrade: extractVersionUpgrade(finding),
                    status: "New",
                    fix: finding.fix,
                    fixTime: finding.fixTime,
                    repositoryFullName: finding.repositoryFullName // Add full repo name for GitHub links
                });
            });

            const result = Object.values(grouped);
            console.log(`  📁 Grouped into ${result.length} file groups`);
            return result;
        };

        const dependencyGroups = groupByRepoAndFile(dependencyFindings);
        const sastGroups = groupByRepoAndFile(sastFindings);
        const iacGroups = groupByRepoAndFile(iacFindings);

        console.log(`📤 Returning: ${dependencyGroups.length} dependency groups, ${sastGroups.length} SAST groups, ${iacGroups.length} IaC groups`);

        return NextResponse.json({
            counts: {
                dependencies: dependencyFindings.length,
                sast: sastFindings.length,
                iac: iacFindings.length,
                totalHoursSaved: Math.round(totalHoursSaved * 10) / 10
            },
            findings: {
                dependencies: dependencyGroups,
                sast: sastGroups,
                iac: iacGroups
            }
        });

    } catch (error: any) {
        console.error("❌ AutoFix API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch autofix data" }, { status: 500 });
    }
}

// Helper function to extract version upgrade info from dependency findings
function extractVersionUpgrade(finding: Finding) {
    if (finding.type !== "Dependency Vulnerability" || !finding.subIssues?.[0]) {
        return undefined;
    }

    const subIssue = finding.subIssues[0];
    const versionRange = subIssue.version;

    if (!versionRange) return undefined;

    // Try to parse version range like "< 14.0.1" or "14.0.4 -> 14.0.7"
    const upgradeMatch = versionRange.match(/(\d+\.\d+\.\d+)\s*->\s*(\d+\.\d+\.\d+)/);
    const lessThanMatch = versionRange.match(/<\s*(\d+\.\d+\.\d+)/);

    if (upgradeMatch) {
        return {
            from: upgradeMatch[1],
            to: upgradeMatch[2],
            type: determineUpgradeType(upgradeMatch[1], upgradeMatch[2])
        };
    } else if (lessThanMatch && subIssue.package) {
        // If we only have "< version", we need to infer the current version
        // For now, just show the target version
        return {
            from: "current",
            to: lessThanMatch[1],
            type: "patch" as const
        };
    }

    return undefined;
}

function determineUpgradeType(from: string, to: string): "patch" | "minor" | "major" {
    const fromParts = from.split('.').map(Number);
    const toParts = to.split('.').map(Number);

    if (fromParts[0] !== toParts[0]) return "major";
    if (fromParts[1] !== toParts[1]) return "minor";
    return "patch";
}
