"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Gitlab, MoreHorizontal, CheckCircle, Lock, ShieldCheck, Database } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Login() {
    return (
        <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 md:p-8">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left Side - Login Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-xl mx-auto lg:mx-0 shadow-2xl">
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-8">
                            <Image
                                src="/logo.png"
                                alt="Oreva Logo"
                                width={120}
                                height={40}
                                className="h-8 w-auto object-contain invert" // Invert to make it dark for white bg if needed, or just use as is if it has color
                                priority
                            />
                        </div>

                        <div className="text-center mb-8">
                            <div className="inline-block mb-4">
                                <Image
                                    src="/one-click.png"
                                    alt="One-click"
                                    width={200}
                                    height={60}
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0a0e27] mb-4">
                                login & sign-up
                            </h1>
                            <p className="text-gray-500 text-lg">
                                Start for free, no credit card required
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => signIn('github', { callbackUrl: '/onboarding/workspace' })}
                                className="w-full py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Github className="w-6 h-6" />
                                <span>GitHub</span>
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-3 border border-gray-200 hover:bg-gray-50 text-[#0a0e27] rounded-xl font-medium flex items-center justify-center space-x-2 transition-all">
                                    {/* Bitbucket Icon Placeholder - using Database as proxy or SVG */}
                                    <Database className="w-5 h-5" />
                                    <span>Bitbucket</span>
                                </button>
                                <button className="py-3 border border-gray-200 hover:bg-gray-50 text-[#0a0e27] rounded-xl font-medium flex items-center justify-center space-x-2 transition-all">
                                    <Gitlab className="w-5 h-5 text-orange-600" />
                                    <span>GitLab</span>
                                </button>
                            </div>

                            <div className="text-center mt-6">
                                <button className="text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium flex items-center justify-center mx-auto space-x-1">
                                    <span>More options</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Features */}
                <div className="hidden lg:block space-y-6 max-w-xl mx-auto lg:ml-auto">

                    {/* Feature 1 */}
                    <div className="bg-[#0f1629]/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start space-x-4">
                            <CheckCircle className="w-6 h-6 text-white mt-1" />
                            <div>
                                <h3 className="text-white font-semibold text-lg mb-2">Select accessible repos | Use our demo repo</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Your choice. Choose the repositories Oreva can access. First want to test drive? Just use our demo repo with sample data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-[#0f1629]/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start space-x-4">
                            <Lock className="w-6 h-6 text-white mt-1" />
                            <div>
                                <h3 className="text-white font-semibold text-lg mb-2">Secure read only access</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Our analysis does not require any agents, just read-only API access. We never store your code ( <a href="#" className="underline decoration-white/30 hover:decoration-white">read our docs</a> ).
                                </p>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
}
