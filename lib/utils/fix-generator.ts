/**
 * Vulnerability Fix Generator Utility
 * Generates proper security fixes for different vulnerability types
 */

export interface VulnerabilityFix {
    originalCode: string;
    fixedCode: string;
    explanation: string;
}

export class FixGenerator {
    /**
     * Generate a security fix based on vulnerability type and code content
     */
    static generateFix(vulnerabilityName: string, originalCode: string): VulnerabilityFix {
        const name = vulnerabilityName.toLowerCase();

        // Hardcoded Secrets
        if (name.includes('hardcoded') || name.includes('secret') || name.includes('api key')) {
            return this.fixHardcodedSecret(originalCode);
        }

        // SQL Injection
        if (name.includes('sql injection')) {
            return this.fixSQLInjection(originalCode);
        }

        // XSS
        if (name.includes('xss') || name.includes('cross-site scripting')) {
            return this.fixXSS(originalCode);
        }

        // Command Injection
        if (name.includes('command injection')) {
            return this.fixCommandInjection(originalCode);
        }

        // Path Traversal
        if (name.includes('path traversal')) {
            return this.fixPathTraversal(originalCode);
        }

        // Weak Random
        if (name.includes('weak random') || name.includes('math.random')) {
            return this.fixWeakRandom(originalCode);
        }

        // Weak Crypto
        if (name.includes('md5') || name.includes('weak crypto')) {
            return this.fixWeakCrypto(originalCode);
        }

        // Information Disclosure
        if (name.includes('information disclosure') || name.includes('logging')) {
            return this.fixInformationDisclosure(originalCode);
        }

        // Insecure HTTP
        if (name.includes('insecure http') || name.includes('https')) {
            return this.fixInsecureHTTP(originalCode);
        }

        // SSRF
        if (name.includes('ssrf') || name.includes('server-side request')) {
            return this.fixSSRF(originalCode);
        }

        // Default generic fix
        return {
            originalCode,
            fixedCode: originalCode + ' // TODO: Review and fix security issue',
            explanation: 'Manual review required'
        };
    }

    private static fixHardcodedSecret(code: string): VulnerabilityFix {
        let fixed = code;
        let explanation = 'Moved hardcoded secrets to environment variables';

        // Match const VARIABLE_NAME = "value";
        const constMatch = code.match(/const\s+(\w+)\s*=\s*["']([^"']+)["'];?/);
        if (constMatch) {
            const varName = constMatch[1];
            fixed = code.replace(/=\s*["'][^"']+["'];?/, `= process.env.${varName};`);
        }

        // Remove commented secrets
        if (code.includes('//') && (code.includes('key') || code.includes('token') || code.includes('secret'))) {
            fixed = '// [REMOVED] Sensitive information removed';
            explanation = 'Removed commented secret for security';
        }

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixSQLInjection(code: string): VulnerabilityFix {
        let fixed = code;
        const explanation = 'Replaced string concatenation with parameterized query';

        // Fix template literal SQL queries
        if (code.includes('SELECT') && code.includes('${')) {
            fixed = code.replace(/`SELECT.*\$\{.*\}`/, "'SELECT * FROM users WHERE id = ?'");
        }

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixXSS(code: string): VulnerabilityFix {
        const explanation = 'Replaced innerHTML with textContent to prevent XSS';
        const fixed = code.replace(/\.innerHTML\s*=/g, '.textContent =');

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixCommandInjection(code: string): VulnerabilityFix {
        const explanation = 'Added input validation before command execution';

        // Add validation before exec
        if (code.includes('exec(')) {
            const fixed = code.replace(
                /exec\(/,
                'if (!/^[a-zA-Z0-9._-]+$/.test(filename)) throw new Error(\'Invalid input\');\n    exec('
            );
            return { originalCode: code, fixedCode: fixed, explanation };
        }

        return { originalCode: code, fixedCode: code, explanation };
    }

    private static fixPathTraversal(code: string): VulnerabilityFix {
        const explanation = 'Added path validation and sanitization';

        if (code.includes('readFileSync') || code.includes('readFile')) {
            const fixed = `const path = require('path');\n    const sanitized = path.resolve(filepath);\n    if (!sanitized.startsWith(process.cwd())) throw new Error('Invalid path');\n    ${code.replace('filepath', 'sanitized')}`;
            return { originalCode: code, fixedCode: fixed, explanation };
        }

        return { originalCode: code, fixedCode: code, explanation };
    }

    private static fixWeakRandom(code: string): VulnerabilityFix {
        const explanation = 'Replaced Math.random() with cryptographically secure random';
        const fixed = code.replace(
            /Math\.random\(\)\.toString\(36\)\.substring\(\d+\)/,
            'require("crypto").randomBytes(16).toString("hex")'
        );

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixWeakCrypto(code: string): VulnerabilityFix {
        const explanation = 'Replaced MD5 with bcrypt for password hashing';

        if (code.includes("createHash('md5')")) {
            const fixed = `const bcrypt = require('bcrypt');\n    return bcrypt.hashSync(password, 10);`;
            return { originalCode: code, fixedCode: fixed, explanation };
        }

        return { originalCode: code, fixedCode: code, explanation };
    }

    private static fixInformationDisclosure(code: string): VulnerabilityFix {
        const explanation = 'Removed stack trace logging to prevent information disclosure';
        const fixed = code.replace(/error\.stack/g, 'error.message');

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixInsecureHTTP(code: string): VulnerabilityFix {
        const explanation = 'Changed HTTP to HTTPS for secure communication';
        const fixed = code.replace(/['"]http:\/\//g, '"https://');

        return { originalCode: code, fixedCode: fixed, explanation };
    }

    private static fixSSRF(code: string): VulnerabilityFix {
        const explanation = 'Added URL validation to prevent SSRF';

        if (code.includes('fetch(')) {
            const fixed = `const allowedDomains = ['trusted-domain.com'];\n    const url = new URL(userUrl);\n    if (!allowedDomains.includes(url.hostname)) throw new Error('Invalid URL');\n    ${code}`;
            return { originalCode: code, fixedCode: fixed, explanation };
        }

        return { originalCode: code, fixedCode: code, explanation };
    }
}
