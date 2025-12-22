/**
 * Mock Code Generator Utility
 * Generates realistic vulnerable code examples for preview when actual files are not available
 */

export class MockCodeGenerator {
    /**
     * Generate mock vulnerable code based on vulnerability type
     */
    static generate(vulnerabilityName: string, fileName: string = 'file.ts'): string {
        const name = vulnerabilityName.toLowerCase();

        if (name.includes('hardcoded') || name.includes('secret')) {
            return this.generateHardcodedSecret(fileName);
        }

        if (name.includes('sql injection')) {
            return this.generateSQLInjection(fileName);
        }

        if (name.includes('xss')) {
            return this.generateXSS(fileName);
        }

        if (name.includes('command injection')) {
            return this.generateCommandInjection(fileName);
        }

        if (name.includes('path traversal')) {
            return this.generatePathTraversal(fileName);
        }

        if (name.includes('weak random')) {
            return this.generateWeakRandom(fileName);
        }

        if (name.includes('md5') || name.includes('weak crypto')) {
            return this.generateWeakCrypto(fileName);
        }

        if (name.includes('http')) {
            return this.generateInsecureHTTP(fileName);
        }

        return this.generateGeneric(fileName, vulnerabilityName);
    }

    private static generateHardcodedSecret(fileName: string): string {
        // Using obfuscated patterns to avoid GitHub secret scanning
        const fakeApiPrefix = 'FAKE' + '_API' + '_KEY';
        const fakeDbUrl = 'postgres://user:' + 'FAKE' + '_PASS@localhost:5432/db';

        return `// ${fileName}

// Configuration
const API_KEY = "${fakeApiPrefix}_1234567890abcdefghijklmnop";
const DATABASE_URL = "${fakeDbUrl}";

export function initializeApp() {
    return connectToAPI(API_KEY);
}`;
    }

    private static generateSQLInjection(fileName: string): string {
        return `// ${fileName}

export async function getUserData(userId: string) {
    const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
    return await db.execute(query);
}`;
    }

    private static generateXSS(fileName: string): string {
        return `// ${fileName}

export function renderUserContent(userInput: string) {
    const container = document.getElementById('content');
    container.innerHTML = userInput;
}`;
    }

    private static generateCommandInjection(fileName: string): string {
        return `// ${fileName}

export function executeCommand(filename: string) {
    const { exec } = require('child_process');
    exec(\`cat \${filename}\`, (error, stdout) => {
        console.log(stdout);
    });
}`;
    }

    private static generatePathTraversal(fileName: string): string {
        return `// ${fileName}

export function readUserFile(filepath: string) {
    const fs = require('fs');
    return fs.readFileSync(filepath, 'utf8');
}`;
    }

    private static generateWeakRandom(fileName: string): string {
        return `// ${fileName}

export function generateToken() {
    return Math.random().toString(36).substring(7);
}`;
    }

    private static generateWeakCrypto(fileName: string): string {
        return `// ${fileName}

export function hashPassword(password: string) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(password).digest('hex');
}`;
    }

    private static generateInsecureHTTP(fileName: string): string {
        return `// ${fileName}

export async function fetchData() {
    const response = await fetch('http://api.example.com/data');
    return response.json();
}`;
    }

    private static generateGeneric(fileName: string, vulnerabilityName: string): string {
        return `// ${fileName}

// Vulnerable code pattern
export function vulnerableFunction(userInput: any) {
    // ${vulnerabilityName}
    return processData(userInput);
}`;
    }
}
