"use client";

import { ChevronDown, Globe, ArrowDown, Shield, Cloud, Code, Lock, Key, Container, FileText, AlertTriangle, Server, Cpu, Layers, CheckCircle, Bell, GitMerge, Filter, Ban, Wand2, FileBarChart } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

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
            {/* Navigation - Floating Pill Design */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
                    {/* Logo - Left */}
                    <div className="flex items-center space-x-2 z-10">
                        <Image
                            src="/logo.png"
                            alt="Oreva Logo"
                            width={120}
                            height={40}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Centered Navigation Pill */}
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-1 bg-[#0f1629]/80 backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-purple-900/10' : ''
                        }`}>
                        {/* Platform Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown("platform")}
                                className="flex items-center space-x-1 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth"
                            >
                                <span>Platform</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === "platform" && (
                                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl p-2 animate-fade-in border border-white/10">
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Overview
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Features
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Solutions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown("solutions")}
                                className="flex items-center space-x-1 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth"
                            >
                                <span>Solutions</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === "solutions" && (
                                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl p-2 animate-fade-in border border-white/10">
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Enterprise
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Startups
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Resources Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown("resources")}
                                className="flex items-center space-x-1 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth"
                            >
                                <span>Resources</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === "resources" && (
                                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl p-2 animate-fade-in border border-white/10">
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Documentation
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Blog
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* About Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown("about")}
                                className="flex items-center space-x-1 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth"
                            >
                                <span>About</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === "about" && (
                                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl p-2 animate-fade-in border border-white/10">
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Company
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-smooth">
                                        Team
                                    </a>
                                </div>
                            )}
                        </div>

                        <a href="#" className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth">
                            Pricing
                        </a>
                        <a href="#" className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-full transition-smooth">
                            Contact
                        </a>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center space-x-4 z-10">
                        <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-smooth">
                            <span className="text-sm">EN</span>
                            <Globe className="w-4 h-4" />
                        </button>
                        <button className="text-white/80 hover:text-white transition-smooth text-sm font-medium">
                            Login
                        </button>
                        <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-500 hover:to-purple-600 transition-smooth btn-glow text-sm font-medium">
                            Start for Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
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
                        <Link href="/login">
                            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-500 hover:to-purple-600 transition-smooth btn-glow font-semibold text-lg">
                                Start for Free
                            </button>
                        </Link>
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

            {/* Features Grid - All 15 Features */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[#0a0e27] to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 - SCA */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">1</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                    One-Click Autofix
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Open source dependency scanning (SCA)
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Continuously monitors your code for known vulnerabilities, CVE-s and other risks or outdated SBOMs.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Snyk</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">GitHub Advanced Security</span>
                            </div>
                        </div>

                        {/* Feature 2 - CSPM */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Cloud className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">2</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                    One-Click Autofix
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Cloud posture management (CSPM)
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Detects cloud infrastructure risks (misconfigurations, VMs, Container images) across major cloud providers.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Wiz</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Orca Security</span>
                            </div>
                        </div>

                        {/* Feature 3 - SAST */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Code className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">3</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                    AI Autofix
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Static code analysis (SAST)
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Scans your source code for security risks before an issue can be merged.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Veracode</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Semgrep</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Checkmarx</span>
                            </div>
                        </div>

                        {/* Feature 4 - DAST */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">4</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Surface monitoring (DAST)
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Dynamically tests your web app's front-end & APIs to find vulnerabilities through simulated attacks.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Stackhawk</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Intruder</span>
                            </div>
                        </div>

                        {/* Feature 5 - Secrets Detection */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Key className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">5</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Secrets detection
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Checks your code for leaked and exposed API keys, passwords, certificates, encryption keys, etc.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">GitGuardian</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Gitleaks</span>
                            </div>
                        </div>

                        {/* Feature 6 - IaC Scanning */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Server className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">6</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                    AI Autofix
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Infrastructure as code scanning (IaC)
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Scans Terraform, CloudFormation & Kubernetes infrastructure-as-code for misconfigurations.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Bridgecrew</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Wiz Code</span>
                            </div>
                        </div>

                        {/* Feature 7 - Container Image Scanning */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Container className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">7</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                    AI Autofix
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Container image scanning
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Scans your container OS for packages with security issues.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Snyk</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Docker Scout</span>
                            </div>
                        </div>

                        {/* Feature 8 - License Scanning */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">8</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Open source license scanning
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Monitors your licenses for risks such as dual licensing, restrictive terms, bad reputation, etc.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Black Duck</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Mend</span>
                            </div>
                        </div>

                        {/* Feature 9 - Malware Detection */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">9</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Malware detection in dependencies
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Prevents malicious packages from infiltrating your software supply chain. Powered by Oreva Intel.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Socket</span>
                            </div>
                        </div>

                        {/* Feature 10 - Outdated Software */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">10</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Outdated Software
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Checks if any frameworks & runtimes you are using are no longer maintained.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Manual Work</span>
                            </div>
                        </div>

                        {/* Feature 11 - VM Scanning */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Cpu className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">11</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Virtual Machine Scanning
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Scans your virtual machines for vulnerable packages, outdated runtimes and risky licenses.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Orca Security</span>
                            </div>
                        </div>

                        {/* Feature 12 - K8s Runtime Security */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="text-white/40 text-sm">12</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Kubernetes Runtime Security
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Identify vulnerable images, see the impacted containers, assess their reachability.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Wiz</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Sysdig</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Armo</span>
                            </div>
                        </div>

                        {/* Feature 13 - Runtime Protection */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-white/40 text-sm">13</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Runtime Protection
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Zero-day & in-app firewall for peace of mind. Auto-block injection attacks, introduce API rate limiting & more.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Contrast Security</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Oligo Security</span>
                            </div>
                        </div>

                        {/* Feature 14 - Code Quality */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-white/40 text-sm">14</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Code Quality
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Ship clean code faster with AI code review. Automatically review code for bug risks, anti-patterns, and quality issues.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Sonar.be</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Code Climate</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Codacy</span>
                            </div>
                        </div>

                        {/* Feature 15 - Autonomous Pentests */}
                        <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-smooth">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-white/40 text-sm">15</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Autonomous Pentests
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Automatic penetrating testing with AI agents that simulate hacker intrusion & find vulnerabilities before exploit.
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                    Replaces
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Cobalt</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Synack</span>
                                <span className="px-3 py-1 glass text-white/80 text-xs rounded-lg border border-white/10">Manual Testing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
