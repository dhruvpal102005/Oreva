interface ScanResult {
    findings: Finding[];
    summary: string;
}

interface SubIssue {
    id: string;
    cve: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    package: string;
    version: string;
    analysis: string;
}

interface Finding {
    type: string;
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    location: string;
    description: string;
    fix: string;
    fixTime: string;
    detailedAnalysis?: string;
    subIssues?: SubIssue[];
}

export class ScannerService {
    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_API_KEY is missing in environment variables!");
            throw new Error("GOOGLE_API_KEY is missing");
        }
        console.log("Initializing Gemini Scanner with API Key length:", apiKey.length);
    }

    async scanRepository(accessToken: string, owner: string, repo: string): Promise<ScanResult> {
        try {
            // 1. Fetch file list
            const files = await this.fetchRepoFiles(accessToken, owner, repo);

            // 2. Filter for code files
            const codeFiles = files.filter(f => /\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(f.path));

            // 3. Fetch content for relevant files (limit to top 10 for demo/performance)
            const fileContents = await Promise.all(
                codeFiles.slice(0, 10).map(f => this.fetchFileContent(accessToken, owner, repo, f.path))
            );

            // 4. Construct Prompt
            const prompt = this.constructPrompt(fileContents);

            // 5. Analyze with Gemini using REST API (v1 endpoint)
            const apiKey = process.env.GOOGLE_API_KEY;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Gemini API error:", errorText);
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            // 6. Parse Response
            return this.parseResponse(text);

        } catch (error) {
            console.error("Scan failed:", error);
            throw error;
        }
    }

    private async fetchRepoFiles(token: string, owner: string, repo: string, path = ""): Promise<any[]> {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch files: ${res.statusText}`);

        const data = await res.json();
        let files: any[] = [];

        if (Array.isArray(data)) {
            for (const item of data) {
                if (item.type === "file") {
                    files.push(item);
                }
            }
        }
        return files;
    }

    private async fetchFileContent(token: string, owner: string, repo: string, path: string): Promise<{ path: string, content: string }> {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        return { path, content };
    }

    private constructPrompt(files: { path: string, content: string }[]): string {
        let codeContext = "";
        for (const file of files) {
            codeContext += `\n--- FILE: ${file.path} ---\n${file.content}\n`;
        }

        return `
        You are an expert Cyber Security Analyst. Analyze the following code for security vulnerabilities.
        
        Code Context:
        ${codeContext}

        Output Format: JSON object with "findings" (array) and "summary" (string).
        Each finding should have:
        - type: string (e.g., "SQL Injection", "XSS", "Dependency Vulnerability")
        - name: string (short title, max 50 characters)
        - severity: "Critical" | "High" | "Medium" | "Low"
        - location: string (file path)
        - description: string (ONE LINE ONLY, max 80 characters, concise explanation)
        - fix: string (brief fix suggestion, max 150 characters)
        - fixTime: string (estimated time, e.g., "30 min", "1 hr", "2 hr")
        - detailedAnalysis: string (optional, detailed explanation of the vulnerability)
        - subIssues: array (optional, for dependency vulnerabilities, include CVE details)
          Each subIssue should have:
          - id: string (unique identifier)
          - cve: string (CVE ID, e.g., "CVE-2025-12345")
          - severity: "Critical" | "High" | "Medium" | "Low"
          - package: string (package name, e.g., "frontend-zapier")
          - version: string (version range, e.g., "15.3.4 < 15.4.6")
          - analysis: string (brief description)

        IMPORTANT: 
        - Keep descriptions very short and concise (one line, max 80 characters).
        - For dependency vulnerabilities (like Next.js, React, etc.), include subIssues with CVE information.
        - Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
        `;
    }

    private parseResponse(text: string): ScanResult {
        try {
            // Clean up markdown if present
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);

            // Validate parsed data
            if (!parsed || typeof parsed !== 'object') {
                throw new Error("Invalid JSON structure");
            }

            // Ensure findings is an array
            if (!Array.isArray(parsed.findings)) {
                console.warn("Findings is not an array, setting to empty array");
                parsed.findings = [];
            }

            // Ensure summary exists
            if (typeof parsed.summary !== 'string') {
                parsed.summary = "Analysis completed";
            }

            return {
                findings: parsed.findings,
                summary: parsed.summary
            };
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            console.error("Parse error:", e);
            return {
                findings: [],
                summary: "Failed to parse analysis results. The AI response may have been malformed."
            };
        }
    }
}
