import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Oreva - Secure everything, Compromise nothing",
    description: "Secure your code, cloud, and runtime in one central system. Find and fix vulnerabilities automatically.",
    keywords: ["security", "code security", "cloud security", "runtime protection", "vulnerability scanning"],
    authors: [{ name: "Oreva" }],
    openGraph: {
        title: "Oreva - Secure everything, Compromise nothing",
        description: "Secure your code, cloud, and runtime in one central system.",
        type: "website",
    },
};

import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
