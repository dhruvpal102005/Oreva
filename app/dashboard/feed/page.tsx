"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    EyeOff,
    Plus,
    CheckCircle,
    ArrowRight
} from "lucide-react";

interface Finding {
    id?: string;
    type: string;
    title: string;
    description?: string;
    severity: string;
    file?: string;
    line?: number;
    repositoryName?: string;
    repositoryFullName?: string;
    scanId?: string;
    scannedAt?: string;
}

interface Summary {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    autoIgnored: number;
    newInLast7Days: number;
    solvedInLast7Days: number;
}

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState("Aikido refined");
    const [findings, setFindings] = useState<Finding[]>([]);
    const [summary, setSummary] = useState<Summary>({
        totalIssues: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        autoIgnored: 0,
        newInLast7Days: 0,
        solvedInLast7Days: 0
    });
    const [loading, setLoading] = useState(true);
    const [showIssuesDetail, setShowIssuesDetail] = useState(false);
    const [showAutoFixModal, setShowAutoFixModal] = useState(false);
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

    useEffect(() => {
        fetchFindings();
    }, []);

    const fetchFindings = async () => {
        try {
            // Try to get cached data first for instant loading
            const cached = localStorage.getItem('dashboard_data_cache');
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < 30000) { // 30 seconds
                    setFindings(parsedCache.findings || []);
                    setSummary(parsedCache.summary || summary);
                    setLoading(false);
                    return; // Use cached data, no need to fetch
                }
            }

            // If no cache or expired, fetch from API
            const res = await fetch("/api/findings");
            if (res.ok) {
                const data = await res.json();
                setFindings(data.findings || []);
                setSummary(data.summary || summary);

                // Update cache
                const cacheData = {
                    findings: data.findings || [],
                    summary: data.summary || summary,
                    timestamp: Date.now()
                };
                const existingCache = localStorage.getItem('dashboard_data_cache');
                if (existingCache) {
                    const parsed = JSON.parse(existingCache);
                    localStorage.setItem('dashboard_data_cache', JSON.stringify({
                        ...parsed,
                        ...cacheData
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch findings", error);
        } finally {
            setLoading(false);
        }
    };

    // Memoize sorted findings to avoid re-sorting on every render
    const sortedFindings = useMemo(() => {
        return [...findings].sort((a, b) => {
            const severityOrder: { [key: string]: number } = {
                'Critical': 0,
                'High': 1,
                'Medium': 2,
                'Low': 3
            };
            return (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999);
        });
    }, [findings]);

    // Memoize modal handlers
    const handleOpenAutoFix = useCallback((finding: Finding) => {
        setSelectedFinding(finding);
        setShowAutoFixModal(true);
    }, []);

    const handleCloseAutoFix = useCallback(() => {
        setShowAutoFixModal(false);
    }, []);

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* Open Issues Card with Hover Detail */}
                <div
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative"
                    onMouseEnter={() => setShowIssuesDetail(true)}
                    onMouseLeave={() => setShowIssuesDetail(false)}
                >
                    <div className="flex w-full h-2 rounded-full overflow-hidden mb-4 bg-gray-100">
                        <div className="bg-red-500" style={{ width: `${summary.totalIssues > 0 ? (summary.critical / summary.totalIssues) * 100 : 0}%` }}></div>
                        <div className="bg-orange-400" style={{ width: `${summary.totalIssues > 0 ? (summary.high / summary.totalIssues) * 100 : 0}%` }}></div>
                        <div className="bg-blue-500" style={{ width: `${summary.totalIssues > 0 ? (summary.medium / summary.totalIssues) * 100 : 0}%` }}></div>
                        <div className="bg-green-500" style={{ width: `${summary.totalIssues > 0 ? (summary.low / summary.totalIssues) * 100 : 0}%` }}></div>
                    </div>
                    <div className="flex items-baseline mb-2">
                        <span className="text-3xl font-bold text-gray-900">{summary.totalIssues}</span>
                        <span className="ml-2 text-sm text-gray-500">Open Issues</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-medium text-gray-600">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                            <span>{summary.critical}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span>
                            <span>{summary.high}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                            <span>{summary.medium}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                            <span>{summary.low}</span>
                        </div>
                    </div>

                    {/* Hover Detail Popup */}
                    {showIssuesDetail && (
                        <div className="absolute top-full left-0 mt-2 w-[500px] bg-white rounded-xl border border-gray-200 shadow-xl p-6 z-50">
                            <h3 className="font-semibold text-gray-900 mb-4">Grouped Issues</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 text-sm font-semibold">{summary.critical}</span>
                                    <span className="text-sm text-gray-600">critical</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold">{summary.high}</span>
                                    <span className="text-sm text-gray-600">high</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">{summary.medium}</span>
                                    <span className="text-sm text-gray-600">medium</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 text-sm font-semibold">{summary.low}</span>
                                    <span className="text-sm text-gray-600">low</span>
                                </div>
                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:underline mb-6 inline-block">View Trend over Time</a>

                            <h3 className="font-semibold text-gray-900 mb-4 mt-6">Individual Issues</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 text-sm font-semibold">{summary.critical * 3}</span>
                                    <span className="text-sm text-gray-600">critical</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold">{summary.high * 3}</span>
                                    <span className="text-sm text-gray-600">high</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">{summary.medium * 4}</span>
                                    <span className="text-sm text-gray-600">medium</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 text-sm font-semibold">{summary.low * 3}</span>
                                    <span className="text-sm text-gray-600">low</span>
                                </div>
                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:underline inline-block">View Trend over Time</a>

                            <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                                Aikido groups issues developers usually fix together. For example, CVEs in the same package count as one group.
                            </p>
                        </div>
                    )}
                </div>

                {/* Auto Ignored Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4 text-gray-400 font-medium text-sm">
                        <EyeOff className="w-4 h-4 mr-2" />
                        <span>Auto Ignored</span>
                    </div>
                    <div className="flex items-baseline mb-1">
                        <span className="text-3xl font-bold text-gray-900">{summary.autoIgnored}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {summary.autoIgnored > 0 ? `${Math.round(summary.autoIgnored * 0.37)} hours saved` : '0 hours saved'}
                    </div>
                </div>

                {/* New Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4 text-[#6366f1] font-medium text-sm bg-indigo-50 w-fit px-2 py-1 rounded-md">
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>New</span>
                    </div>
                    <div className="flex items-baseline mb-1">
                        <span className="text-3xl font-bold text-gray-900">{summary.newInLast7Days}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        in last 7 days
                    </div>
                </div>

                {/* Solved Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4 text-emerald-600 font-medium text-sm bg-emerald-50 w-fit px-2 py-1 rounded-md">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        <span>Solved</span>
                    </div>
                    <div className="flex items-baseline mb-1">
                        <span className="text-3xl font-bold text-gray-900">{summary.solvedInLast7Days}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        in last 7 days
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#6366f1] w-64 shadow-sm"
                            placeholder="Search"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'All findings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('All findings')}
                        >
                            All findings
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'Aikido refined' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('Aikido refined')}
                        >
                            Aikido refined
                        </button>
                    </div>

                    {/* Filter Type */}
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                        <span>All types</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 shadow-sm text-gray-500">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                        <span>Actions</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Findings Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide">Type</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide w-1/3">Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide">Severity</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide">Location</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide">Fix time</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Loading findings...
                                    </td>
                                </tr>
                            ) : findings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No findings found. Run a scan to see vulnerabilities.
                                    </td>
                                </tr>
                            ) : (
                                sortedFindings
                                    .map((item, index) => {
                                        // Determine if this item should show "View Fix" button
                                        const showViewFix = item.severity === 'Critical' && item.title && (
                                            item.title.toLowerCase().includes('injection') ||
                                            item.title.toLowerCase().includes('nosql') ||
                                            index % 5 === 4
                                        );

                                        // Determine status
                                        const isNew = index === 1; // Second item is "New"
                                        const status = isNew ? 'New' : 'To Do';

                                        return (
                                            <tr key={index} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-mono text-xs">
                                                        {item.type === 'package' || item.type === 'dependency' ? 'JP' : '{TS}'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                                    {item.description && (
                                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.severity === 'Critical'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : item.severity === 'High'
                                                            ? 'bg-orange-50 text-orange-700 border-orange-100'
                                                            : item.severity === 'Medium'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                                : 'bg-green-50 text-green-700 border-green-100'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.severity === 'Critical' ? 'bg-red-500'
                                                            : item.severity === 'High' ? 'bg-orange-500'
                                                                : item.severity === 'Medium' ? 'bg-blue-500'
                                                                    : 'bg-green-500'
                                                            }`}></span>
                                                        {item.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-600 font-medium">≡ {item.repositoryName || 'Unknown'}</span>
                                                        {index === 1 && (
                                                            <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium">7 others</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-500">
                                                        {item.severity === 'Critical' ? (index % 3 === 0 ? '30 min' : index % 3 === 1 ? '6 hr 15 min' : '1 hr 40 min') : '1 hr'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {showViewFix ? (
                                                        <button
                                                            onClick={() => handleOpenAutoFix(item)}
                                                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors shadow-sm border border-blue-100"
                                                        >
                                                            View Fix <ArrowRight className="w-3 h-3 ml-1" />
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${isNew
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AutoFix Preview Modal */}
            {showAutoFixModal && selectedFinding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-gray-200">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">AutoFix preview</h2>
                                <p className="text-sm text-gray-600">
                                    Aikido used AI to generate this patch, review carefully before merging.{' '}
                                    <span className="text-blue-600 font-medium">
                                        ✨This patch mitigates {selectedFinding.title}
                                    </span>
                                </p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mt-3">
                                    📊 Medium Confidence
                                </span>
                            </div>
                            <button
                                onClick={handleCloseAutoFix}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - Code Diff */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* File Header */}
                                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-mono text-gray-700">{selectedFinding.file || 'backend/routes/account.js'}</span>
                                    </div>
                                    <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                        Copy fixed file
                                    </button>
                                </div>

                                {/* Code Diff View */}
                                <div className="bg-white font-mono text-xs">
                                    {/* Line numbers header */}
                                    <div className="bg-blue-50 px-4 py-1 text-blue-600 border-b border-blue-100">
                                        @@ -43,7 +43,7 @@
                                    </div>

                                    {/* Unchanged lines */}
                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">43</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">43</div>
                                        <div className="flex-1 px-4 py-1"></div>
                                    </div>

                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">44</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">44</div>
                                        <div className="flex-1 px-4 py-1 text-gray-700">
                                            <span className="text-gray-500">// Perform the transfer</span>
                                        </div>
                                    </div>

                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">45</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">45</div>
                                        <div className="flex-1 px-4 py-1 text-gray-700">
                                            <span className="text-purple-600">await</span> Account.updateOne({'{'} userId: req.userId {'}'}, {'{'} $inc: {'{'} balance: -amount {'}'} {'}'}).session(session);
                                        </div>
                                    </div>

                                    {/* Removed line */}
                                    <div className="flex bg-red-50 border-l-4 border-red-400">
                                        <div className="w-12 text-right pr-2 text-red-600 bg-red-100 border-r border-red-200 select-none">46</div>
                                        <div className="w-12 text-right pr-2 bg-red-100 border-r border-red-200 select-none">-</div>
                                        <div className="flex-1 px-4 py-1 text-red-700">
                                            <span className="text-purple-600">await</span> Account.updateOne({'{'} userId: <span className="bg-red-200">to</span> {'}'}, {'{'} $inc: {'{'} balance: amount {'}'} {'}'}).session(session);
                                        </div>
                                    </div>

                                    {/* Added line */}
                                    <div className="flex bg-green-50 border-l-4 border-green-400">
                                        <div className="w-12 text-right pr-2 bg-green-100 border-r border-green-200 select-none">-</div>
                                        <div className="w-12 text-right pr-2 text-green-600 bg-green-100 border-r border-green-200 select-none">46</div>
                                        <div className="flex-1 px-4 py-1 text-green-700">
                                            <span className="text-purple-600">await</span> Account.updateOne({'{'} userId: {'{'} <span className="bg-green-200">$eq: to</span> {'}'} {'}'}, {'{'} $inc: {'{'} balance: amount {'}'} {'}'}).session(session);
                                        </div>
                                    </div>

                                    {/* More unchanged lines */}
                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">47</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">47</div>
                                        <div className="flex-1 px-4 py-1"></div>
                                    </div>

                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">48</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">48</div>
                                        <div className="flex-1 px-4 py-1 text-gray-700">
                                            <span className="text-gray-500">// Commit the transaction</span>
                                        </div>
                                    </div>

                                    <div className="flex hover:bg-gray-50">
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">49</div>
                                        <div className="w-12 text-right pr-2 text-gray-400 bg-gray-50 border-r border-gray-200 select-none">49</div>
                                        <div className="flex-1 px-4 py-1 text-gray-700">
                                            <span className="text-purple-600">await</span> session.commitTransaction();
                                        </div>
                                    </div>

                                    {/* Expand indicator */}
                                    <div className="bg-blue-50 px-4 py-1 text-blue-600 border-y border-blue-100 flex items-center justify-center cursor-pointer hover:bg-blue-100">
                                        <ChevronDown className="w-4 h-4 mr-1" />
                                        <span className="text-xs">...</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Thumbs up">
                                        👍
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Thumbs down">
                                        👎
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Dismiss">
                                        👁️
                                    </button>
                                </div>
                                <button className="flex items-center space-x-2 px-6 py-2.5 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors font-medium shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create PR</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
