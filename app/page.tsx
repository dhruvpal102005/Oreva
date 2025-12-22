"use client";

import { ChevronDown, Globe, ArrowDown, Shield, Cloud, Code, Lock, Key, Container, FileText, AlertTriangle, Server, Cpu, Layers, CheckCircle, Bell, GitMerge, Filter, Ban, Wand2, FileBarChart, Home as HomeIcon, Briefcase, BookOpen, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/ui/animated-hero";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";


export default function Home() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const navItems = [
        { name: 'Platform', url: '#platform', icon: HomeIcon },
        { name: 'Solutions', url: '#solutions', icon: Briefcase },
        { name: 'Resources', url: '#resources', icon: BookOpen },
        { name: 'Pricing', url: '#pricing', icon: FileText },
        { name: 'Contact', url: '#contact', icon: Mail }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleDropdown = (menu: string) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#0f1629] to-[#0a0e27]">
            {/* Tubelight Navigation */}
            <NavBar items={navItems} />

            {/* Animated Hero Section */}
            <Hero />

            {/* Product Cards Section */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Oreva/code */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth cursor-pointer group animate-fade-in" style={{ animationDelay: "0.8s" }}>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">O</span>
                                </div>
                                <span className="text-white font-semibold text-lg">Oreva</span>
                                <span className="text-purple-400 font-semibold text-lg">/code</span>
                            </div>
                            <p className="text-white/60 text-sm group-hover:text-white/80 transition-smooth">
                                Secure your source code with automated vulnerability detection and remediation
                            </p>
                        </div>

                        {/* Oreva/cloud */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth cursor-pointer group animate-fade-in" style={{ animationDelay: "1s" }}>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">O</span>
                                </div>
                                <span className="text-white font-semibold text-lg">Oreva</span>
                                <span className="text-purple-400 font-semibold text-lg">/cloud</span>
                            </div>
                            <p className="text-white/60 text-sm group-hover:text-white/80 transition-smooth">
                                Protect your cloud infrastructure with continuous security monitoring
                            </p>
                        </div>

                        {/* Oreva/protect */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth cursor-pointer group animate-fade-in" style={{ animationDelay: "1.2s" }}>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">O</span>
                                </div>
                                <span className="text-white font-semibold text-lg">Oreva</span>
                                <span className="text-purple-400 font-semibold text-lg">/protect</span>
                            </div>
                            <p className="text-white/60 text-sm group-hover:text-white/80 transition-smooth">
                                Runtime application self-protection for production environments
                            </p>
                        </div>

                        {/* Oreva/attack */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth cursor-pointer group animate-fade-in" style={{ animationDelay: "1.4s" }}>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">O</span>
                                </div>
                                <span className="text-white font-semibold text-lg">Oreva</span>
                                <span className="text-purple-400 font-semibold text-lg">/attack</span>
                            </div>
                            <p className="text-white/60 text-sm group-hover:text-white/80 transition-smooth">
                                Offensive security testing to identify vulnerabilities before attackers do
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section - 12-in-1 */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <span className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                            12-in-1 Security Scanners
                        </span>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Sure, you can juggle between multiple security tools with confusing pricing models. Tools that will overload you with irrelevant alerts and false positives.
                        </h2>

                        <div className="flex items-center space-x-4">
                            <ArrowDown className="w-8 h-8 text-white/60" />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Or you could get Oreva
                        </h2>
                    </div>
                </div>
            </section>

            {/* Features Section with Hover Effects */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto mb-12 text-center">
                    <span className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30 mb-6">
                        12-in-1 Security Scanners
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        All your security tools in one platform
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        Replace 12+ security tools with Oreva's comprehensive security suite
                    </p>
                </div>
                <FeaturesSectionWithHoverEffects />
            </section>


            {/* Alert Filtering Section */}
            {/* Alert Filtering Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[#0f1629] to-transparent">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="mb-8">
                        <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30">
                            Features
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                        Only get alerts <Bell className="inline-block w-12 h-12 text-white mx-2" /> that matter to{" "}
                        <span className="gradient-text">your risk tolerance.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-white/70 mb-16">
                        We've been there, sifting through hundreds of security alerts,
                        <br />
                        only a few that actually matter.
                    </p>

                    <div className="mb-16">
                        <ArrowDown className="w-12 h-12 text-white/60 mx-auto mb-6" />
                        <p className="text-2xl md:text-3xl text-white font-medium mb-12">
                            We'll take the sifting off your hands and notify you when it matters.
                        </p>

                        {/* Sifting Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {/* Deduplication */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <GitMerge className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Deduplication</h3>
                                <p className="text-white/60">
                                    Groups related issues so you can quickly solve as many issues as possible.
                                </p>
                            </div>

                            {/* AutoTriage */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <Filter className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">AutoTriage</h3>
                                <p className="text-white/60">
                                    Analyzes & monitors your codebase and infrastructure to automatically filter out issues that don't affect you.
                                </p>
                            </div>

                            {/* Custom Rules */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <Ban className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Custom Rules</h3>
                                <p className="text-white/60">
                                    Set up custom rules to filter out the irrelevant paths, packages etc. You'll still get alerted when there's a critical issue.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16">
                        <ArrowDown className="w-12 h-12 text-white/60 mx-auto mb-6" />
                        <p className="text-2xl md:text-3xl text-white font-medium mb-12">
                            We'll give you the tools you need to fix issues.
                        </p>

                        {/* Fixing Tools Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {/* AutoFix */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <Wand2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">AutoFix</h3>
                                <p className="text-white/60">
                                    Fix issues with Oreva's AI agent. Generate pull requests to fix SAST, IaC, dependency, and container issues - or switch to hardened base images.
                                </p>
                            </div>

                            {/* Bulk Fix */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <Layers className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Bulk Fix with One Click</h3>
                                <p className="text-white/60">
                                    Create ready to merge PRs to solve multiple issues at once. Save hours of development time and ticketing work.
                                </p>
                            </div>

                            {/* TL;DR Summaries */}
                            <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-smooth">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <FileBarChart className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">TL;DR Summaries</h3>
                                <p className="text-white/60">
                                    For more complex issues, get a short summary of the issue and how to fix it. Create a ticket and assign it in one click.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Chat Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition-smooth btn-glow animate-float z-40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        </main>
    );
}
