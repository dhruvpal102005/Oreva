import { LocalScanner } from './local-scanner';

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
        console.log(`🚀 Triggering AWS Lambda Scanner for ${owner}/${repo}...`);

        try {
            const LAMBDA_URL = "https://rxeg3hk6ptuxicz6k3ljniscpi0ulqsh.lambda-url.us-east-1.on.aws/";

            console.log("DEBUG: Calling Lambda with:", {
                tokenLength: accessToken?.length,
                owner,
                repo
            });

            const response = await fetch(LAMBDA_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: accessToken,
                    apiKey: process.env.GOOGLE_API_KEY,
                    owner,
                    repo
                })
            });

            console.log("Lambda response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Lambda Error Response:", errorText);
                throw new Error(`Lambda Scan Failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ AWS Lambda Scan Complete");
            console.log("📊 Scan Results:", {
                findingsCount: data.findings?.length || 0,
                summary: data.summary,
                severities: {
                    critical: data.findings?.filter((f: any) => f.severity === "Critical").length || 0,
                    high: data.findings?.filter((f: any) => f.severity === "High").length || 0,
                    medium: data.findings?.filter((f: any) => f.severity === "Medium").length || 0,
                    low: data.findings?.filter((f: any) => f.severity === "Low").length || 0
                }
            });

            if (!data.findings || data.findings.length === 0) {
                console.warn("⚠️ Lambda returned NO findings. This might mean:");
                console.warn("  1. Repository has no security issues (unlikely)");
                console.warn("  2. Lambda AI analysis failed silently");
                console.warn("  3. Lambda timeout or error");
                console.warn("  4. Repository is empty or has no code files");
                console.warn("🔄 Falling back to local pattern-based scanner...");

                // Fallback to local scanner
                return await LocalScanner.scanRepository(accessToken, owner, repo);
            }

            return data;

        } catch (error) {
            console.error("❌ AWS Scanner Error:", error);
            console.warn("🔄 Falling back to local pattern-based scanner...");

            // Fallback to local scanner on error
            try {
                return await LocalScanner.scanRepository(accessToken, owner, repo);
            } catch (fallbackError) {
                console.error("❌ Local scanner also failed:", fallbackError);
                throw error; // Throw original error
            }
        }
    }

    private async fetchRepoFiles(token: string, owner: string, repo: string, path = ""): Promise<any[]> {
        console.log(`📁 Scanning directory: ${path || '(root)'}`);
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
                    console.log(`  📄 Found file: ${item.path}`);
                } else if (item.type === "dir") {
                    // Skip node_modules and .git directories
                    if (item.name === 'node_modules' || item.name === '.git' || item.name === '.next') {
                        console.log(`  ⏭️  Skipping: ${item.path}`);
                        continue;
                    }
                    // Recursively fetch files from subdirectories
                    try {
                        const subFiles = await this.fetchRepoFiles(token, owner, repo, item.path);
                        files = files.concat(subFiles);
                    } catch (error) {
                        console.error(`Error fetching directory ${item.path}:`, error);
                    }
                }
            }
        }
        console.log(`✅ Found ${files.length} files in ${path || '(root)'}`);
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
