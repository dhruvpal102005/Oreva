"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Settings, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch("/api/github/repositories");
                if (res.ok) {
                    const data = await res.json();
                    setRepos(data.repositories || []);
                }
            } catch (error) {
                console.error("Failed to fetch repos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all">
                        Start Scan
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
                    <button className="bg-[#6366f1] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-[#4f46e5] transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Manage Repos</span>
                    </button>
                </div>
            </div>

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
