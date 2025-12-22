"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Info } from "lucide-react";
import { useState } from "react";

export default function InstallAuthorize() {
    const [selectedOption, setSelectedOption] = useState("all");

    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">

            {/* Header Logo */}
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#161b22] rounded-full flex items-center justify-center mb-4 border border-[#30363d]">
                    <Image
                        src="/logo.png"
                        alt="Oreva Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                </div>
                <h1 className="text-white text-2xl font-normal">
                    Install & Authorize <span className="text-[#58a6ff]">Oreva Security</span>
                </h1>
            </div>

            {/* Main Card */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md w-full max-w-[450px] overflow-hidden">

                {/* Account Header */}
                <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
                    <span className="text-[#c9d1d9] text-sm font-semibold">Install & Authorize on your personal account</span>
                    <div className="w-5 h-5 bg-orange-500 rounded-full"></div> {/* Placeholder for user avatar */}
                </div>

                <div className="p-4">

                    {/* Repository Selection */}
                    <div className="mb-6">
                        <h3 className="text-[#c9d1d9] text-sm mb-3">for these repositories:</h3>

                        <div className="space-y-3">
                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="radio"
                                        name="repos"
                                        value="all"
                                        checked={selectedOption === "all"}
                                        onChange={() => setSelectedOption("all")}
                                        className="peer appearance-none w-4 h-4 border border-[#30363d] rounded-full bg-[#0d1117] checked:bg-[#1f6feb] checked:border-[#1f6feb] focus:ring-2 focus:ring-[#1f6feb]/40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[#c9d1d9] text-sm font-semibold block">All repositories</span>
                                    <span className="text-[#8b949e] text-xs block mt-1">
                                        This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="radio"
                                        name="repos"
                                        value="selected"
                                        checked={selectedOption === "selected"}
                                        onChange={() => setSelectedOption("selected")}
                                        className="peer appearance-none w-4 h-4 border-[#30363d] border rounded-full bg-[#0d1117] checked:bg-[#1f6feb] checked:border-[#1f6feb] focus:ring-2 focus:ring-[#1f6feb]/40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[#c9d1d9] text-sm font-semibold block">Only select repositories</span>
                                    <span className="text-[#8b949e] text-xs block mt-1">
                                        Select at least one repository. Also includes public repositories (read-only).
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-[#30363d] my-4"></div>

                    {/* Permissions */}
                    <div className="mb-6">
                        <h3 className="text-[#c9d1d9] text-sm mb-3">with these permissions:</h3>
                        <div className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-[#3fb950] mt-0.5 shrink-0" />
                            <span className="text-[#8b949e] text-xs">
                                <span className="text-[#c9d1d9] font-semibold">Read</span> access to administration, checks, code, commit statuses, deployments, metadata, and pull requests
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-[#30363d] my-4"></div>

                    {/* User Permissions */}
                    <div className="mb-6">
                        <h3 className="text-[#c9d1d9] text-sm mb-1">User permissions</h3>
                        <p className="text-[#8b949e] text-xs mb-3">
                            Installing and authorizing Oreva Security immediately grants these permissions on your account: <span className="font-semibold text-[#c9d1d9]">dhruv-user</span>
                        </p>
                        <div className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-[#3fb950] mt-0.5 shrink-0" />
                            <span className="text-[#8b949e] text-xs">
                                <span className="text-[#c9d1d9] font-semibold">Read</span> access to email addresses
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-3 mt-8">
                        <button className="w-full py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-semibold text-sm transition-colors border border-[rgba(240,246,252,0.1)] shadow-sm">
                            Install & Authorize
                        </button>
                        <Link href="/onboarding/workspace" className="text-[#58a6ff] text-xs text-center hover:underline">
                            Cancel
                        </Link>
                    </div>

                </div>
            </div>

            <div className="mt-8 text-[#8b949e] text-xs flex items-center space-x-4">
                <span className="hover:text-[#58a6ff] cursor-pointer">Terms</span>
                <span className="hover:text-[#58a6ff] cursor-pointer">Privacy</span>
                <span className="hover:text-[#58a6ff] cursor-pointer">Security</span>
                <span className="hover:text-[#58a6ff] cursor-pointer">Contact GitHub</span>
            </div>

        </div>
    );
}
