import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get User's Installations
        const installationsRes = await fetch("https://api.github.com/user/installations", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!installationsRes.ok) {
            console.error("Failed to fetch installations", await installationsRes.text());
            return NextResponse.json({ repositories: MOCK_REPOS });
        }

        const installationsData = await installationsRes.json();
        const installations = installationsData.installations;

        console.log(`Found ${installations?.length ?? 0} installations`);

        if (!installations || installations.length === 0) {
            console.warn("No installations found. Returning MOCK_REPOS. Sync skipped.");
            return NextResponse.json({ repositories: MOCK_REPOS });
        }

        // 2. Fetch repositories for each installation
        let allRepos: any[] = [];

        for (const install of installations) {
            const reposRes = await fetch(`https://api.github.com/user/installations/${install.id}/repositories`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });

            if (reposRes.ok) {
                const reposData = await reposRes.json();
                allRepos = [...allRepos, ...reposData.repositories];
            }
        }

        // 3. Sync to Firestore & Merge with Scan Data
        console.log(`Syncing ${allRepos.length} repositories to Firestore`);
        const syncedRepos = await Promise.all(allRepos.map(async (repo: any) => {
            const repoId = repo.id.toString();
            let scanData = {
                issues: { critical: 0, high: 0, medium: 0, low: 0 },
                ignored: 0,
                last_scan: "Never"
            };

            if (adminDb && (session.user as any)?.id) {
                // Use nested collection: users/{userId}/repositories/{repoId}
                const userId = (session.user as any).id;
                const userRepoRef = adminDb
                    .collection("users")
                    .doc(userId)
                    .collection("repositories")
                    .doc(repoId);

                const repoDoc = await userRepoRef.get();

                if (repoDoc.exists) {
                    const data = repoDoc.data();
                    if (data?.scanSummary) {
                        scanData = data.scanSummary;
                    }
                }

                // Update metadata for Gen AI context
                await userRepoRef.set({
                    name: repo.name,
                    full_name: repo.full_name,
                    description: repo.description,
                    html_url: repo.html_url,
                    language: repo.language,
                    default_branch: repo.default_branch,
                    clone_url: repo.clone_url,
                    owner: {
                        login: repo.owner.login,
                        avatar_url: repo.owner.avatar_url,
                        id: repo.owner.id
                    },
                    updated_at: repo.updated_at,
                    lastSyncedAt: new Date().toISOString(),
                    // Preserve existing scan data if any
                    scanSummary: repoDoc.exists ? (repoDoc.data()?.scanSummary || scanData) : scanData
                }, { merge: true });
            } else {
                console.warn("Skipping repo sync: adminDb missing or user ID not found in session");
            }

            return {
                ...repo,
                ...scanData
            };
        }));

        console.log("Repository sync completed");
        return NextResponse.json({ repositories: syncedRepos });

    } catch (error) {
        console.error("Error fetching repositories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

const MOCK_REPOS = [
    {
        id: 1,
        name: "zapier",
        full_name: "dhruvpal102005/zapier",
        private: true,
        language: "TypeScript",
        updated_at: new Date().toISOString(),
        owner: { login: "dhruvpal102005", avatar_url: "https://github.com/dhruvpal102005.png" },
        issues: { critical: 1, high: 2, medium: 1, low: 1 },
        ignored: 2,
        last_scan: "15h ago"
    },
    {
        id: 2,
        name: "vercel",
        full_name: "dhruvpal102005/vercel",
        private: true,
        language: "TypeScript",
        updated_at: new Date().toISOString(),
        owner: { login: "dhruvpal102005", avatar_url: "https://github.com/dhruvpal102005.png" },
        issues: { critical: 1, high: 3, medium: 0, low: 1 },
        ignored: 1,
        last_scan: "15h ago"
    },
    {
        id: 3,
        name: "twitter",
        full_name: "dhruvpal102005/twitter",
        private: false,
        language: "Python",
        updated_at: new Date().toISOString(),
        owner: { login: "dhruvpal102005", avatar_url: "https://github.com/dhruvpal102005.png" },
        issues: { critical: 0, high: 1, medium: 0, low: 0 },
        ignored: 0,
        last_scan: "15h ago"
    },
    {
        id: 4,
        name: "snake_game",
        full_name: "dhruvpal102005/snake_game",
        private: false,
        language: "Rust",
        updated_at: new Date().toISOString(),
        owner: { login: "dhruvpal102005", avatar_url: "https://github.com/dhruvpal102005.png" },
        issues: { critical: 0, high: 0, medium: 1, low: 0 },
        ignored: 0,
        last_scan: "15h ago"
    }
];
