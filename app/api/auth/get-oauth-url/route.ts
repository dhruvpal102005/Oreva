import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || process.env.NEXTAUTH_URL || '';

    const clientId = process.env.GITHUB_ID || '';
    const redirectUri = `${origin}/api/auth/callback/github`;
    const scope = 'read:user user:email repo';

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=write_access_request`;

    return NextResponse.json({ authUrl: githubAuthUrl });
}
