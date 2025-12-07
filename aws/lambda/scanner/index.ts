import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("Received scan request");

    try {
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ error: "No body provided" }) };
        }

        const { owner, repo, token, apiKey } = JSON.parse(event.body);

        if (!owner || !repo || !token || !apiKey) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields: owner, repo, token, apiKey (for Gemini)" }) };
        }

        // 1. Fetch File Content from GitHub
        const files = await fetchRepoFiles(token, owner, repo);
        const codeFiles = files.filter((f: any) => /\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(f.path));

        console.log(`Found ${codeFiles.length} code files. Fetching content...`);

        // Limit to 10 files
        const fileContents = await Promise.all(
            codeFiles.slice(0, 10).map((f: any) => fetchFileContent(token, owner, repo, f.path))
        );

        // 2. Construct Prompt
        const prompt = constructPrompt(fileContents);

        // 3. Invoke Google Gemini (REST API)
        console.log("Invoking Google Gemini...");
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
        const aiText = data.candidates[0].content.parts[0].text;

        const scanResult = parseResponse(aiText);

        return {
            statusCode: 200,
            body: JSON.stringify(scanResult),
            headers: { "Content-Type": "application/json" }
        };

    } catch (error: any) {
        console.error("Lambda Scan Failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "Internal Server Error" })
        };
    }
};

// --- Helper Functions ---

async function fetchRepoFiles(token: string, owner: string, repo: string, path = ""): Promise<any[]> {
    console.log(`Fetching files from: https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Oreva-Scanner-Lambda",
            "Accept": "application/vnd.github.v3+json"
        }
    });
    if (!res.ok) {
        const errorBody = await res.text();
        console.error(`GitHub Fetch Failed (${res.status}):`, errorBody);
        throw new Error(`GitHub Fetch Failed: ${res.statusText} (${res.status}) - ${errorBody}`);
    }

    const data = await res.json();
    let files: any[] = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            if (item.type === "file") files.push(item);
        }
    }
    return files;
}

async function fetchFileContent(token: string, owner: string, repo: string, path: string): Promise<{ path: string, content: string }> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Oreva-Scanner-Lambda",
            "Accept": "application/vnd.github.v3+json"
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error(`GitHub Content Fetch Failed (${res.status}):`, errorBody);
        throw new Error(`GitHub Content Fetch Failed: ${res.statusText}`);
    }

    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { path, content };
}

function constructPrompt(files: { path: string, content: string }[]): string {
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
    - detailedAnalysis: string (optional, detailed explanation)
    - subIssues: array (optional, for dependencies) with {id, cve, severity, package, version, analysis}

    IMPORTANT: 
    - Keep descriptions very short and concise (one line, max 80 characters).
    - For dependency vulnerabilities (Next.js, React), include subIssues with CVE info.
    - Return ONLY valid JSON.
    `;
}

function parseResponse(text: string): any {
    try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Parse error:", e);
        return { findings: [], summary: "Failed to parse analysis results." };
    }
}
