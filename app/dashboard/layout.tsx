"use client";

import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Box,
    Cloud,
    Globe,
    Shield,
    Code,
    Zap,
    Settings,
    LogOut,
    ChevronDown,
    Search,
    FileText,
    Bell,
    Inbox
} from "lucide-react";
import { usePrefetchData } from "@/hooks/usePrefetchData";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Prefetch all data immediately on mount
    const { isLoading } = usePrefetchData();

    useEffect(() => {
        console.log('Dashboard data prefetching:', isLoading ? 'loading...' : 'complete');
    }, [isLoading]);
    return (
        <div className="min-h-screen bg-[#f8f9fc] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0e27] text-white flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 flex items-center space-x-2">
                    <Image
                        src="/logo.png"
                        alt="Oreva Logo"
                        width={100}
                        height={32}
                        className="h-8 w-auto object-contain invert"
                        priority
                    />
                </div>

                {/* User Dropdown */}
                <div className="px-4 mb-6">
                    <button className="w-full bg-[#1a1f36] hover:bg-[#252b48] text-left px-4 py-2 rounded-lg flex items-center justify-between transition-colors">
                        <span className="text-sm font-medium truncate">dhruvpal102005</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-6">

                    {/* Feed */}
                    <div>
                        <Link href="/dashboard/feed" className="flex items-center space-x-3 px-2 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <Inbox className="w-5 h-5" />
                            <span className="font-medium">Feed</span>
                        </Link>
                        <div className="space-y-1 mt-2">
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors">
                                <span>Snoozed</span>
                            </Link>
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors">
                                <span>Ignored</span>
                                <span className="bg-[#6366f1] text-white text-[10px] px-1.5 py-0.5 rounded-full">46</span>
                            </Link>
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors">
                                <span>Solved</span>
                                <span className="bg-[#6366f1] text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
                            </Link>
                        </div>
                    </div>

                    {/* AutoFix */}
                    <div>
                        <Link href="/dashboard/autofix" className="flex items-center space-x-3 px-2 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <Zap className="w-5 h-5" />
                            <span className="font-medium">AutoFix</span>
                        </Link>
                    </div>

                    {/* Main Nav */}
                    <div className="space-y-1">
                        <Link href="/dashboard" className="flex items-center justify-between px-2 py-2 bg-white/10 text-white rounded-md transition-colors">
                            <div className="flex items-center space-x-3">
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Repositories</span>
                            </div>
                            <span className="text-xs text-gray-400">35</span>
                        </Link>
                        <Link href="#" className="flex items-center justify-between px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <div className="flex items-center space-x-3">
                                <Box className="w-5 h-5" />
                                <span className="font-medium">Containers</span>
                            </div>
                            <span className="text-xs text-gray-400">0</span>
                        </Link>
                        <Link href="#" className="flex items-center justify-between px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <div className="flex items-center space-x-3">
                                <Cloud className="w-5 h-5" />
                                <span className="font-medium">Clouds</span>
                            </div>
                            <span className="text-xs text-gray-400">0</span>
                        </Link>
                        <Link href="#" className="flex items-center justify-between px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <div className="flex items-center space-x-3">
                                <Globe className="w-5 h-5" />
                                <span className="font-medium">Domains & APIs</span>
                            </div>
                            <span className="text-xs text-gray-400">0</span>
                        </Link>
                        <Link href="#" className="flex items-center justify-between px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <div className="flex items-center space-x-3">
                                <Shield className="w-5 h-5" />
                                <span className="font-medium">Zen Firewall</span>
                            </div>
                            <span className="text-xs text-gray-400">0</span>
                        </Link>
                    </div>

                    {/* Other Sections */}
                    <div className="space-y-1">
                        <Link href="#" className="flex items-center space-x-3 px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <Code className="w-5 h-5" />
                            <span className="font-medium">Code Quality</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-3 px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Pentests</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-3 px-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Integrations</span>
                        </Link>
                    </div>

                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                        <span>Get started</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="text-sm text-gray-500">
                        Repositories
                    </div>
                    <div className="flex items-center space-x-6">
                        <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <div className="flex items-center space-x-1 text-gray-500 cursor-pointer hover:text-gray-700">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">Docs</span>
                        </div>
                        <div className="relative cursor-pointer">
                            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1 rounded-full">13</span>
                        </div>
                        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                            {/* Placeholder Avatar */}
                            <Image src="/logo.png" alt="User" width={32} height={32} className="w-full h-full object-cover grayscale" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
