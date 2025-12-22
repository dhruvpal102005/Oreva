"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
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
    const pathname = usePathname();

    useEffect(() => {
        console.log('Dashboard data prefetching:', isLoading ? 'loading...' : 'complete');
    }, [isLoading]);
    return (
        <div className="min-h-screen bg-[#f8f9fc] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0e27] text-white flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 flex justify-center items-center">
                    <Image
                        src="/logo.png"
                        alt="Oreva Logo"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain invert"
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
                <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">

                    {/* Feed */}
                    <div>
                        <Link href="/dashboard/feed" className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${pathname.includes('/feed') ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <Inbox className={`w-5 h-5 transition-colors ${pathname.includes('/feed') ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="font-medium">Feed</span>
                        </Link>
                        <div className="space-y-1 mt-2 pl-2 border-l border-white/5 ml-2">
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-3 py-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md text-sm transition-all duration-200">
                                <span>Snoozed</span>
                            </Link>
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-3 py-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md text-sm transition-all duration-200">
                                <span>Ignored</span>
                                <span className="bg-[#6366f1]/20 text-[#6366f1] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#6366f1]/30">46</span>
                            </Link>
                            <Link href="/dashboard/feed" className="flex items-center justify-between px-3 py-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md text-sm transition-all duration-200">
                                <span>Solved</span>
                                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">2</span>
                            </Link>
                        </div>
                    </div>

                    {/* AutoFix */}
                    <div>
                        <Link href="/dashboard/autofix" className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${pathname.includes('/autofix') ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <Zap className={`w-5 h-5 transition-colors ${pathname.includes('/autofix') ? 'text-white' : 'text-yellow-500 group-hover:text-yellow-400'}`} />
                            <span className="font-medium">AutoFix</span>
                        </Link>
                    </div>

                    {/* Main Nav */}
                    <div className="space-y-1">
                        <Link href="/dashboard" className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${pathname === '/dashboard' ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <div className="flex items-center space-x-3">
                                <LayoutDashboard className={`w-5 h-5 transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                <span className="font-medium">Repositories</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${pathname === '/dashboard' ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}`}>35</span>
                        </Link>

                        {[
                            { name: 'Containers', icon: Box, count: 0 },
                            { name: 'Clouds', icon: Cloud, count: 0 },
                            { name: 'Domains & APIs', icon: Globe, count: 0 },
                            { name: 'Zen Firewall', icon: Shield, count: 0 }
                        ].map((item) => (
                            <Link key={item.name} href="#" className="flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group">
                                <div className="flex items-center space-x-3">
                                    <item.icon className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <span className="text-xs bg-gray-800 text-gray-600 px-2 py-0.5 rounded-full group-hover:bg-gray-700 group-hover:text-gray-400 transition-colors">{item.count}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Other Sections */}
                    <div className="space-y-1 pt-4 border-t border-white/5">
                        <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</div>
                        {[
                            { name: 'Code Quality', icon: Code },
                            { name: 'Pentests', icon: Shield },
                            { name: 'Integrations', icon: Settings }
                        ].map((item) => (
                            <Link key={item.name} href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group">
                                <item.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
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
