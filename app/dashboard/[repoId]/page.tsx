"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Play,
    Loader2,
    Search,
    Filter,
    ChevronDown,
    FileCode,
    Settings,
    MoreVertical
} from "lucide-react";
import IssueDetailModal from "@/components/IssueDetailModal";

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

export default function RepositoryDetails() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const repoId = params.repoId as string;
    const repoName = searchParams.get("name") || "Repository";
    const owner = searchParams.get("owner") || "";

    const [isScanning, setIsScanning] = useState(false);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [scanSummary, setScanSummary] = useState("");
    const [lastScanTime, setLastScanTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load latest scan on page load
    useEffect(() => {
        const loadLatestScan = async () => {
            try {
                const res = await fetch(`/api/scan/get?repoId=${repoId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.scan) {
                        setFindings(data.scan.findings || []);
                        setScanSummary(data.scan.summary || "");
                        setLastScanTime(new Date(data.scan.createdAt).toLocaleString());
                    }
                }
            } catch (error) {
                console.error("Failed to load scan:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLatestScan();
    }, [repoId]);

    const startScan = async () => {
        if (!session?.accessToken) return;

        setIsScanning(true);
        try {
            const res = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repoId,
                    owner,
                    repo: repoName.split("/")[1] || repoName
                }),
            });

            if (!res.ok) throw new Error("Scan failed");

            const data = await res.json();
            if (data.success) {
                setFindings(data.result.findings);
                setScanSummary(data.result.summary);
                setLastScanTime(new Date().toLocaleString());
            }
        } catch (error) {
            console.error("Scan error:", error);
            alert("Failed to start scan. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical": return "bg-red-50 text-red-600 border-red-200";
            case "high": return "bg-orange-50 text-orange-600 border-orange-200";
            case "medium": return "bg-yellow-50 text-yellow-600 border-yellow-200";
            case "low": return "bg-blue-50 text-blue-600 border-blue-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical": return <AlertTriangle className="w-4 h-4" />;
            case "high": return <AlertTriangle className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    };

    const handleIssueClick = (index: number) => {
        setSelectedFindingIndex(index);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFindingIndex(null);
    };

    const handleNextIssue = () => {
        if (selectedFindingIndex !== null && selectedFindingIndex < findings.length - 1) {
            setSelectedFindingIndex(selectedFindingIndex + 1);
        }
    };

    const handlePreviousIssue = () => {
        if (selectedFindingIndex !== null && selectedFindingIndex > 0) {
            setSelectedFindingIndex(selectedFindingIndex - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-2xl font-semibold text-gray-900">{repoName}</h1>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                {findings.length} Issues
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center hover:text-gray-700">
                                <Settings className="w-4 h-4 mr-1" />
                                Configure
                            </button>
                            <button className="flex items-center hover:text-gray-700">
                                <Shield className="w-4 h-4 mr-1" />
                                GitHub
                            </button>
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Last scan {lastScanTime ? `${lastScanTime}` : "21 hours ago"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition-colors text-gray-700">
                            Scan Branch
                        </button>
                        <button
                            onClick={startScan}
                            disabled={isScanning}
                            className="px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Scan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-8">
                <div className="flex space-x-8">
                    <button className="pb-4 pt-4 border-b-2 border-[#6366f1] text-[#6366f1] font-medium text-sm">
                        Issues
                    </button>
                    <button className="pb-4 pt-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
                        Settings
                    </button>
                    <button className="pb-4 pt-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
                        Checks
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-8 py-4 bg-white border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center text-gray-700 hover:bg-gray-50 transition-colors">
                            All types <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                        <button className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center text-gray-700 hover:bg-gray-50 transition-colors">
                            Actions <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Findings Table */}
            <div className="px-8 py-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-medium">
                                    <th className="p-4 w-12">Type</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4 w-32">Severity</th>
                                    <th className="p-4 w-48">Location</th>
                                    <th className="p-4 w-32">Fix time</th>
                                    <th className="p-4 w-32">Status</th>
                                    <th className="p-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#6366f1]" />
                                                <p>Loading scan results...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : findings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            {isScanning ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#6366f1]" />
                                                    <p>Analyzing repository code...</p>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-700 mb-1">We have no more issues to show</p>
                                                    <p className="text-gray-500">Click "Start Scan" to analyze your repository</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    findings.map((finding, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => handleIssueClick(index)}
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-4">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <FileCode className="w-4 h-4" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 text-sm mb-1">{finding.name}</div>
                                                <div className="text-xs text-gray-500">{finding.description}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center w-fit ${getSeverityColor(finding.severity)}`}>
                                                    {getSeverityIcon(finding.severity)}
                                                    <span className="ml-1">{finding.severity}</span>
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="font-mono text-xs">{finding.location}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {finding.fixTime}
                                            </td>
                                            <td className="p-4">
                                                <button className="px-3 py-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded text-xs font-medium transition-colors">
                                                    New
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Issue Detail Modal */}
            <IssueDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                finding={selectedFindingIndex !== null ? findings[selectedFindingIndex] : null}
                onNext={handleNextIssue}
                onPrevious={handlePreviousIssue}
                hasNext={selectedFindingIndex !== null && selectedFindingIndex < findings.length - 1}
                hasPrevious={selectedFindingIndex !== null && selectedFindingIndex > 0}
            />
        </div>
    );
}
