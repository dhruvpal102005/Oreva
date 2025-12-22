import { ScannerService } from './scanner';

interface Finding {
    type: string;
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    location: string;
    description: string;
    fix: string;
    fixTime: string;
    detailedAnalysis?: string;
    codeSnippet?: string;
}

interface ScanResult {
    findings: Finding[];
    summary: string;
}

export class LocalScanner {
    // Pattern-based vulnerability detection
    static detectVulnerabilities(filePath: string, content: string): Finding[] {
        const findings: Finding[] = [];
        const lines = content.split('\n');

        // Pattern definitions
        const patterns = [
            // API Keys and Secrets - Very aggressive
            {
                regex: /(?:api[_-]?key|apikey|api[_-]?secret|secret[_-]?key|key)\s*[:=]\s*["']([a-zA-Z0-9_\-X]{10,})["']/gi,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "Hardcoded API Key", description: "API key found in source code",
                fix: "Move API key to environment variables", fixTime: "30 min"
            },
            // Any assignment with "key" or "secret" in variable name
            {
                regex: /(?:const|let|var)\s+\w*(?:key|secret|token|password)\w*\s*=\s*["']([a-zA-Z0-9_\-X]{10,})["']/gi,
                type: "Potential Secret", severity: "High" as const,
                name: "Potential Hardcoded Secret", description: "Variable with secret-like name",
                fix: "Verify and move to environment variables if needed", fixTime: "15 min"
            },
            // Any long string that looks like a secret
            {
                regex: /["']([A-Za-z0-9+/]{40,}={0,2})["']/g,
                type: "Potential Secret", severity: "Medium" as const,
                name: "Potential Secret String", description: "Long base64-like string detected",
                fix: "Verify if this is a secret and move to env vars", fixTime: "15 min"
            },
            // AWS Keys
            {
                regex: /AKIA[0-9A-Z]{16}/g,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "AWS Access Key", description: "AWS access key exposed in code",
                fix: "Remove AWS key and use IAM roles", fixTime: "1 hr"
            },
            // Google API Keys - More lenient pattern
            {
                regex: /AIza[0-9A-Za-z\-_X]{20,}/g,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "Google API Key", description: "Google API key exposed",
                fix: "Remove and use environment variables", fixTime: "30 min"
            },
            // GitHub Tokens
            {
                regex: /gh[ps]_[a-zA-Z0-9]{36,}/g,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "GitHub Token", description: "GitHub personal access token exposed",
                fix: "Revoke token and use secrets management", fixTime: "1 hr"
            },
            // Private Keys
            {
                regex: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "Private Key Exposure", description: "Private cryptographic key found",
                fix: "Remove private key and use secure key management", fixTime: "2 hr"
            },
            // SQL Injection - More patterns
            {
                regex: /(?:execute|query|exec|sql)\s*\(\s*["'`].*?\$\{|(?:execute|query|exec|sql)\s*\(\s*.*?\+/gi,
                type: "SQL Injection", severity: "Critical" as const,
                name: "Potential SQL Injection", description: "SQL query with string concatenation",
                fix: "Use parameterized queries", fixTime: "1 hr"
            },
            // NoSQL Injection
            {
                regex: /\$where|mapReduce|group\s*\(/gi,
                type: "NoSQL Injection", severity: "High" as const,
                name: "Potential NoSQL Injection", description: "Unsafe NoSQL query operators",
                fix: "Sanitize input and avoid $where", fixTime: "1 hr"
            },
            // XSS - innerHTML
            {
                regex: /\.innerHTML\s*=/gi,
                type: "XSS", severity: "High" as const,
                name: "Cross-Site Scripting (XSS)", description: "Unsafe innerHTML usage",
                fix: "Use textContent or sanitize with DOMPurify", fixTime: "30 min"
            },
            // XSS - dangerouslySetInnerHTML
            {
                regex: /dangerouslySetInnerHTML/gi,
                type: "XSS", severity: "High" as const,
                name: "Dangerous HTML Injection", description: "React dangerouslySetInnerHTML detected",
                fix: "Sanitize HTML or use safe alternatives", fixTime: "1 hr"
            },
            // XSS - document.write
            {
                regex: /document\.write/gi,
                type: "XSS", severity: "High" as const,
                name: "Unsafe document.write", description: "document.write can cause XSS",
                fix: "Use safer DOM manipulation methods", fixTime: "30 min"
            },
            // Command Injection
            {
                regex: /(?:exec|spawn|execSync|spawnSync|execFile)\s*\(/gi,
                type: "Command Injection", severity: "High" as const,
                name: "Command Execution", description: "Shell command execution detected",
                fix: "Validate input and use safe alternatives", fixTime: "2 hr"
            },
            // eval() usage
            {
                regex: /\beval\s*\(/gi,
                type: "Code Injection", severity: "High" as const,
                name: "Unsafe eval() Usage", description: "eval() can execute arbitrary code",
                fix: "Remove eval() and use JSON.parse()", fixTime: "1 hr"
            },
            // Hardcoded passwords
            {
                regex: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"'$]{6,})["']/gi,
                type: "Hardcoded Secret", severity: "High" as const,
                name: "Hardcoded Password", description: "Password in source code",
                fix: "Move to environment variables", fixTime: "30 min"
            },
            // JWT tokens
            {
                regex: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g,
                type: "Hardcoded Secret", severity: "Critical" as const,
                name: "Exposed JWT Token", description: "JWT token in source code",
                fix: "Remove token and use secure management", fixTime: "1 hr"
            },
            // Weak crypto
            {
                regex: /Math\.random\(\)/gi,
                type: "Weak Random", severity: "Medium" as const,
                name: "Weak Random Generation", description: "Math.random() not cryptographically secure",
                fix: "Use crypto.randomBytes()", fixTime: "30 min"
            },
            // Missing input validation
            {
                regex: /req\.(body|query|params)\.\w+(?!\s*&&|\s*\|\||\s*\?)/gi,
                type: "Missing Input Validation", severity: "Medium" as const,
                name: "Unvalidated User Input", description: "User input used without validation",
                fix: "Add input validation and sanitization", fixTime: "30 min"
            },
            // Sensitive data logging
            {
                regex: /console\.log\s*\([^)]*(?:password|token|secret|key|credential)[^)]*\)/gi,
                type: "Information Disclosure", severity: "Medium" as const,
                name: "Sensitive Data Logging", description: "Logging sensitive information",
                fix: "Remove sensitive data from logs", fixTime: "15 min"
            },
            // Insecure HTTP
            {
                regex: /["']http:\/\//gi,
                type: "Insecure HTTP", severity: "Low" as const,
                name: "Insecure HTTP Usage", description: "Using HTTP instead of HTTPS",
                fix: "Use HTTPS for all connections", fixTime: "15 min"
            },
            // CORS wildcard
            {
                regex: /Access-Control-Allow-Origin.*\*/gi,
                type: "CORS Misconfiguration", severity: "Medium" as const,
                name: "Permissive CORS Policy", description: "CORS allows all origins",
                fix: "Restrict CORS to specific origins", fixTime: "30 min"
            },
            // Disabled security features
            {
                regex: /helmet\(\s*\{[^}]*contentSecurityPolicy:\s*false/gi,
                type: "Missing Security Headers", severity: "Medium" as const,
                name: "Disabled Security Headers", description: "Security headers disabled",
                fix: "Enable security headers", fixTime: "15 min"
            }
        ];

        // Scan each line
        lines.forEach((line, lineNum) => {
            patterns.forEach(pattern => {
                const matches = line.matchAll(pattern.regex);
                for (const match of matches) {
                    findings.push({
                        type: pattern.type,
                        name: pattern.name,
                        severity: pattern.severity,
                        location: `${filePath}:${lineNum + 1}`,
                        description: pattern.description,
                        fix: pattern.fix,
                        fixTime: pattern.fixTime,
                        detailedAnalysis: `Found in line ${lineNum + 1}`,
                        codeSnippet: line.trim().substring(0, 100)
                    });
                }
            });
        });

        return findings;
    }

    static async scanRepository(token: string, owner: string, repo: string): Promise<ScanResult> {
        console.log("🔍 Running local pattern-based security scan...");

        try {
            const scanner = new ScannerService();

            // Fetch repository files
            const files = await (scanner as any).fetchRepoFiles(token, owner, repo);
            console.log(`Found ${files.length} files to scan`);

            const findings: Finding[] = [];
            let scannedFiles = 0;

            // Scan up to 50 files
            for (const file of files.slice(0, 50)) {
                try {
                    const { path, content } = await (scanner as any).fetchFileContent(token, owner, repo, file.path);
                    scannedFiles++;

                    const fileFindings = this.detectVulnerabilities(path, content);
                    findings.push(...fileFindings);
                } catch (error) {
                    console.error(`Error scanning ${file.path}:`, error);
                }
            }

            console.log(`✅ Local scan complete: ${findings.length} findings in ${scannedFiles} files`);

            const summary = `${findings.filter(f => f.severity === "Critical").length} Critical, ${findings.filter(f => f.severity === "High").length} High, ${findings.filter(f => f.severity === "Medium").length} Medium, ${findings.filter(f => f.severity === "Low").length} Low vulnerabilities found (Local Scan)`;

            return {
                findings,
                summary
            };
        } catch (error) {
            console.error("Local scan error:", error);
            return {
                findings: [],
                summary: "Local scan failed"
            };
        }
    }
}
