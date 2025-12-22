import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ hasWriteAccess: false }, { status: 200 });
    }

    try {
        // Check the scopes of the current GitHub token
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!userResponse.ok) {
            return NextResponse.json({ hasWriteAccess: false }, { status: 200 });
        }

        // Get the scopes from the response headers
        const scopes = userResponse.headers.get("x-oauth-scopes") || "";
        const scopeList = scopes.split(",").map(s => s.trim());

        // Check if user has repo scope (which includes write access)
        const hasRepoScope = scopeList.includes("repo") || scopeList.includes("public_repo");

        // Also check for GitHub App installations
        let hasAppInstalled = false;
        try {
            const installationsResponse = await fetch("https://api.github.com/user/installations", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });

            if (installationsResponse.ok) {
                const installationsData = await installationsResponse.json();
                // Check if any installation exists (GitHub App is installed)
                hasAppInstalled = installationsData.total_count > 0;
            }
        } catch (error) {
            console.error("Error checking app installations:", error);
        }

        const hasWriteAccess = hasRepoScope || hasAppInstalled;

        return NextResponse.json({
            hasWriteAccess,
            scopes: scopeList,
            hasAppInstalled
        });
    } catch (error) {
        console.error("Error checking GitHub permissions:", error);
        return NextResponse.json({ hasWriteAccess: false }, { status: 200 });
    }
}
