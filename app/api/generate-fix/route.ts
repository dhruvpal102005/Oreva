import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FixGenerator } from "@/lib/utils/fix-generator";

export const dynamic = 'force-dynamic';

interface GenerateFixRequest {
    vulnerabilityName: string;
    vulnerabilityDescription: string;
    severity: string;
    fileContent: string;
    filePath: string;
    lineNumber?: number;
}

interface GenerateFixResponse {
    success: boolean;
    originalCode: string;
    fixedCode: string;
    explanation: string;
    usedLLM: boolean;
    error?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: GenerateFixRequest = await req.json();
        const { vulnerabilityName, vulnerabilityDescription, severity, fileContent, filePath, lineNumber } = body;

        // Validate inputs
        if (!vulnerabilityName || !fileContent) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if Gemini API key is available
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("⚠️ GEMINI_API_KEY not found, falling back to pattern-based fixes");
            return fallbackToPatternFix(vulnerabilityName, fileContent);
        }

        try {
            // Initialize Gemini AI
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Extract the vulnerable line or section
            const lines = fileContent.split('\n');
            const targetLine = lineNumber || findVulnerableLine(lines, vulnerabilityName);
            const startLine = Math.max(0, targetLine - 5);
            const endLine = Math.min(lines.length, targetLine + 5);
            const codeContext = lines.slice(startLine, endLine).join('\n');
            const vulnerableLine = lines[targetLine - 1] || lines[0];

            // Craft a detailed prompt for Gemini
            const prompt = `You are a security expert helping to fix code vulnerabilities.

**Vulnerability Details:**
- Name: ${vulnerabilityName}
- Description: ${vulnerabilityDescription}
- Severity: ${severity}
- File: ${filePath}

**Vulnerable Code:**
\`\`\`
${vulnerableLine}
\`\`\`

**Code Context (surrounding lines):**
\`\`\`
${codeContext}
\`\`\`

**Task:**
Generate a secure fix for this vulnerability. Provide ONLY the fixed version of the vulnerable line(s). 

**Requirements:**
1. Keep the fix minimal - only change what's necessary to fix the security issue
2. Maintain the same code style and formatting
3. Do not add comments or explanations in the code
4. If multiple lines need to be changed, separate them with newlines
5. The fix should be production-ready and follow security best practices

**Output Format:**
Return ONLY the fixed code, nothing else. No markdown, no explanations, just the corrected code.`;

            console.log("🤖 Calling Gemini AI for fix generation...");

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let fixedCode = response.text().trim();

            // Clean up the response - remove markdown code blocks if present
            fixedCode = fixedCode.replace(/```[\w]*\n?/g, '').trim();

            // If the response is too long or seems like an explanation, fall back
            if (fixedCode.length > vulnerableLine.length * 5 || fixedCode.toLowerCase().includes('explanation')) {
                console.warn("⚠️ LLM response seems invalid, falling back to pattern-based fix");
                return fallbackToPatternFix(vulnerabilityName, vulnerableLine);
            }

            console.log("✅ Gemini AI generated fix successfully");

            return NextResponse.json({
                success: true,
                originalCode: vulnerableLine,
                fixedCode: fixedCode,
                explanation: `AI-generated fix for ${vulnerabilityName}`,
                usedLLM: true
            });

        } catch (llmError: any) {
            console.error("❌ Gemini AI error:", llmError.message);
            // Fall back to pattern-based fix on LLM error
            return fallbackToPatternFix(vulnerabilityName, fileContent);
        }

    } catch (error: any) {
        console.error("❌ Generate Fix API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate fix" },
            { status: 500 }
        );
    }
}

// Fallback to pattern-based fix generation
function fallbackToPatternFix(vulnerabilityName: string, code: string): NextResponse {
    const fix = FixGenerator.generateFix(vulnerabilityName, code);

    return NextResponse.json({
        success: true,
        originalCode: fix.originalCode,
        fixedCode: fix.fixedCode,
        explanation: fix.explanation,
        usedLLM: false
    });
}

// Helper function to find the vulnerable line based on vulnerability type
function findVulnerableLine(lines: string[], vulnerabilityName: string): number {
    const name = vulnerabilityName.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (name.includes('hardcoded') || name.includes('secret')) {
            if (line.includes('API_KEY') || line.includes('DATABASE_URL') || line.includes('SECRET')) {
                return i + 1;
            }
        } else if (name.includes('sql injection')) {
            if (line.includes('SELECT') && line.includes('${')) {
                return i + 1;
            }
        } else if (name.includes('xss')) {
            if (line.includes('.innerHTML')) {
                return i + 1;
            }
        } else if (name.includes('command injection')) {
            if (line.includes('exec(') && line.includes('${')) {
                return i + 1;
            }
        } else if (name.includes('path traversal')) {
            if (line.includes('readFileSync') && line.includes('filepath')) {
                return i + 1;
            }
        } else if (name.includes('weak random')) {
            if (line.includes('Math.random()')) {
                return i + 1;
            }
        } else if (name.includes('md5') || name.includes('weak crypto')) {
            if (line.includes("createHash('md5')")) {
                return i + 1;
            }
        } else if (name.includes('http')) {
            if (line.includes("'http://") || line.includes('"http://')) {
                return i + 1;
            }
        }
    }

    return 1; // Default to first line if no match found
}
