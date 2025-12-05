import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import { adminDb } from "@/lib/firebase-admin";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
            authorization: {
                params: {
                    scope: "read:user user:email repo",
                },
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("SignIn Callback Triggered");
            if (adminDb && user) {
                console.log("Syncing user to Firestore:", user.id);
                try {
                    await adminDb.collection("users").doc(user.id).set({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        lastLogin: new Date().toISOString(),
                        githubProfile: profile,
                    }, { merge: true });
                    console.log("User synced successfully");
                } catch (error) {
                    console.error("Error syncing user to Firestore", error);
                }
            } else {
                console.warn("Skipping user sync: adminDb or user missing", { adminDb: !!adminDb, user: !!user });
            }
            return true;
        },
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.accessToken = token.accessToken;
            session.user.id = token.id;
            return session;
        },
    },
};
