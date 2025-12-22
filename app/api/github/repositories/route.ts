import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

// Enable caching for 60 seconds
export const revalidate = 60;

// In-memory cache
const repoCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 seconds

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = (session.user as any)?.id;
        const cacheKey = `repos_${userId}`;

        // Check cache first
        const cached = repoCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached repositories');
            return NextResponse.json(cached.data);
        }

        let allRepos: any[] = [];

        // Try to fetch from GitHub installations first
        try {
            const installationsRes = await fetch("https://api.github.com/user/installations", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });

            if (installationsRes.ok) {
                const installationsData = await installationsRes.json();
                const installations = installationsData.installations;

                console.log(`Found ${installations?.length ?? 0} installations`);

                if (installations && installations.length > 0) {
                    // Fetch repositories for each installation with pagination
                    for (const install of installations) {
                        let page = 1;
                        let hasMore = true;

                        while (hasMore) {
                            const reposRes = await fetch(
                                `https://api.github.com/user/installations/${install.id}/repositories?per_page=100&page=${page}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${session.accessToken}`,
                                        Accept: "application/vnd.github.v3+json",
                                    },
                                }
                            );

                            if (reposRes.ok) {
                                const reposData = await reposRes.json();
                                const repos = reposData.repositories || [];

                                if (repos.length > 0) {
                                    allRepos = [...allRepos, ...repos];
                                    console.log(`Fetched ${repos.length} repos from installation ${install.id}, page ${page}`);
                                    page++;
                                    hasMore = repos.length === 100;
                                } else {
                                    hasMore = false;
                                }
                            } else {
                                console.error(`Failed to fetch repos for installation ${install.id}`);
                                hasMore = false;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching from installations:", error);
        }

        // Fallback: If no repos from installations, fetch user repos directly
        if (allRepos.length === 0) {
            console.log("No repos from installations, fetching user repos directly...");
            try {
                const userReposRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                });

                console.log("User repos response status:", userReposRes.status);

                if (userReposRes.ok) {
                    const userReposData = await userReposRes.json();
                    allRepos = userReposData;
                    console.log(`✅ Fetched ${allRepos.length} repositories from user endpoint`);

                    if (allRepos.length === 0) {
                        console.warn("⚠️ User repos endpoint returned empty array. This might mean:");
                        console.warn("  1. User has no repositories");
                        console.warn("  2. OAuth token doesn't have 'repo' scope");
                        console.warn("  3. User needs to re-authenticate");
                    }
                } else {
                    const errorText = await userReposRes.text();
                    console.error("❌ Failed to fetch user repos:", userReposRes.status, errorText);
                }
            } catch (error) {
                console.error("❌ Error fetching user repos:", error);
            }
        }

        // If still no repos, return mock data
        if (allRepos.length === 0) {
            console.warn("No repositories found, returning mock data");
            return NextResponse.json({ repositories: MOCK_REPOS });
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

            if (adminDb && userId) {
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

                // Update metadata
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
                    scanSummary: repoDoc.exists ? (repoDoc.data()?.scanSummary || scanData) : scanData
                }, { merge: true });
            }

            return {
                ...repo,
                ...scanData
            };
        }));

        console.log("Repository sync completed");

        const response = { repositories: syncedRepos };

        // Cache the response (userId already declared at line 21)
        if (userId) {
            repoCache.set(`repos_${userId}`, {
                data: response,
                timestamp: Date.now()
            });

            // Clean up old cache entries
            if (repoCache.size > 50) {
                const oldestKey = repoCache.keys().next().value;
                if (oldestKey) {
                    repoCache.delete(oldestKey);
                }
            }
        }

        return NextResponse.json(response);

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
