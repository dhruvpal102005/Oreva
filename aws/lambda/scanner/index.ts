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

        // Limit to 50 files for comprehensive scanning
        const fileContents = await Promise.all(
            codeFiles.slice(0, 50).map((f: any) => fetchFileContent(token, owner, repo, f.path))
        );

        // 2. Construct Prompt
        const prompt = constructPrompt(fileContents);

        // 3. Invoke Google Gemini (REST API) with Retry Logic
        console.log("Invoking Google Gemini with deterministic settings...");

        const MAX_RETRIES = 3;
        const INITIAL_DELAY = 2000; // 2 seconds
        let lastError: any = null;
        let response: any = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: prompt }]
                            }],
                            generationConfig: {
                                temperature: 0,           // Maximum determinism (no randomness)
                                topK: 1,                  // Only consider top 1 token
                                topP: 0.1,                // Minimal nucleus sampling
                                candidateCount: 1,        // Single response
                                maxOutputTokens: 8192     // Sufficient for detailed findings
                            }
                        })
                    }
                );

                // If successful or non-retryable error, break
                if (response.ok) {
                    console.log(`✅ Gemini API call succeeded on attempt ${attempt + 1}`);
                    break;
                }

                // Check if error is retryable (503, 429, 500)
                const errorData = await response.clone().json().catch(() => ({}));
                const isRetryable = response.status === 503 || response.status === 429 || response.status === 500;

                if (!isRetryable || attempt === MAX_RETRIES) {
                    // Non-retryable error or max retries reached
                    break;
                }

                // Calculate exponential backoff delay
                const delay = INITIAL_DELAY * Math.pow(2, attempt);
                console.warn(`⚠️ Gemini API returned ${response.status}. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);

                await new Promise(resolve => setTimeout(resolve, delay));

            } catch (error) {
                lastError = error;
                console.error(`❌ Gemini API call failed on attempt ${attempt + 1}:`, error);

                if (attempt === MAX_RETRIES) {
                    throw error;
                }

                const delay = INITIAL_DELAY * Math.pow(2, attempt);
                console.warn(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!response || !response.ok) {
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
    console.log(`📁 Fetching files from: ${path || '(root)'}`);
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
            if (item.type === "file") {
                files.push(item);
                console.log(`  📄 Found file: ${item.path}`);
            } else if (item.type === "dir") {
                // Skip node_modules, .git, and .next directories
                if (item.name === 'node_modules' || item.name === '.git' || item.name === '.next') {
                    console.log(`  ⏭️  Skipping: ${item.path}`);
                    continue;
                }
                // Recursively fetch files from subdirectories
                try {
                    const subFiles = await fetchRepoFiles(token, owner, repo, item.path);
                    files = files.concat(subFiles);
                } catch (error) {
                    console.error(`Error fetching directory ${item.path}:`, error);
                }
            }
        }
    }

    console.log(`✅ Found ${files.length} total files in ${path || '(root)'}`);
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

    return `You are a comprehensive security scanner. Perform a THOROUGH analysis of the following code for ALL security issues, including low-priority ones.

VULNERABILITY CATEGORIES (Report ALL that apply):

**CRITICAL & HIGH PRIORITY:**
1. SQL Injection (CWE-89) - Any database queries with user input
2. Cross-Site Scripting (CWE-79) - Any unescaped output to HTML/JS, document.write(), innerHTML, eval()
3. Path Traversal (CWE-22) - File operations with user-controlled paths, fs.readFile(), require()
4. Command Injection (CWE-78) - Any shell command execution, exec(), spawn()
5. Hardcoded Secrets (CWE-798) - API keys, tokens, passwords, private keys, access tokens
6. Authentication Bypass (CWE-287) - Missing or weak authentication
7. Authorization Issues (CWE-285) - Missing access control checks
8. Insecure Deserialization (CWE-502) - Unsafe JSON/object parsing

**MEDIUM PRIORITY:**
9. Cryptographic Failures (CWE-327) - Weak algorithms, hardcoded IVs
10. Information Disclosure - Exposed error messages, debug info, stack traces
11. CORS Misconfiguration - Overly permissive CORS policies
12. Missing Security Headers - CSP, X-Frame-Options, HSTS
13. Insecure Direct Object References (IDOR) - Unvalidated IDs
14. Server-Side Request Forgery (SSRF) - Unvalidated external requests, fetch(), axios.get()
15. XML External Entities (XXE) - Unsafe XML parsing

**LOW PRIORITY (STILL REPORT):**
16. Missing Input Validation - Unvalidated user inputs
17. Weak Random Number Generation - Math.random() for security
18. Insecure HTTP Usage - HTTP instead of HTTPS
19. Missing Rate Limiting - No throttling on sensitive endpoints
20. Dependency Vulnerabilities - Outdated packages with known CVEs
21. Exposed Sensitive Files - .env, config files, credentials
22. Console.log with Sensitive Data - Logging passwords, tokens
23. Commented-out Secrets - Old API keys in comments
24. TODO/FIXME Security Notes - Security-related TODOs

Code Context:
${codeContext}

ANALYSIS RULES:
- Scan THOROUGHLY - check every file for ALL vulnerability types
- Report EVERYTHING suspicious, even if low severity
- Look for patterns like: "password", "secret", "api_key", "token", "private_key", "aws_", "sk_", "pk_"
- Check for exposed credentials in: strings, environment variables, comments, config files
- Include EXACT line numbers where issues occur
- Be CONSISTENT - same code = same findings every time
- Prioritize by severity but REPORT ALL FINDINGS

SPECIFIC PATTERNS TO DETECT:

**XSS Patterns:**
- document.write() with any variables
- innerHTML = with any variables
- eval() with any input
- dangerouslySetInnerHTML in React
- v-html in Vue
- Any user input rendered without escaping

**SSRF Patterns:**
- fetch(url) where url comes from user input
- axios.get(url) where url is not hardcoded
- http.request() with dynamic URLs
- Any HTTP client with user-controlled destination

**File Inclusion Patterns:**
- fs.readFile() with user input in path
- require() with dynamic paths
- import() with user-controlled paths
- path.join() with unvalidated input

**API Token/Secret Patterns (CRITICAL - Report ALL):**
- RapidAPI tokens: "X-RapidAPI-Key", headers with API keys
- GitHub tokens: ghp_, gho_, ghs_, ghu_
- AWS keys: AKIA, aws_access_key_id, aws_secret_access_key
- Stripe keys: sk_live_, pk_live_, sk_test_, pk_test_
- Google API: AIza[0-9A-Za-z-_]{35}
- Firebase: [0-9a-zA-Z-_]{40}
- JWT tokens: eyJ[A-Za-z0-9-_=]+\\.eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*
- Private keys: -----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----
- Database URLs: mongodb://, postgres://, mysql:// with credentials
- Any string matching: /[a-zA-Z0-9_-]{20,}/

**Exposed Secrets in Files:**
- Check .env files, config.js, constants.ts
- Check for hardcoded passwords in variables
- Check for API keys in headers objects
- Check for tokens in localStorage/sessionStorage calls
- Check for credentials in fetch/axios calls

SECRETS DETECTION (Be extra vigilant):
- API Keys: Look for patterns like "AIza", "sk_live_", "pk_test_", "AKIA", "X-RapidAPI-Key"
- Tokens: JWT tokens, OAuth tokens, GitHub tokens (ghp_, gho_), Bearer tokens
- Passwords: Hardcoded passwords in strings or variables (password = "...", pwd: "...")
- Private Keys: RSA, SSH, PGP keys in code
- Database URLs: Connection strings with credentials (user:pass@host)
- AWS Credentials: Access keys, secret keys
- Firebase Config: apiKey, authDomain, projectId with actual values

Output Format: Valid JSON object with this EXACT structure:
{
  "findings": [
    {
      "id": "unique-hash",
      "type": "SQL Injection | XSS | Path Traversal | Command Injection | Hardcoded Secret | Auth Bypass | Authorization Issue | Crypto Failure | Information Disclosure | CORS Misconfiguration | Missing Security Headers | IDOR | SSRF | XXE | Missing Input Validation | Weak Random | Insecure HTTP | Missing Rate Limiting | Dependency Vulnerability | Exposed Sensitive File | Sensitive Data Logging | Commented Secret | Security TODO",
      "name": "Brief title (max 50 chars)",
      "severity": "Critical | High | Medium | Low",
      "location": "file/path.ts:line_number",
      "description": "One line explanation (max 80 chars)",
      "fix": "Specific fix suggestion (max 150 chars)",
      "fixTime": "30 min | 1 hr | 2 hr | 4 hr",
      "detailedAnalysis": "Detailed explanation with code snippet",
      "codeSnippet": "Exact vulnerable code from the file",
      "subIssues": [
        {
          "id": "sub-hash",
          "cve": "CVE-YYYY-XXXXX",
          "severity": "Critical | High | Medium | Low",
          "package": "package-name",
          "version": "affected version range",
          "analysis": "Brief CVE description"
        }
      ]
    }
  ],
  "summary": "X Critical, Y High, Z Medium, W Low vulnerabilities found"
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks)
- Include line numbers in location (format: "path/file.ts:42")
- Generate deterministic IDs based on file+line+type
- Be THOROUGH - scan every line for potential issues
- Be CONSISTENT - same code = same findings
- REPORT MORE rather than less - we want comprehensive coverage
- Pay special attention to API tokens, secrets, and credentials
`;
}

function parseResponse(text: string): any {
    try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanText);

        // Validate structure
        if (!parsed.findings || !Array.isArray(parsed.findings)) {
            console.warn("Invalid findings structure, returning empty array");
            return { findings: [], summary: "Failed to parse analysis results." };
        }

        // Add deterministic IDs to findings if not present
        parsed.findings = parsed.findings.map((finding: any, index: number) => {
            if (!finding.id) {
                finding.id = generateDeterministicId(finding);
            }

            // Ensure required fields exist
            finding.type = finding.type || "Unknown";
            finding.severity = finding.severity || "Low";
            finding.location = finding.location || "unknown";

            return finding;
        });

        return parsed;
    } catch (e) {
        console.error("Parse error:", e);
        return { findings: [], summary: "Failed to parse analysis results." };
    }
}

// Generate deterministic hash-based ID for consistent issue tracking
function generateDeterministicId(finding: any): string {
    const crypto = require('crypto');

    // Extract line number from location if present (e.g., "file.ts:42" -> "42")
    const lineMatch = finding.location?.match(/:(\d+)$/);
    const line = lineMatch ? lineMatch[1] : "0";

    // Create deterministic string from key properties
    const idString = `${finding.type}:${finding.location}:${line}:${finding.severity}`;

    // Generate SHA-256 hash and take first 12 characters
    return crypto
        .createHash('sha256')
        .update(idString)
        .digest('hex')
        .substring(0, 12);
}
