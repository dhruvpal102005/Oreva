"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Users, Layout, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function WorkspaceSelection() {
    return (
        <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 md:p-8 relative">

            {/* Logout Button */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="px-4 py-2 bg-[#1a1f36] hover:bg-[#252b48] text-white/70 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                    <span>Logout</span>
                </button>
            </div>

            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                {/* Left Side - Info Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 w-full flex flex-col justify-between shadow-2xl min-h-[600px]">
                    <div>
                        <div className="flex items-center space-x-2 mb-12">
                            <Image
                                src="/logo.png"
                                alt="Oreva Logo"
                                width={120}
                                height={40}
                                className="h-8 w-auto object-contain invert"
                                priority
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[#0a0e27] mb-8 leading-tight">
                            Create a workspace, join one, or check out the sample repo
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Connecting to your GitHub will allow you to create or join an org you're a member of or create a personal workspace with your own repos. You'll choose which repos we can monitor in the next step.
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-12">
                        <div className="flex space-x-2">
                            <div className="h-2 flex-1 bg-[#6366f1] rounded-full"></div>
                            <div className="h-2 flex-1 bg-gray-200 rounded-full"></div>
                            <div className="h-2 flex-1 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Options */}
                <div className="flex flex-col space-y-6 justify-center">

                    {/* Create Workspace Card */}
                    <div className="bg-[#0f1629]/50 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/60 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <Github className="w-8 h-8 text-white mb-4" />
                            <h3 className="text-white font-bold text-xl mb-2">Create a new workspace</h3>
                            <p className="text-white/60 text-sm mb-6 leading-relaxed">
                                Let's get your repositories or organization connected and security ready. You decide and control which repos and orgs you want to grant us access to.
                            </p>
                            {/* Replace with your GitHub App Installation URL */}
                            <a href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/YOUR_APP_NAME/installations/new"}>
                                <button className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
                                    Create A Workspace
                                </button>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Join Team Card */}
                        <div className="bg-[#0f1629]/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-[#0f1629]/80 transition-all">
                            <Users className="w-6 h-6 text-white mb-4" />
                            <h3 className="text-white font-bold text-lg mb-2">Join your team</h3>
                            <p className="text-white/60 text-xs mb-6 leading-relaxed">
                                Let's check which orgs or repos you have access to that are already set up in Oreva.
                            </p>
                            <Link href="/dashboard">
                                <button className="px-6 py-3 bg-[#1a1f36] hover:bg-[#252b48] text-white rounded-xl font-semibold text-sm transition-all w-full">
                                    Join My Team
                                </button>
                            </Link>
                        </div>

                        {/* Demo Workspace Card */}
                        <div className="bg-[#0f1629]/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-[#0f1629]/80 transition-all">
                            <Layout className="w-6 h-6 text-white mb-4" />
                            <h3 className="text-white font-bold text-lg mb-2">Use demo workspace</h3>
                            <p className="text-white/60 text-xs mb-6 leading-relaxed">
                                We built a repo to test-drive Oreva without needing to connect your own repos.
                            </p>
                            <Link href="/dashboard">
                                <button className="px-6 py-3 bg-[#1a1f36] hover:bg-[#252b48] text-white rounded-xl font-semibold text-sm transition-all w-full">
                                    Use Demo Workspace
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center">
                        <button className="text-white/40 hover:text-white text-xs transition-colors">
                            or, connect other Git provider
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
