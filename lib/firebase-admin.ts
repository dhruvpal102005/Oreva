import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let adminApp;

if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        try {
            adminApp = initializeApp({
                credential: cert(serviceAccount),
            });
            console.log("Firebase Admin SDK initialized successfully");
        } catch (error) {
            console.error("Firebase Admin SDK initialization failed:", error);
        }
    } else {
        console.warn("Firebase Admin SDK not initialized: Missing FIREBASE_PRIVATE_KEY");
    }
} else {
    adminApp = getApp();
    console.log("Firebase Admin SDK already initialized");
}

const adminDb = adminApp ? getFirestore(adminApp) : null;

if (!adminDb) {
    console.error("Firebase Admin DB is null");
} else {
    console.log("Firebase Admin DB ready");
}

export { adminDb };
