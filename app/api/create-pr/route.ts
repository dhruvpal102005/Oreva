import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGitHubPR } from "@/lib/utils/github-pr-creator";

export const dynamic = 'force-dynamic';

interface CreatePRRequest {
    repoFullName: string;
    filePath: string;
    originalCode: string;
    fixedCode: string;
    issueTitle: string;
    issueDescription: string;
    branchName?: string;
    fullFileContent?: string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body: CreatePRRequest = await req.json();
        const { repoFullName, filePath, originalCode, fixedCode, issueTitle, issueDescription, branchName, fullFileContent } = body;

        // Validate inputs
        if (!repoFullName || !filePath || !fixedCode || !issueTitle) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const [owner, repo] = repoFullName.split('/');
        if (!owner || !repo) {
            return NextResponse.json(
                { success: false, error: "Invalid repository format. Expected 'owner/repo'" },
                { status: 400 }
            );
        }

        console.log(`🚀 Creating PR for ${repoFullName}/${filePath}`);

        // Use the utility to create the PR
        const result = await createGitHubPR({
            owner,
            repo,
            filePath,
            originalCode,
            fixedCode,
            issueTitle,
            issueDescription,
            githubToken: session.accessToken,
            branchName,
            fullFileContent
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            prUrl: result.prUrl,
            prNumber: result.prNumber,
            branchName: result.branchName
        });

    } catch (error: any) {
        console.error("❌ Create PR API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create PR" },
            { status: 500 }
        );
    }
}
