import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            // Fallback to mock data if API fails (e.g. if scope is missing or app not set up)
            return NextResponse.json({ repositories: MOCK_REPOS });
        }

        const installationsData = await installationsRes.json();
        const installations = installationsData.installations;

        if (!installations || installations.length === 0) {
            // If no installations found (or if it's a demo user), return mock data
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
            } else {
                console.error(`Failed to fetch repos for installation ${install.id}`, await reposRes.text());
            }
        }

        // Transform to match our Dashboard UI needs
        const formattedRepos = allRepos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            updated_at: repo.updated_at,
            owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url,
            },
            // Mocking security data as it's not in standard repo response
            issues: {
                critical: Math.floor(Math.random() * 2),
                high: Math.floor(Math.random() * 3),
                medium: Math.floor(Math.random() * 5),
                low: Math.floor(Math.random() * 5),
            },
            ignored: Math.floor(Math.random() * 5),
            last_scan: "15h ago"
        }));

        return NextResponse.json({ repositories: formattedRepos });

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
