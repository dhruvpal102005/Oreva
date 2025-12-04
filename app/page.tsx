"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";

export default function Home() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const toggleDropdown = (menu: string) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#0f1629] to-[#0a0e27]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">O</span>
                            </div>
                            <span className="text-white text-xl font-semibold">Oreva</span>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {/* Platform Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("platform")}
                                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-smooth"
                                >
                                    <span>Platform</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {openDropdown === "platform" && (
                                    <div className="absolute top-full mt-2 w-48 glass rounded-lg p-2 animate-fade-in">
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Overview
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Features
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Solutions Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("solutions")}
                                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-smooth"
                                >
                                    <span>Solutions</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {openDropdown === "solutions" && (
                                    <div className="absolute top-full mt-2 w-48 glass rounded-lg p-2 animate-fade-in">
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Enterprise
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Startups
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Resources Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("resources")}
                                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-smooth"
                                >
                                    <span>Resources</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {openDropdown === "resources" && (
                                    <div className="absolute top-full mt-2 w-48 glass rounded-lg p-2 animate-fade-in">
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Documentation
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Blog
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* About Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown("about")}
                                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-smooth"
                                >
                                    <span>About</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {openDropdown === "about" && (
                                    <div className="absolute top-full mt-2 w-48 glass rounded-lg p-2 animate-fade-in">
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Company
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-smooth">
                                            Team
                                        </a>
                                    </div>
                                )}
                            </div>

                            <a href="#" className="text-white/80 hover:text-white transition-smooth">
                                Pricing
                            </a>
                            <a href="#" className="text-white/80 hover:text-white transition-smooth">
                                Contact
                            </a>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-smooth">
                                <span className="text-sm">EN</span>
                                <Globe className="w-4 h-4" />
                            </button>
                            <button className="text-white/80 hover:text-white transition-smooth">
                                Login
                            </button>
                            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-500 hover:to-purple-600 transition-smooth btn-glow font-medium">
                                Start for Free
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
                        <span className="gradient-text">Secure everything,</span>
                        <br />
                        <span className="gradient-text">Compromise nothing.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
                        Secure your code, cloud, and runtime in one central system.
                        <br />
                        Find and fix vulnerabilities automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-500 hover:to-purple-600 transition-smooth btn-glow font-semibold text-lg">
                            Start for Free
                        </button>
                        <button className="px-8 py-4 glass text-white rounded-full hover:bg-white/10 transition-smooth font-semibold text-lg border border-white/20">
                            Book a demo
                        </button>
                    </div>

                    <p className="text-sm text-white/50 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                        Trusted by 50K+ orgs • 15B+ results in 30sec
                    </p>
                </div>
            </section>

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

            {/* Floating Chat Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition-smooth btn-glow animate-float">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        </main>
    );
}
