"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Zap,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Lock,
    FileText,
    Settings,
    MessageSquare,
    Info,
    Clock
} from "lucide-react";

// --- Mock Data ---

interface Violation {
    id: string;
    name: string;
    description: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    cve?: string;
    versionUpgrade?: {
        from: string;
        to: string;
        type: "patch" | "minor" | "major";
    };
    status: "New" | "Pending" | "Fixed";
}

interface FileGroup {
    fileName: string;
    path: string;
    issues: Violation[];
}

const mockDependencies: FileGroup[] = [
    {
        fileName: "package-lock.json",
        path: "Carciano | frontend/package-lock.json",
        issues: [
            {
                id: "1",
                name: "Next.js",
                description: "Attacker can inject own code to run",
                severity: "Critical",
                cve: "AIKIDO-2025-10869",
                versionUpgrade: { from: "14.0.4", to: "14.0.7", type: "patch" },
                status: "New"
            }
        ]
    },
    {
        fileName: "requirements.txt",
        path: "HackRx | requirements.txt",
        issues: [
            {
                id: "2",
                name: "sentence-transformers",
                description: "Potential Deserialization Vulnerability",
                severity: "High",
                cve: "AIKIDO-2024-10370",
                versionUpgrade: { from: "3.0.1", to: "3.1.0", type: "minor" },
                status: "New"
            }
        ]
    }
];

export default function AutoFixPage() {
    const [activeTab, setActiveTab] = useState("Dependencies");

    const getSeverityStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical": return "bg-red-50 text-red-600 border border-red-100";
            case "high": return "bg-orange-50 text-orange-600 border border-orange-100";
            case "medium": return "bg-yellow-50 text-yellow-600 border border-yellow-100";
            case "low": return "bg-blue-50 text-blue-600 border border-blue-100";
            default: return "bg-gray-50 text-gray-600 border border-gray-100";
        }
    };

    const getVersionBadgeStyle = (type: string) => {
        switch (type) {
            case "patch": return "bg-green-100 text-green-700";
            case "minor": return "bg-blue-100 text-blue-700";
            case "major": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="max-w-7xl mx-auto font-sans">

            {/* Header Section */}
            <div className="mb-8">
                <div className="text-gray-500 text-sm mb-1">AutoFix</div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">AutoFix</h1>
                <p className="text-gray-500 text-sm mb-4">
                    Fix issues with Oreva's AI agent. Generate pull requests to fix SAST, IaC, and dependency issues.
                </p>

                {/* Stats Badge */}
                <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5">
                    <span className="text-gray-700 text-sm font-medium">0 / 55 hours saved with AutoFix</span>
                    <Info className="w-4 h-4 text-gray-400 ml-2" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("Dependencies")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === "Dependencies"
                            ? "border-[#6366f1] text-[#6366f1]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Dependencies
                    <span className="ml-2 bg-[#ede9fe] text-[#6366f1] text-xs px-2 py-0.5 rounded-full font-bold">72</span>
                </button>
                <button
                    onClick={() => setActiveTab("SAST")}
                    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center"
                >
                    SAST
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">30</span>
                </button>
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center">
                    IaC
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">3</span>
                </button>
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">Containers</button>
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center">
                    Settings
                    <span className="ml-2 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Enable Now</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#6366f1] text-gray-700"
                        />
                    </div>
                    <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Extended Lifecycle Support
                </div>
            </div>

            {/* Issue List */}
            <div className="space-y-6">
                {mockDependencies.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Group Header */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center font-medium text-gray-700">
                                <span className="text-gray-900 font-semibold mr-1">{group.path.split('|')[0]}</span>
                                <span className="text-gray-400 mx-1">|</span>
                                <span className="font-mono text-xs text-gray-600">{group.path.split('|')[1]}</span>
                            </div>
                            <button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center transition-colors">
                                <Zap className="w-4 h-4 mr-2" />
                                Create PR
                            </button>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">
                            <div className="col-span-1 flex items-center justify-center">
                                <input type="checkbox" className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]" />
                            </div>
                            <div className="col-span-3">Name</div>
                            <div className="col-span-2">Severity</div>
                            <div className="col-span-2">CVE</div>
                            <div className="col-span-3">Version Upgrade</div>
                            <div className="col-span-1">Status</div>
                        </div>

                        {/* Table Rows */}
                        {group.issues.map((issue) => (
                            <div key={issue.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                                <div className="col-span-1 flex items-center justify-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]" />
                                </div>
                                <div className="col-span-3">
                                    <div className="font-semibold text-gray-900 text-sm">{issue.name}</div>
                                    <div className="text-gray-500 text-xs mt-0.5">{issue.description}</div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getSeverityStyle(issue.severity)}`}>
                                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                                        {issue.severity}
                                    </span>
                                </div>
                                <div className="col-span-2 text-sm text-gray-600 font-mono">
                                    {issue.cve}
                                </div>
                                <div className="col-span-3 flex items-center space-x-2 text-sm text-gray-700 font-mono">
                                    <span>{issue.versionUpgrade?.from}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span>{issue.versionUpgrade?.to}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wide ${getVersionBadgeStyle(issue.versionUpgrade?.type || "")}`}>
                                        {issue.versionUpgrade?.type}
                                    </span>
                                </div>
                                <div className="col-span-1">
                                    <span className="bg-[#6366f1] text-white text-xs font-bold px-3 py-1 rounded-full">New</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
