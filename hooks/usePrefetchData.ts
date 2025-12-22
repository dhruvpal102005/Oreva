import { useEffect, useState } from 'react';

interface CachedData {
    repositories: any[];
    findings: any[];
    summary: any;
    timestamp: number;
}

const CACHE_KEY = 'dashboard_data_cache';
const CACHE_DURATION = 30000; // 30 seconds

export function usePrefetchData() {
    const [isLoading, setIsLoading] = useState(true);
    const [cachedData, setCachedData] = useState<CachedData | null>(null);

    useEffect(() => {
        prefetchAllData();
    }, []);

    const prefetchAllData = async () => {
        try {
            // Check if we have valid cached data
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
                    setCachedData(parsedCache);
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch all data in parallel
            const [reposRes, findingsRes] = await Promise.all([
                fetch('/api/github/repositories'),
                fetch('/api/findings')
            ]);

            const [reposData, findingsData] = await Promise.all([
                reposRes.json(),
                findingsRes.json()
            ]);

            const newCache: CachedData = {
                repositories: reposData.repositories || [],
                findings: findingsData.findings || [],
                summary: findingsData.summary || {},
                timestamp: Date.now()
            };

            // Cache in localStorage
            localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
            setCachedData(newCache);
            setIsLoading(false);
        } catch (error) {
            console.error('Prefetch error:', error);
            setIsLoading(false);
        }
    };

    const refreshData = () => {
        localStorage.removeItem(CACHE_KEY);
        setIsLoading(true);
        prefetchAllData();
    };

    return {
        isLoading,
        repositories: cachedData?.repositories || [],
        findings: cachedData?.findings || [],
        summary: cachedData?.summary || {},
        refreshData
    };
}
