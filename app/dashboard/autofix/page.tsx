"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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
    Clock,
    Loader2,
    X,
    ThumbsUp,
    ThumbsDown,
    EyeOff,
    Copy,
    ChevronDown
} from "lucide-react";
import { FixGenerator } from "@/lib/utils/fix-generator";
import { MockCodeGenerator } from "@/lib/utils/mock-code-generator";

// --- Types ---

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
    fix?: string;
    fixTime?: string;
    filePath?: string; // Added for UI
    lineRange?: string; // Added for UI
    confidence?: "High" | "Medium" | "Low"; // Added for UI
    repositoryFullName?: string; // Added for PR creation
}

interface FileGroup {
    fileName: string;
    path: string;
    issues: Violation[];
}

interface GroupedVulnerability {
    name: string;
    description: string;
    confidence: "High" | "Medium" | "Low";
    issues: (Violation & { filePath: string })[];
}

interface AutofixData {
    counts: {
        dependencies: number;
        sast: number;
        iac: number;
        totalHoursSaved: number;
    };
    findings: {
        dependencies: FileGroup[];
        sast: FileGroup[];
        iac: FileGroup[];
    };
}

export default function AutoFixPage() {
    const [activeTab, setActiveTab] = useState("Dependencies");
    const [data, setData] = useState<AutofixData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [writeAccessEnabled, setWriteAccessEnabled] = useState(false);
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    // Modal State
    const [showFixModal, setShowFixModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Violation | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);
    // LLM Fix State - Updated for multi-file support
    const [llmGeneratedFix, setLlmGeneratedFix] = useState<{
        files: Array<{
            path: string;
            changes: Array<{
                lineNumber: number;
                oldCode: string;
                newCode: string;
            }>;
        }>;
        explanation: string;
        usedLLM: boolean;
    } | null>(null);
    const [generatingFix, setGeneratingFix] = useState(false);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

    // Ignore Issue State
    const [showIgnoreModal, setShowIgnoreModal] = useState(false);
    const [ignoreReason, setIgnoreReason] = useState('');
    const [sendToAikido, setSendToAikido] = useState(false);
    const [ignoredIssues, setIgnoredIssues] = useState<Set<string>>(new Set());
    const [issuesToIgnore, setIssuesToIgnore] = useState<any[]>([]);

    // Create PR State
    const [creatingPR, setCreatingPR] = useState(false);
    const [prCreated, setPrCreated] = useState<{ url: string; number: number } | null>(null);

    const handleOpenFix = async (issue: any) => {
        setSelectedIssue(issue);
        setShowFixModal(true);
        setFileContent(null);
        setFileError(null);
        setLlmGeneratedFix(null);
        setLoadingFile(true);
        setGeneratingFix(false);

        let loadedContent = '';

        try {
            // Extract file path. Format: "RepoName | path/to/file"
            let filePath = issue.filePath || "";

            // Split by pipe to get just the file path
            const parts = filePath.split('|');
            let relativePath = parts.length > 1 ? parts[1].trim() : parts[0].trim();

            // Remove line number if present (e.g. :20 or :1)
            if (relativePath.includes(':')) {
                relativePath = relativePath.split(':')[0];
            }

            console.log('🔍 Attempting to read file:', relativePath);

            const res = await fetch("/api/read-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath: relativePath })
            });

            if (res.ok) {
                const data = await res.json();
                loadedContent = data.content;
                setFileContent(loadedContent);
                console.log('✅ File loaded successfully');
            } else {
                // File not found - generate mock content for preview
                console.warn('⚠️ File not found, generating mock content for preview');
                const mockContent = generateMockFileContent(issue);
                loadedContent = mockContent;
                setFileContent(mockContent);
            }
        } catch (error) {
            console.error("Error reading file:", error);
            const mockContent = generateMockFileContent(issue);
            loadedContent = mockContent;
            setFileContent(mockContent);
        } finally {
            setLoadingFile(false);
        }

        // Now generate the LLM fix
        if (loadedContent) {
            setGeneratingFix(true);
            try {
                console.log('🤖 Requesting LLM-generated fix...');
                const fixRes = await fetch('/api/generate-fix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vulnerabilityName: issue.name,
                        vulnerabilityDescription: issue.description,
                        severity: issue.severity,
                        fileContent: loadedContent,
                        filePath: issue.filePath || 'unknown',
                        lineNumber: issue.lineRange ? parseInt(issue.lineRange.match(/\d+/)?.[0] || '1') : 1
                    })
                });


                if (fixRes.ok) {
                    const fixData = await fixRes.json();
                    if (fixData.success) {
                        setLlmGeneratedFix(fixData);
                        // Expand the first file by default
                        if (fixData.files && fixData.files.length > 0) {
                            setExpandedFiles(new Set([fixData.files[0].path]));
                        }
                        console.log(`✅ Fix generated using ${fixData.usedLLM ? 'LLM' : 'pattern-based'} approach`);
                    }
                } else {
                    console.error('❌ Failed to generate fix');
                }
            } catch (error) {
                console.error('❌ Error generating fix:', error);
            } finally {
                setGeneratingFix(false);
            }
        }
    };

    // Generate mock file content using utility class
    const generateMockFileContent = (issue: any): string => {
        const fileName = issue.filePath?.split('/').pop() || 'file.ts';
        return MockCodeGenerator.generate(issue.name, fileName);
    };

    // Handle opening ignore modal
    const handleOpenIgnoreModal = (issue: any) => {
        setIssuesToIgnore([issue]);
        setShowIgnoreModal(true);
        setIgnoreReason('');
        setSendToAikido(false);
    };

    // Handle ignoring issues
    const handleIgnoreIssues = () => {
        // Add issues to ignored set
        const newIgnored = new Set(ignoredIssues);
        issuesToIgnore.forEach(issue => {
            newIgnored.add(issue.id);
        });
        setIgnoredIssues(newIgnored);

        // Log the action (you can send this to backend later)
        console.log('Ignored issues:', issuesToIgnore.map(i => i.id));
        console.log('Reason:', ignoreReason);
        console.log('Send to Aikido:', sendToAikido);

        // Close modal and reset
        setShowIgnoreModal(false);
        setIssuesToIgnore([]);
        setIgnoreReason('');
        setSendToAikido(false);
    };

    // Handle creating PR
    const handleCreatePR = async () => {
        if (!selectedIssue || !llmGeneratedFix || !fileContent) {
            console.error('Missing required data for PR creation');
            return;
        }

        setCreatingPR(true);
        setPrCreated(null);

        try {
            const firstFile = llmGeneratedFix.files[0];
            const firstChange = firstFile?.changes[0];

            if (!firstFile || !firstChange) {
                throw new Error('No fix data available');
            }

            // Extract file path (remove repo name if present and remove line numbers)
            let filePath: string = (selectedIssue.filePath || '').split('|')[1]?.trim() || selectedIssue.filePath || '';

            // Remove line number suffix (e.g., ":1" or ":12")
            filePath = filePath.replace(/:\d+$/, '') || '';

            console.log('🚀 Creating PR with data:', {
                repoFullName: selectedIssue.repositoryFullName,
                filePath,
                issueTitle: selectedIssue.name
            });

            const response = await fetch('/api/create-pr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: selectedIssue.repositoryFullName,
                    filePath: filePath,
                    originalCode: firstChange.oldCode,
                    fixedCode: firstChange.newCode,
                    issueTitle: selectedIssue.name,
                    issueDescription: selectedIssue.description || llmGeneratedFix.explanation
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create PR');
            }

            console.log('✅ PR created successfully:', data.prUrl);
            setPrCreated({ url: data.prUrl, number: data.prNumber });

            // Show success message
            alert(`✅ Pull Request #${data.prNumber} created successfully!\n\nView it at: ${data.prUrl}`);

        } catch (error: any) {
            console.error('❌ Error creating PR:', error);
            alert(`Failed to create PR: ${error.message}`);
        } finally {
            setCreatingPR(false);
        }
    };



    useEffect(() => {
        fetchAutofixData();
        checkWritePermissions();
    }, []);

    const checkWritePermissions = async () => {
        try {
            setCheckingPermissions(true);
            const res = await fetch("/api/auth/check-permissions");
            if (res.ok) {
                const data = await res.json();
                setWriteAccessEnabled(data.hasWriteAccess);
            }
        } catch (error) {
            console.error("Error checking permissions:", error);
        } finally {
            setCheckingPermissions(false);
        }
    };

    const fetchAutofixData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/autofix");
            if (res.ok) {
                const autofixData = await res.json();
                setData(autofixData);
            } else {
                console.error("Failed to fetch autofix data");
            }
        } catch (error) {
            console.error("Error fetching autofix data:", error);
        } finally {
            setLoading(false);
        }
    };

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

    // Get current tab's findings
    const getCurrentFindings = () => {
        if (!data) return [];

        switch (activeTab) {
            case "Dependencies":
                return data.findings.dependencies;
            case "SAST":
                return data.findings.sast;
            case "IaC":
                return data.findings.iac;
            default:
                return [];
        }
    };

    // Helper to group issues by name for SAST/IaC
    const getGroupedFindings = (): GroupedVulnerability[] => {
        const currentFindings = getCurrentFindings();
        if (activeTab === "Dependencies") return [];

        const grouped: Record<string, GroupedVulnerability> = {};

        currentFindings.forEach(fileGroup => {
            fileGroup.issues.forEach(issue => {
                if (!issue.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !issue.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return;
                }

                if (!grouped[issue.name]) {
                    grouped[issue.name] = {
                        name: issue.name,
                        description: issue.description,
                        confidence: "High", // Mocked for now as API doesn't return it
                        issues: []
                    };
                }

                // Parse line range from file path if possible (e.g. "file.py:20")
                let cleanPath = fileGroup.path;

                // Try to extract line info from description or path if available
                // For now, we'll try to guess or defualt.
                // In a real scenario, the API should return line numbers.

                grouped[issue.name].issues.push({
                    ...issue,
                    filePath: cleanPath,
                    lineRange: issue.fix ? "Line 12" : "Line 1" // Mocking line numbers for demo
                });
            });
        });

        return Object.values(grouped);
    };

    // Filter findings by search query and exclude ignored issues
    const filteredFindings = getCurrentFindings().filter(group =>
        group.issues.some(issue =>
            !ignoredIssues.has(issue.id) && (
                issue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    ).map(group => ({
        ...group,
        issues: group.issues.filter(issue => !ignoredIssues.has(issue.id))
    }));

    // Helper to generate dynamic diff with real security fixes using utility class
    const generateSecurityFix = (lineContent: string, issueName: string): string => {
        const fix = FixGenerator.generateFix(issueName, lineContent);
        return fix.fixedCode;
    };

    const renderDiff = () => {
        if (loadingFile) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6366f1] mb-2" />
                    <p className="text-sm text-gray-500">Loading file...</p>
                </div>
            );
        }

        if (generatingFix) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6366f1] mb-2" />
                    <p className="text-sm text-gray-500">Generating AI-powered fix...</p>
                </div>
            );
        }

        if (fileError) {
            return (
                <div className="text-xs font-mono overflow-x-auto p-4 text-gray-500 bg-gray-50 whitespace-pre">
                    {fileError}
                </div>
            );
        }

        if (!fileContent || !selectedIssue) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    No content available
                </div>
            );
        }

        if (!llmGeneratedFix) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Waiting for fix generation...
                </div>
            );
        }

        // Extract first file's data for backward compatibility
        const firstFile = llmGeneratedFix.files[0];
        const firstChange = firstFile?.changes[0];

        if (!firstFile || !firstChange) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    No fix data available
                </div>
            );
        }

        const lines = fileContent.split('\n');
        const targetLine = firstChange.lineNumber;

        // Find the actual vulnerable line by pattern matching
        const issueName = selectedIssue.name.toLowerCase();
        let actualVulnerableLine = targetLine;

        // Search for the vulnerable pattern in the file
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (issueName.includes('hardcoded') || issueName.includes('secret')) {
                if (line.includes('API_KEY') || line.includes('DATABASE_URL') || line.includes('SECRET')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('sql injection')) {
                if (line.includes('SELECT') && line.includes('${')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('xss')) {
                if (line.includes('.innerHTML')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('command injection')) {
                if (line.includes('exec(') && line.includes('${')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('path traversal')) {
                if (line.includes('readFileSync') && line.includes('filepath')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('weak random')) {
                if (line.includes('Math.random()')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('md5') || issueName.includes('weak crypto')) {
                if (line.includes("createHash('md5')")) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            } else if (issueName.includes('http')) {
                if (line.includes("'http://") || line.includes('"http://')) {
                    actualVulnerableLine = i + 1;
                    break;
                }
            }
        }


        actualVulnerableLine = Math.max(1, Math.min(actualVulnerableLine, lines.length));
        const startLine = Math.max(1, actualVulnerableLine - 3);
        const endLine = Math.min(lines.length, actualVulnerableLine + 3);

        const diffLines = [];

        for (let i = startLine; i <= endLine; i++) {
            const lineContent = lines[i - 1];

            if (i === actualVulnerableLine) {
                // Original Line (Red) - Use LLM's original code
                const originalCode = firstChange.oldCode;
                diffLines.push(
                    <div key={`del-${i}`} className="flex bg-red-50/50">
                        <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-red-300 select-none bg-red-50 border-r border-red-100">{i}</div>
                        <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-gray-300 select-none bg-gray-50 border-r border-gray-100"></div>
                        <div className="px-4 py-1 text-red-700 w-full whitespace-pre flex overflow-hidden">
                            <span className="select-none w-4 -ml-4 text-center text-red-400 font-mono">-</span>
                            <span className="font-mono truncate">{originalCode}</span>
                        </div>
                    </div>
                );

                // Fixed Line (Green) - Use LLM-generated fix
                const fixedContent = firstChange.newCode;

                // Handle multi-line fixes
                const fixedLines = fixedContent.split('\n');
                fixedLines.forEach((fixLine: string, idx: number) => {
                    diffLines.push(
                        <div key={`add-${i}-${idx}`} className="flex bg-green-50/50">
                            <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-gray-300 select-none bg-gray-50 border-r border-gray-100"></div>
                            <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-green-300 select-none bg-green-50 border-r border-green-100">{idx === 0 ? i : ''}</div>
                            <div className="px-4 py-1 text-green-700 w-full whitespace-pre flex overflow-hidden">
                                <span className="select-none w-4 -ml-4 text-center text-green-400 font-mono">+</span>
                                <span className="font-mono truncate">{fixLine}</span>
                            </div>
                        </div>
                    );
                });

            } else {
                // Context Line
                diffLines.push(
                    <div key={i} className="flex bg-white">
                        <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-gray-300 select-none bg-gray-50 border-r border-gray-100">{i}</div>
                        <div className="w-12 flex-shrink-0 text-right pr-3 py-1 text-gray-300 select-none bg-gray-50 border-r border-gray-100">{i}</div>
                        <div className="px-4 py-1 text-gray-600 w-full whitespace-pre font-mono truncate">{lineContent}</div>
                    </div>
                );
            }
        }

        return (
            <div className="text-xs font-mono overflow-x-auto">
                <div className="bg-[#f0f9ff] text-gray-400 border-b border-gray-100 px-4 py-1.5 flex items-center justify-between">
                    <div className="flex items-center">
                        <ArrowRight className="w-3 h-3 mr-2 rotate-90" />
                        @@ -{startLine},{endLine - startLine + 1} +{startLine},{endLine - startLine + 1} @@
                    </div>
                    {llmGeneratedFix.usedLLM && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                            AI Generated
                        </span>
                    )}
                </div>
                <div className="divide-y divide-gray-100">
                    {diffLines}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto font-sans flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6366f1] mx-auto mb-4" />
                    <p className="text-gray-500">Loading autofix data...</p>
                </div>
            </div>
        );
    }

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
                    <span className="text-gray-700 text-sm font-medium">
                        {data?.counts.totalHoursSaved || 0} hours saved with AutoFix
                    </span>
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
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "Dependencies" ? "bg-[#ede9fe] text-[#6366f1]" : "bg-gray-100 text-gray-600"
                        }`}>
                        {data?.counts.dependencies || 0}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("SAST")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === "SAST"
                        ? "border-[#6366f1] text-[#6366f1]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    SAST
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "SAST" ? "bg-[#ede9fe] text-[#6366f1]" : "bg-gray-100 text-gray-600"
                        }`}>
                        {data?.counts.sast || 0}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("IaC")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === "IaC"
                        ? "border-[#6366f1] text-[#6366f1]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    IaC
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "IaC" ? "bg-[#ede9fe] text-[#6366f1]" : "bg-gray-100 text-gray-600"
                        }`}>
                        {data?.counts.iac || 0}
                    </span>
                </button>
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">Containers</button>
                <button
                    onClick={() => setActiveTab("Settings")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === "Settings"
                        ? "border-[#6366f1] text-[#6366f1]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Settings
                    {!writeAccessEnabled && (
                        <span className="ml-2 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Enable Now</span>
                    )}
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Settings Tab Content */}
            {activeTab === "Settings" ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="max-w-3xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Write Access</h2>

                        {writeAccessEnabled ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-green-900 mb-1">Write access enabled</h3>
                                        <p className="text-sm text-green-700">
                                            Oreva can now create pull requests to fix vulnerabilities in your repositories.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Lock className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Not enabled yet</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            To enable auto-patching, Oreva needs write access to open pull requests on your behalf.
                                            You can <button className="text-[#6366f1] hover:underline font-medium">preview</button> what this
                                            looks like, but write access is required to generate the actual PRs.
                                        </p>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    // Open GitHub App installation page in popup
                                                    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || 'https://github.com/apps/grinders2025/installations/new';

                                                    const popup = window.open(
                                                        installUrl,
                                                        'github-app-install',
                                                        'width=800,height=900,scrollbars=yes'
                                                    );

                                                    if (!popup) {
                                                        alert('Please allow popups to install the GitHub App');
                                                        return;
                                                    }

                                                    // Check when popup closes and recheck permissions
                                                    const checkPopup = setInterval(() => {
                                                        if (popup.closed) {
                                                            clearInterval(checkPopup);
                                                            setTimeout(() => {
                                                                checkWritePermissions();
                                                            }, 1000);
                                                        }
                                                    }, 500);
                                                }}
                                                className="inline-flex items-center px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Activate
                                            </button>
                                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                                                <FileText className="w-4 h-4 mr-2" />
                                                View Docs
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">What permissions are required?</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span><strong>Read access</strong> to repository contents and metadata</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span><strong>Write access</strong> to create branches and pull requests</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span><strong>Workflow permissions</strong> to run security scans</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Issue List */}
                    {activeTab === "Dependencies" ? (
                        /* Dependencies Tab - Original Table */
                        (() => {
                            // Flatten all issues from all file groups into single array
                            const allIssues = filteredFindings.flatMap(group =>
                                group.issues.map(issue => ({
                                    ...issue,
                                    filePath: group.path
                                }))
                            );

                            return allIssues.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {searchQuery ? "No matching issues found" : "No issues to fix"}
                                    </h3>
                                    <p className="text-gray-500">
                                        {searchQuery
                                            ? "Try adjusting your search query"
                                            : "Scan your repositories to find vulnerabilities that can be auto-fixed"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* File Path Header */}
                                    <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center font-medium text-gray-700">
                                            <span className="text-gray-900 font-semibold">{filteredFindings[0]?.path.split('|')[0] || 'Repository'}</span>
                                            <span className="text-gray-400 mx-2">|</span>
                                            <span className="font-mono text-xs text-gray-600">{filteredFindings[0]?.path.split('|')[1] || 'Multiple files'}</span>
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

                                    {/* Table Rows - All Issues */}
                                    {allIssues.map((issue, idx) => (
                                        <div key={`${issue.id}-${idx}`} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
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
                                                {issue.cve || "N/A"}
                                            </div>
                                            <div className="col-span-3 flex items-center space-x-2 text-sm text-gray-700 font-mono">
                                                {issue.versionUpgrade ? (
                                                    <>
                                                        <span>{issue.versionUpgrade.from}</span>
                                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                                        <span>{issue.versionUpgrade.to}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wide ${getVersionBadgeStyle(issue.versionUpgrade.type)}`}>
                                                            {issue.versionUpgrade.type}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <span className="bg-[#6366f1] text-white text-xs font-bold px-3 py-1 rounded-full">New</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    ) : (
                        /* SAST & IaC Tabs - Grouped View */
                        <div className="space-y-6">
                            {getGroupedFindings().map((group, groupIdx) => (
                                <div key={groupIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Group Header */}
                                    <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center space-x-3">
                                        <h3 className="text-sm font-semibold text-gray-900">{group.name}</h3>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-sm text-gray-500 truncate max-w-md">{group.description}</span>

                                        <div className="group relative">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border cursor-help ${group.confidence === "High" ? "bg-green-50 text-green-700 border-green-200" :
                                                group.confidence === "Medium" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                    "bg-gray-50 text-gray-700 border-gray-200"
                                                }`}>
                                                <svg className={`w-3 h-3 mr-1 ${group.confidence === "High" ? "text-green-500" :
                                                    group.confidence === "Medium" ? "text-blue-500" : "text-gray-500"
                                                    }`} viewBox="0 0 12 12" fill="currentColor">
                                                    <rect x="2" y="5" width="2" height="5" rx="1" className={group.confidence !== "Low" ? "" : "opacity-30"} />
                                                    <rect x="5" y="3" width="2" height="7" rx="1" className={group.confidence !== "Low" ? "" : "opacity-30"} />
                                                    <rect x="8" y="1" width="2" height="9" rx="1" className={group.confidence === "High" ? "" : "opacity-30"} />
                                                </svg>
                                                {group.confidence} confidence
                                            </span>

                                            {/* Tooltip */}
                                            <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left">
                                                {group.confidence === "High" && "Oreva has a robust set of benchmarks for similar fixes, and they are proven to be effective."}
                                                {group.confidence === "Medium" && "Oreva has validated similar fixes and observed positive outcomes. Validation is required."}
                                                {group.confidence === "Low" && "Oreva has tested similar fixes, which indicate the correct approach but may be incomplete. Further validation is necessary."}
                                                {/* Arrow */}
                                                <div className="absolute bottom-full left-4 -mb-1 ml-0.5 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="w-full">
                                        <div className="grid grid-cols-12 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                            <div className="col-span-1 flex items-center justify-center">
                                                <input type="checkbox" className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]" />
                                            </div>
                                            <div className="col-span-8">Filename</div>
                                            <div className="col-span-2">Severity</div>
                                            <div className="col-span-1">Status</div>
                                        </div>

                                        {group.issues.map((issue, idx) => (
                                            <div key={`${issue.id}-${idx}`} className="grid grid-cols-12 px-6 py-4 items-center border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors">
                                                <div className="col-span-1 flex items-center justify-center">
                                                    <input type="checkbox" className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]" />
                                                </div>
                                                <div className="col-span-8">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <span className="text-gray-400 font-normal">{issue.filePath.split('|')[0]?.trim() || ''}</span>
                                                        {issue.filePath.split('|')[0] && <span className="text-gray-400 mx-1.5">›</span>}
                                                        <span>{issue.filePath.split('|')[1]?.trim() || issue.filePath}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{issue.lineRange || "Line 1"}</div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${issue.severity === "Critical" ? "bg-red-50 text-red-700 border-red-100" :
                                                        issue.severity === "High" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                                            issue.severity === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                                                "bg-blue-50 text-blue-700 border-blue-100"
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${issue.severity === "Critical" ? "bg-red-500" :
                                                            issue.severity === "High" ? "bg-orange-500" :
                                                                issue.severity === "Medium" ? "bg-yellow-500" :
                                                                    "bg-blue-500"
                                                            }`}></div>
                                                        {issue.severity}
                                                    </span>
                                                </div>
                                                <div className="col-span-1">
                                                    {activeTab === "SAST" ? (
                                                        <button
                                                            onClick={() => handleOpenFix(issue)}
                                                            className="text-[#6366f1] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center transition-colors"
                                                        >
                                                            View Fix
                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                        </button>
                                                    ) : (
                                                        <button className="text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center transition-colors">
                                                            AutoFix
                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {getGroupedFindings().length === 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
                                    <p className="text-gray-500">Great job! Your code is secure.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            {/* AutoFix Preview Modal */}
            {showFixModal && selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowFixModal(false)}
                    />

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">AutoFix preview</h2>
                            <button
                                onClick={() => setShowFixModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            {/* Summary & Confidence */}
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-semibold text-gray-900">Oreva used AI</span> to generate this patch, review carefully before merging.
                                    <span className="text-[#6366f1] font-medium ml-1">
                                        Possible Fix: {selectedIssue.fix || "Applying recommended security patch pattern."}
                                    </span>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                                    <svg className="w-3 h-3 mr-1.5 text-green-500" viewBox="0 0 12 12" fill="currentColor">
                                        <rect x="2" y="5" width="2" height="5" rx="1" />
                                        <rect x="5" y="3" width="2" height="7" rx="1" />
                                        <rect x="8" y="1" width="2" height="9" rx="1" />
                                    </svg>
                                    High Confidence
                                </span>
                            </div>

                            {/* File Diff Card */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
                                {/* File Header */}
                                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                        <a
                                            href={(() => {
                                                const fullPath = selectedIssue.filePath || "";
                                                const parts = fullPath.split('|');
                                                const filePath = parts[1]?.trim() || fullPath;
                                                // Remove line number if present
                                                const cleanPath = filePath.split(':')[0];
                                                // Use repositoryFullName from issue data (e.g., "dhruvpal102005/NomiNomi")
                                                const repoFullName = (selectedIssue as any).repositoryFullName || "";
                                                // Construct GitHub URL
                                                return `https://github.com/${repoFullName}/blob/master/${cleanPath}`;
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-xs max-w-sm truncate hover:text-[#6366f1] hover:underline transition-colors"
                                            title={`Open ${selectedIssue.filePath} in GitHub`}
                                        >
                                            {(selectedIssue.filePath || "").split('|')[1]?.trim() || selectedIssue.filePath}
                                        </a>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!llmGeneratedFix || !fileContent) return;

                                            try {
                                                const firstFile = llmGeneratedFix.files[0];
                                                const firstChange = firstFile?.changes[0];
                                                if (!firstChange) return;

                                                // Get the file lines
                                                const lines = fileContent.split('\n');

                                                // Find the vulnerable line index
                                                const targetLineIndex = firstChange.lineNumber - 1;

                                                // Replace the vulnerable line with the fixed code
                                                const fixedLines = [...lines];
                                                const fixedCodeLines = firstChange.newCode.split('\n');

                                                // Remove the old line and insert new lines
                                                fixedLines.splice(targetLineIndex, 1, ...fixedCodeLines);

                                                const fixedFileContent = fixedLines.join('\n');

                                                // Copy to clipboard
                                                await navigator.clipboard.writeText(fixedFileContent);

                                                // Show success feedback (you can add a toast notification here)
                                                const button = document.activeElement as HTMLButtonElement;
                                                const originalText = button.textContent;
                                                button.textContent = '✓ Copied!';
                                                button.classList.add('text-green-600');

                                                setTimeout(() => {
                                                    button.textContent = originalText;
                                                    button.classList.remove('text-green-600');
                                                }, 2000);
                                            } catch (error) {
                                                console.error('Failed to copy:', error);
                                                alert('Failed to copy to clipboard');
                                            }
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-900 flex items-center px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 mr-1.5" />
                                        Copy fixed file
                                    </button>
                                </div>

                                {/* Diff View */}
                                {renderDiff()}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Helpful">
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Not helpful">
                                    <ThumbsDown className="w-4 h-4" />
                                </button>
                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                <button
                                    onClick={() => {
                                        if (selectedIssue) {
                                            handleOpenIgnoreModal(selectedIssue);
                                            setShowFixModal(false);
                                        }
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Ignore this finding"
                                >
                                    <EyeOff className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowFixModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center -space-x-px rounded-lg overflow-hidden shadow-sm">
                                    <button
                                        onClick={handleCreatePR}
                                        disabled={creatingPR || !llmGeneratedFix}
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#6366f1] hover:bg-[#4f46e5] border-r border-indigo-500 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creatingPR ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating PR...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" />
                                                Create PR
                                            </>
                                        )}
                                    </button>
                                    <button className="px-2 py-2 bg-[#6366f1] hover:bg-[#4f46e5] transition-colors flex items-center justify-center">
                                        <ChevronDown className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ignore Issue Modal */}
            {showIgnoreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowIgnoreModal(false)}
                    />

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Ignore issues...</h2>
                            <button
                                onClick={() => setShowIgnoreModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                These issues will be ignored.
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                You can optionally record a reason to the activity log for this decision.
                            </p>

                            {/* Reason Textarea */}
                            <textarea
                                value={ignoreReason}
                                onChange={(e) => setIgnoreReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-sm"
                                rows={5}
                            />

                            {/* Aikido Checkbox */}
                            <div className="mt-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="sendToAikido"
                                    checked={sendToAikido}
                                    onChange={(e) => setSendToAikido(e.target.checked)}
                                    className="rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1] w-4 h-4"
                                />
                                <label htmlFor="sendToAikido" className="ml-2 text-sm text-gray-700">
                                    Send to Aikido to flag as false positive
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                            <button
                                onClick={handleIgnoreIssues}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#6366f1] hover:bg-[#4f46e5] rounded-lg transition-colors"
                            >
                                Ignore Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
