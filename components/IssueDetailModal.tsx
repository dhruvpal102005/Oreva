"use client";

import { useState } from "react";
import {
    X,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    AlertTriangle,
    Shield,
    Clock,
    FileCode,
    MessageSquare
} from "lucide-react";

interface SubIssue {
    id: string;
    cve: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    package: string;
    version: string;
    analysis: string;
}

interface Finding {
    type: string;
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    location: string;
    description: string;
    fix: string;
    fixTime: string;
    detailedAnalysis?: string;
    subIssues?: SubIssue[];
}

interface IssueDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    finding: Finding | null;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

export default function IssueDetailModal({
    isOpen,
    onClose,
    finding,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious,
}: IssueDetailModalProps) {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Overview");

    if (!isOpen || !finding) return null;

    // Severity badge style for the dark mode modal (matching screenshot style)
    const getSeverityBadgeStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical":
                return "text-red-500 border border-red-500 bg-red-500/10";
            case "high":
                return "text-orange-500 border border-orange-500 bg-orange-500/10";
            case "medium":
                return "text-yellow-500 border border-yellow-500 bg-yellow-500/10";
            case "low":
                return "text-blue-500 border border-blue-500 bg-blue-500/10";
            default:
                return "text-gray-400 border border-gray-600";
        }
    };

    // Dynamic Gauge Colors based on severity
    const getSeverityDetails = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical":
                return { color: "#EF4444", score: 100, label: "Critical C" };
            case "high":
                return { color: "#F97316", score: 75, label: "High H" };
            case "medium":
                return { color: "#EAB308", score: 50, label: "Medium M" };
            case "low":
                return { color: "#3B82F6", score: 25, label: "Low L" };
            default:
                return { color: "#9CA3AF", score: 0, label: "Info I" };
        }
    };

    const severityDetails = getSeverityDetails(finding.severity);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden isolate">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                <div className="w-screen max-w-[650px] pointer-events-auto">
                    <div className="flex h-full flex-col bg-[#050B16] text-white shadow-2xl border-l border-gray-800 font-sans">

                        {/* Header: Icons left, Actions right */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800/50">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                                    className="px-4 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-gray-200 text-sm font-medium rounded-md flex items-center transition-colors"
                                >
                                    Actions
                                    <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                                </button>
                                {isActionsOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1F2937] border border-gray-700 rounded-md shadow-lg z-20 py-1">
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700">Scan a path</button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700">Snooze</button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700">Ignore</button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700">Adjust severity</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Result Hero */}
                        <div className="px-8 pt-6 pb-0">
                            <div className="flex items-start mb-8">
                                {/* Gauge / Score */}
                                <div className="relative w-20 h-20 mr-6 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            stroke="#1F2937"
                                            strokeWidth="6"
                                            fill="none"
                                        />
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            stroke={severityDetails.color}
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray="226"
                                            strokeDashoffset={226 - (226 * severityDetails.score) / 100}
                                            strokeLinecap="round"
                                            className="transition-[stroke-dashoffset] duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{severityDetails.score}</span>
                                        <span className="text-[10px] uppercase text-gray-400 mt-[-2px]">{severityDetails.label}</span>
                                    </div>
                                </div>

                                {/* Title & Info */}
                                <div>
                                    <div className="flex items-center mb-1">
                                        <h1 className="text-2xl font-bold text-white mr-4">{finding.name}</h1>
                                    </div>
                                    <div className="text-gray-400 text-sm mb-3">
                                        Affected by {finding.subIssues ? finding.subIssues.length : 1} CVEs · last detected 31 minutes ago
                                    </div>
                                    <div className="flex space-x-2">
                                        <span className="px-2.5 py-0.5 bg-[#4F46E5] text-white text-xs font-medium rounded-full">New</span>
                                        <span className="px-2.5 py-0.5 bg-[#374151] text-gray-300 text-xs font-medium rounded-full border border-gray-600">Dependency 📦</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex space-x-6 border-b border-gray-800">
                                {["Overview", "Activity", "Tasks", "Education"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                                ? "border-[#4F46E5] text-[#4F46E5]"
                                                : "border-transparent text-gray-400 hover:text-gray-300"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                            {/* TL;DR */}
                            <section>
                                <h3 className="text-white font-bold mb-2 text-sm uppercase tracking-wide">TL;DR</h3>
                                <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                                    <p>{finding.description}</p>
                                    <p className="text-gray-400">
                                        {finding.detailedAnalysis ||
                                            "This vulnerability is affected by multiple CVEs. To learn more about each one, consult the table below. The worst case impact for these vulnerabilities can be \"Attacker can inject own code to run\", \"Potential server-side request forgery (SSRF)\" and \"Attacker can abuse missing input validation\"."}
                                    </p>
                                </div>
                            </section>

                            {/* How do I fix it? */}
                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-white font-bold text-sm">How do I fix it?</h3>
                                    <button className="flex items-center px-3 py-1.5 bg-[#0091EA] hover:bg-[#0081D5] text-white text-xs font-medium rounded transition-colors">
                                        <Shield className="w-3 h-3 mr-1.5" />
                                        AutoFix
                                    </button>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {finding.fix}
                                </p>
                            </section>

                            {/* Subissues */}
                            <section>
                                <div className="flex items-center mb-4">
                                    <h3 className="text-white font-bold text-sm mr-2">Subissues</h3>
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-700 text-xs font-medium rounded-full text-gray-300">
                                        {finding.subIssues ? finding.subIssues.length : 0}
                                    </span>
                                </div>

                                <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#0D1524]">
                                    <div className="grid grid-cols-12 bg-[#121B2E] border-b border-gray-800 text-[10px] uppercase text-gray-400 font-semibold tracking-wider p-3">
                                        <div className="col-span-8">Subissue</div>
                                        <div className="col-span-4 pl-4 border-l border-gray-800">Fix</div>
                                    </div>

                                    {/* Group Header (if applicable) - Mocked based on screenshot "frontend zapier" */}
                                    <div className="bg-[#2E2861] px-4 py-2 flex items-center space-x-2">
                                        <span className="px-2 py-0.5 bg-[#4B4391] text-white text-[10px] rounded">frontend</span>
                                        <span className="text-gray-300 text-xs text-sm">zapier</span>
                                    </div>

                                    {/* Sub-issue Rows */}
                                    {finding.subIssues && finding.subIssues.length > 0 ? (
                                        finding.subIssues.map((sub, idx) => (
                                            <div key={idx} className="grid grid-cols-12 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors">
                                                <div className="col-span-8 p-4">
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <span className="text-gray-300 text-sm font-mediun text-ellipsis overflow-hidden whitespace-nowrap">
                                                            {sub.id}
                                                        </span>
                                                        <div className="h-3 w-[1px] bg-gray-600 mx-1"></div>
                                                        <span className="text-gray-400 text-xs">{sub.cve}</span>
                                                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getSeverityBadgeStyle(sub.severity)}`}>
                                                            {sub.severity}
                                                        </span>
                                                    </div>
                                                    <div className="text-blue-400 text-xs hover:underline cursor-pointer">
                                                        View reachability analysis →
                                                    </div>
                                                </div>
                                                <div className="col-span-4 p-4 border-l border-gray-800 flex items-center">
                                                    <span className="text-gray-400 text-xs font-mono">
                                                        {sub.version || "15.3.4 → 15.3.6"}
                                                    </span>
                                                    <button className="ml-auto text-gray-400 hover:text-white">
                                                        <div className="w-1 h-1 rounded-full bg-current mb-0.5"></div>
                                                        <div className="w-1 h-1 rounded-full bg-current mb-0.5"></div>
                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-gray-500 text-center text-sm">No sub-issues found</div>
                                    )}
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-800 bg-[#0B1120] flex items-center justify-between">
                            <div className="flex space-x-1">
                                <button
                                    onClick={onPrevious}
                                    disabled={!hasPrevious}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button className="flex items-center text-xs text-gray-300 hover:text-white font-medium hover:underline">
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    View Detail
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
