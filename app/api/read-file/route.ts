import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const { filePath } = await req.json();

        if (!filePath) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 });
        }

        const projectRoot = process.cwd();

        // Generate list of paths to try
        const pathsToTry: string[] = [];

        // 1. Original path
        pathsToTry.push(filePath);

        // 2. Path without 'src/' prefix if it exists
        if (filePath.startsWith('src/')) {
            pathsToTry.push(filePath.replace(/^src\//, ''));
        }

        // 3. Try alternative extensions (.ts vs .tsx, .js vs .jsx)
        const extensionVariations: Record<string, string[]> = {
            '.tsx': ['.ts'],
            '.ts': ['.tsx'],
            '.jsx': ['.js'],
            '.js': ['.jsx'],
            '.mdx': ['.md'],
            '.md': ['.mdx']
        };

        for (const originalPath of [...pathsToTry]) {
            const ext = path.extname(originalPath);
            if (extensionVariations[ext]) {
                for (const altExt of extensionVariations[ext]) {
                    pathsToTry.push(originalPath.replace(new RegExp(`${ext.replace('.', '\\.')}$`), altExt));
                }
            }
        }

        // Try each path variation
        console.log(`🔍 Trying ${pathsToTry.length} path variations for: ${filePath}`);

        for (const tryPath of pathsToTry) {
            const absolutePath = path.resolve(projectRoot, tryPath);

            // Security check
            if (!absolutePath.startsWith(projectRoot)) {
                continue;
            }

            try {
                const content = await fs.readFile(absolutePath, "utf-8");
                console.log(`✅ Successfully read file: ${tryPath}`);
                return NextResponse.json({ content });
            } catch (error: any) {
                if (error.code !== 'ENOENT') {
                    // If it's not a "file not found" error, throw it
                    throw error;
                }
                // Otherwise, continue to next path
                console.log(`  ❌ Not found: ${tryPath}`);
            }
        }

        // If we get here, none of the paths worked
        console.warn(`⚠️ File not found after trying all variations: ${filePath}`);
        return NextResponse.json({ error: "File not found" }, { status: 404 });

    } catch (error: any) {
        console.error("Error reading file:", error);
        return NextResponse.json({ error: "Failed to read file", details: error.message }, { status: 500 });
    }
}
