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

interface FileChange {
    lineNumber: number;
    oldCode: string;
    newCode: string;
}

interface FileFix {
    path: string;
    changes: FileChange[];
}

interface GenerateFixResponse {
    success: boolean;
    files: FileFix[];
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
            return fallbackToPatternFix(vulnerabilityName, fileContent, filePath);
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

            // Craft a detailed prompt for Gemini to generate multi-file fixes
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
Generate a complete security fix that may require changes across multiple files. For example:
- If fixing a security issue that requires a new dependency, include package.json changes
- If adding middleware or configuration, include the necessary config file changes
- If the fix is simple and only needs one file, that's fine too

**CRITICAL: Return ONLY valid JSON in this exact format:**
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "changes": [
        {
          "lineNumber": 10,
          "oldCode": "exact line to be replaced",
          "newCode": "fixed code (can be multiple lines separated by \\\\n)"
        }
      ]
    }
  ],
  "explanation": "Brief explanation of what was fixed and why"
}

**Requirements:**
1. Include ALL files that need changes (source code, package.json, config files, etc.)
2. For each file, specify exact line numbers and code changes
3. Keep changes minimal but complete
4. Return ONLY the JSON, no markdown, no explanations outside the JSON
5. Ensure the JSON is valid and parseable
6. Use double backslash (\\\\n) for newlines in the JSON strings

**Example for adding helmet middleware:**
{
  "files": [
    {
      "path": "backend/index.js",
      "changes": [
        {
          "lineNumber": 4,
          "oldCode": "const app = express();",
          "newCode": "const helmet = require(\\"helmet\\");\\nconst app = express();\\napp.use(helmet());"
        }
      ]
    },
    {
      "path": "package.json",
      "changes": [
        {
          "lineNumber": 14,
          "oldCode": "  \\"dependencies\\": {",
          "newCode": "  \\"dependencies\\": {\\n    \\"helmet\\": \\"^8.1.0\\","
        }
      ]
    }
  ],
  "explanation": "Added helmet middleware for security headers and updated package.json with the dependency"
}`;

            console.log("🤖 Calling Gemini AI for multi-file fix generation...");

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let responseText = response.text().trim();

            // Clean up the response - remove markdown code blocks if present
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            console.log("📝 LLM Response (first 300 chars):", responseText.substring(0, 300) + "...");

            // Try to parse as JSON
            try {
                const fixData = JSON.parse(responseText);

                // Validate the structure
                if (!fixData.files || !Array.isArray(fixData.files) || fixData.files.length === 0) {
                    throw new Error("Invalid JSON structure - missing files array");
                }

                console.log(`✅ Gemini AI generated fixes for ${fixData.files.length} file(s)`);

                return NextResponse.json({
                    success: true,
                    files: fixData.files,
                    explanation: fixData.explanation || `AI-generated fix for ${vulnerabilityName}`,
                    usedLLM: true
                });

            } catch (parseError) {
                console.warn("⚠️ Failed to parse JSON response, falling back to single-file fix");
                console.warn("Parse error:", parseError);

                // Fallback: treat the response as a single code fix
                const fixedCode = responseText.replace(/```[\w]*\n?/g, '').trim();

                // Extract just the file name from the full path
                const fileName = filePath.split('|')[1]?.trim() || filePath.split('/').pop() || filePath;

                return NextResponse.json({
                    success: true,
                    files: [{
                        path: fileName,
                        changes: [{
                            lineNumber: targetLine,
                            oldCode: vulnerableLine,
                            newCode: fixedCode
                        }]
                    }],
                    explanation: `AI-generated fix for ${vulnerabilityName}`,
                    usedLLM: true
                });
            }

        } catch (llmError: any) {
            console.error("❌ Gemini AI error:", llmError.message);
            // Fall back to pattern-based fix on LLM error
            return fallbackToPatternFix(vulnerabilityName, fileContent, filePath);
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
function fallbackToPatternFix(vulnerabilityName: string, code: string, filePath: string): NextResponse {
    const fix = FixGenerator.generateFix(vulnerabilityName, code);

    // Extract just the file name from the full path
    const fileName = filePath.split('|')[1]?.trim() || filePath.split('/').pop() || filePath;

    return NextResponse.json({
        success: true,
        files: [{
            path: fileName,
            changes: [{
                lineNumber: 1,
                oldCode: fix.originalCode,
                newCode: fix.fixedCode
            }]
        }],
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
