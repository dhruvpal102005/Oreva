import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const repoId = searchParams.get("repoId");

        if (!repoId) {
            return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
        }

        if (!adminDb || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        const userId = (session.user as any).id;

        // Get the latest scan for this repository
        const scansSnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("repositories")
            .doc(repoId)
            .collection("scans")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (scansSnapshot.empty) {
            return NextResponse.json({
                success: true,
                scan: null,
                message: "No scans found"
            });
        }

        const latestScan = scansSnapshot.docs[0].data();

        return NextResponse.json({
            success: true,
            scan: latestScan
        });

    } catch (error: any) {
        console.error("Get Scan API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch scan" }, { status: 500 });
    }
}
