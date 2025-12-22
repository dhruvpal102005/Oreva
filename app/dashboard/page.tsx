"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Settings, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Repository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    language: string;
    updated_at: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    issues: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    ignored: number;
    last_scan: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

    const fetchRepos = async () => {
        try {
            // Try to get cached data first for instant loading
            const cached = localStorage.getItem('dashboard_data_cache');
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < 60000) { // 60 seconds
                    console.log('Loading repositories from cache:', parsedCache.repositories?.length);
                    setRepos(parsedCache.repositories || []);
                    setLoading(false);
                    return; // Use cached data
                }
            }

            // If no cache or expired, fetch from API
            console.log('Fetching repositories from API...');
            const res = await fetch("/api/github/repositories");
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched repositories from API:', data.repositories?.length);
                setRepos(data.repositories || []);

                // Update cache
                const cacheData = {
                    repositories: data.repositories || [],
                    timestamp: Date.now()
                };
                const existingCache = localStorage.getItem('dashboard_data_cache');
                if (existingCache) {
                    const parsed = JSON.parse(existingCache);
                    localStorage.setItem('dashboard_data_cache', JSON.stringify({
                        ...parsed,
                        ...cacheData
                    }));
                } else {
                    localStorage.setItem('dashboard_data_cache', JSON.stringify(cacheData));
                }
            }
        } catch (error) {
            console.error("Failed to fetch repos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startBulkScan = async () => {
        if (!session?.accessToken || filteredRepos.length === 0) {
            alert("No repositories to scan or not authenticated");
            return;
        }

        setIsScanning(true);
        setScanProgress({ current: 0, total: filteredRepos.length });

        try {
            // Run all scans in parallel
            const scanPromises = filteredRepos.map(async (repo, index) => {
                try {
                    console.log(`🚀 Starting scan for ${repo.full_name}...`);

                    const res = await fetch("/api/scan", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            repoId: repo.id.toString(),
                            owner: repo.owner.login,
                            repo: repo.name
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        console.log(`✅ Scanned ${repo.full_name}: ${data.result?.summary || 'completed'}`);

                        // Update progress
                        setScanProgress(prev => ({ ...prev, current: prev.current + 1 }));

                        return { success: true, repo: repo.full_name };
                    } else {
                        console.error(`❌ Failed to scan ${repo.full_name}`);
                        setScanProgress(prev => ({ ...prev, current: prev.current + 1 }));
                        return { success: false, repo: repo.full_name };
                    }
                } catch (error) {
                    console.error(`❌ Error scanning ${repo.full_name}:`, error);
                    setScanProgress(prev => ({ ...prev, current: prev.current + 1 }));
                    return { success: false, repo: repo.full_name };
                }
            });

            // Wait for all scans to complete
            const results = await Promise.all(scanPromises);

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            setIsScanning(false);
            setScanProgress({ current: 0, total: 0 });

            // Refresh repository list to get updated scan results
            console.log("🔄 Refreshing repository list with updated scan data...");
            await fetchRepos();

            alert(`Scan complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
        } catch (error) {
            console.error("Bulk scan error:", error);
            setIsScanning(false);
            setScanProgress({ current: 0, total: 0 });
            alert("An error occurred during bulk scanning");
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0e27] mb-2">Repositories</h1>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {repos.length} active repos
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <button
                        onClick={startBulkScan}
                        disabled={isScanning || filteredRepos.length === 0}
                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isScanning ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Scanning {scanProgress.current}/{scanProgress.total}
                            </>
                        ) : (
                            "Start Scan"
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button className="border-[#6366f1] text-[#6366f1] whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                        Repositories
                    </button>
                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                        Checks
                    </button>
                </nav>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#6366f1] focus:border-[#6366f1] sm:text-sm"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Last scan 15 hours ago</span>
                    <button
                        onClick={() => {
                            localStorage.removeItem('dashboard_data_cache');
                            window.location.reload();
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-200 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                    <button className="bg-[#6366f1] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-[#4f46e5] transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Manage Repos</span>
                    </button>
                </div>
            </div>

            {/* Warning Banner for Mock Repos */}
            {repos.length === 4 && repos[0]?.name === "zapier" && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong className="font-medium">Showing mock data.</strong> We couldn't fetch your GitHub repositories.
                                This might be because:
                            </p>
                            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                                <li>You need to <strong>sign out and sign in again</strong> to refresh your GitHub token</li>
                                <li>Your GitHub account has no repositories</li>
                                <li>The GitHub API is temporarily unavailable</li>
                            </ul>
                            <button
                                onClick={() => window.location.href = '/api/auth/signout'}
                                className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                            >
                                Sign out and try again →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Repo name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Domain
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Language
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Issues
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ignored
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last scan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Loading repositories...
                                    </td>
                                </tr>
                            ) : filteredRepos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No repositories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRepos.map((repo) => (
                                    <tr
                                        key={repo.id}
                                        onClick={() => router.push(`/dashboard/${repo.id}?name=${encodeURIComponent(repo.full_name)}&owner=${encodeURIComponent(repo.owner.login)}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                                    {repo.name.substring(0, 2)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                                                <Settings className="w-3 h-3 mr-1" />
                                                Configure
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">{repo.language || "N/A"}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                    {repo.issues.critical}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                    {repo.issues.high}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                    {repo.issues.medium}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    {repo.issues.low}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {repo.ignored}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {repo.last_scan}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
