/**
 * GitHub Pull Request Creation Utility
 * 
 * This utility handles the creation of pull requests on GitHub
 * for AI-generated security fixes.
 */

interface GitHubPROptions {
    owner: string;
    repo: string;
    filePath: string;
    originalCode: string;
    fixedCode: string;
    issueTitle: string;
    issueDescription: string;
    githubToken: string;
    branchName?: string;
    fullFileContent?: string;
}

interface GitHubPRResult {
    success: boolean;
    prUrl?: string;
    prNumber?: number;
    branchName?: string;
    error?: string;
}

export class GitHubPRCreator {
    private headers: HeadersInit;
    private owner: string;
    private repo: string;

    constructor(owner: string, repo: string, githubToken: string) {
        this.owner = owner;
        this.repo = repo;
        this.headers = {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
    }

    /**
     * Get the default branch of the repository
     */
    private async getDefaultBranch(): Promise<string> {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`, {
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch repository: ${response.statusText}`);
        }

        const data = await response.json();
        return data.default_branch || 'main';
    }

    /**
     * Get the latest commit SHA from a branch
     */
    private async getLatestCommitSha(branch: string): Promise<string> {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${branch}`,
            { headers: this.headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to get branch reference: ${response.statusText}`);
        }

        const data = await response.json();
        return data.object.sha;
    }

    /**
     * Create a new branch from a commit SHA
     */
    private async createBranch(branchName: string, sha: string): Promise<void> {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
            {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: sha
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create branch: ${error.message || response.statusText}`);
        }
    }

    /**
     * Get file content and SHA from GitHub
     */
    private async getFileContent(filePath: string, branch: string): Promise<{ content: string; sha: string }> {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${branch}`,
            { headers: this.headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to get file content: ${response.statusText}`);
        }

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content, sha: data.sha };
    }

    /**
     * Update file content in a specific branch
     */
    private async updateFile(
        filePath: string,
        content: string,
        fileSha: string,
        branchName: string,
        commitMessage: string
    ): Promise<void> {
        const encodedContent = Buffer.from(content).toString('base64');

        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    message: commitMessage,
                    content: encodedContent,
                    sha: fileSha,
                    branch: branchName
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to update file: ${error.message || response.statusText}`);
        }
    }

    /**
     * Create a pull request
     */
    private async createPullRequest(
        title: string,
        body: string,
        headBranch: string,
        baseBranch: string
    ): Promise<{ url: string; number: number }> {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`,
            {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    title: title,
                    body: body,
                    head: headBranch,
                    base: baseBranch
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create PR: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return { url: data.html_url, number: data.number };
    }

    /**
     * Main method to create a PR with the fix
     */
    async createFixPR(options: Omit<GitHubPROptions, 'owner' | 'repo' | 'githubToken'> & { fullFileContent?: string }): Promise<GitHubPRResult> {
        try {
            const { filePath, originalCode, fixedCode, issueTitle, issueDescription, fullFileContent } = options;

            console.log(`🔧 Creating PR for ${this.owner}/${this.repo}/${filePath}`);

            // Step 1: Get default branch
            const defaultBranch = await this.getDefaultBranch();
            console.log(`📌 Default branch: ${defaultBranch}`);

            // Step 2: Get latest commit SHA
            const latestCommitSha = await this.getLatestCommitSha(defaultBranch);
            console.log(`📍 Latest commit SHA: ${latestCommitSha}`);

            // Step 3: Create new branch
            const timestamp = Date.now();
            const branchName = options.branchName || `oreva-fix-${timestamp}`;
            await this.createBranch(branchName, latestCommitSha);
            console.log(`🌿 Created branch: ${branchName}`);

            // Step 4: Get current file content (we need the SHA even if we have full content)
            const { content: currentContent, sha: fileSha } = await this.getFileContent(filePath, defaultBranch);
            console.log(`📄 Got file SHA: ${fileSha}`);

            // Step 5: Determine the new file content
            // If fullFileContent is provided (from frontend), use it directly.
            // Otherwise try to replace originalCode with fixedCode (legacy/fallback).
            let finalContent: string;

            if (fullFileContent) {
                console.log('📦 Using provided full file content');
                finalContent = fullFileContent;
            } else {
                console.log('🔄 Performing text replacement');
                // Normalize line endings for better matching
                const normalizedCurrent = currentContent.replace(/\r\n/g, '\n');
                const normalizedOriginal = originalCode.replace(/\r\n/g, '\n');

                if (normalizedCurrent.includes(normalizedOriginal)) {
                    finalContent = normalizedCurrent.replace(normalizedOriginal, fixedCode);
                } else {
                    // Fallback: Try to replace strict check or log warning
                    console.warn('⚠️ Could not find exact original code match. PR might introduce unexpected changes or fail.');
                    finalContent = currentContent.replace(originalCode, fixedCode);
                }
            }

            // Step 6: Update the file
            await this.updateFile(filePath, finalContent, fileSha, branchName, `fix: ${issueTitle}`);
            console.log(`✅ Updated file in branch ${branchName}`);

            // Step 7: Create PR
            const prBody = this.generatePRBody(filePath, originalCode, fixedCode, issueDescription);
            const { url, number } = await this.createPullRequest(
                `🔒 ${issueTitle}`,
                prBody,
                branchName,
                defaultBranch
            );
            console.log(`🎉 Created PR: ${url}`);

            return {
                success: true,
                prUrl: url,
                prNumber: number,
                branchName: branchName
            };

        } catch (error: any) {
            console.error("❌ Create PR Error:", error);
            return {
                success: false,
                error: error.message || "Failed to create PR"
            };
        }
    }

    /**
     * Generate PR body with fix details
     */
    private generatePRBody(
        filePath: string,
        originalCode: string,
        fixedCode: string,
        issueDescription: string
    ): string {
        return `## 🤖 AI-Generated Security Fix

### 🔍 Issue Description

${issueDescription}

### 📝 Summary

This pull request addresses a security vulnerability detected by Oreva's AI-powered security scanner. The fix has been automatically generated and applied to ensure your codebase remains secure.

### 📁 Files Changed

- \`${filePath}\`

### 🔧 Changes Made

#### Before (Vulnerable Code):
\`\`\`
${originalCode}
\`\`\`

#### After (Secure Code):
\`\`\`
${fixedCode}
\`\`\`

### ✅ Review Checklist

Before merging this PR, please verify:

- [ ] The fix addresses the security issue correctly
- [ ] No functionality is broken by this change
- [ ] The code follows your project's coding standards
- [ ] All tests pass successfully
- [ ] No new security issues are introduced

### 🚀 Next Steps

1. Review the changes carefully
2. Run your test suite to ensure nothing breaks
3. Merge the PR to apply the security fix
4. Deploy to production

---

**🛡️ Powered by [Oreva AI](https://github.com/dhruvpal102005/Oreva)** - Automated Security Fixes

*This PR was automatically generated by Oreva's AI security assistant. If you have any questions or concerns about this fix, please review the changes carefully or consult with your security team.*`;
    }
}

/**
 * Helper function to create a PR (for use in API routes)
 */
export async function createGitHubPR(options: GitHubPROptions): Promise<GitHubPRResult> {
    const { owner, repo, githubToken, ...prOptions } = options;
    const creator = new GitHubPRCreator(owner, repo, githubToken);
    return await creator.createFixPR(prOptions);
}
