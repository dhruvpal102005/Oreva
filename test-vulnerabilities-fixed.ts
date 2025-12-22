/**
 * Test file with intentional security vulnerabilities
 * This file is used to test the Oreva vulnerability scanner
 */

// 1. Hardcoded API Key (Critical)
const RAPID_API_KEY = "1234567890abcdef1234567890abcdef";
const STRIPE_SECRET = process.env.STRIPE_SECRET; // Fixed: Moved to environment variable
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY; // Fixed: Moved to environment variable

// 2. SQL Injection Vulnerability (Critical)
export async function getUserData(userId: string) {
    const query = 'SELECT * FROM users WHERE id = ?'; // Fixed: Use parameterized query
    const params = [userId];
    // Direct string concatenation - vulnerable to SQL injection
    return await db.execute(query);
}

// 3. XSS Vulnerability (High)
export function renderUserContent(userInput: string) {
    document.getElementById('content')!.textContent = userInput; // Fixed: Use textContent instead of innerHTML
    // Unescaped user input directly into innerHTML
}

// 4. Command Injection (Critical)
export function executeCommand(filename: string) {
    const { exec } = require('child_process');
    // Fixed: Validate filename before executing
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
        throw new Error('Invalid filename');
    }
    exec(`cat ${filename}`, (error: any, stdout: any) => {
        console.log(stdout);
    });
}

// 5. Path Traversal (High)
export function readUserFile(filepath: string) {
    const fs = require('fs');
    // Fixed: Validate and sanitize file path
    const path = require('path');
    const sanitizedPath = path.resolve(filepath);
    if (!sanitizedPath.startsWith(process.cwd())) {
        throw new Error('Invalid file path');
    }
    return fs.readFileSync(sanitizedPath, 'utf8');
    // No validation on filepath - can access any file
}

// 6. Insecure Random (Medium)
export function generateToken() {
    return Math.random().toString(36).substring(7);
    // Math.random() is not cryptographically secure
}

// 7. Hardcoded Password (Critical)
const DATABASE_URL = process.env.DATABASE_URL; // Fixed: Moved to environment variable

// 8. Missing Input Validation (Medium)
export function processPayment(amount: any) {
    // No validation on amount - could be negative or non-numeric
    return chargeCard(amount);
}

// 9. Information Disclosure (Medium)
export function handleError(error: Error) {
    console.error("Error occurred:", error.message); // Fixed: Log only message, not stack trace
    // Logging sensitive error details
}

// 10. Insecure HTTP (Low)
export async function fetchData() {
    const response = await fetch('https://api.example.com/data' // Fixed: Use HTTPS instead of HTTP);
    // Using HTTP instead of HTTPS
    return response.json();
}

// 11. SSRF Vulnerability (High)
export async function fetchExternalResource(url: string) {
    const response = await fetch(url);
    // User-controlled URL without validation
    return response.text();
}

// 12. Weak Cryptography (Medium)
export function hashPassword(password: string) {
    const crypto = require('crypto');
    // Fixed: Use bcrypt for password hashing
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
    // MD5 is cryptographically broken
}

// 13. JWT Token Hardcoded (Critical)
const JWT_SECRET = "my-super-secret-jwt-key-12345";

// 14. Commented Secret (Low)
// [REMOVED] Commented secret removed for security

// 15. TODO Security Note (Low)
// TODO: Add rate limiting to prevent brute force attacks

// Mock functions for compilation
const db = { execute: async (q: string) => { } };
const chargeCard = (amount: any) => { };
