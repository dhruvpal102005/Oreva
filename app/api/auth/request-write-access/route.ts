import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // GitHub OAuth URL with write permissions
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set("client_id", process.env.GITHUB_ID || "");
    githubAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/callback/github`);
    githubAuthUrl.searchParams.set("scope", "read:user user:email repo"); // repo scope includes write access
    githubAuthUrl.searchParams.set("state", "write_access_request");

    // Redirect to GitHub authorization page
    return NextResponse.redirect(githubAuthUrl.toString());
}
