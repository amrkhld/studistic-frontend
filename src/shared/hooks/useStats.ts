'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    apiGetDatasetStats,
    apiGetRiskDistribution,
    DatasetStats,
    RiskDistItem,
} from '@/lib/api';
import { datasetStats as mockStats, riskDistribution as mockRisk } from '@/lib/mock-data';

export function useStats() {
    const [stats, setStats] = useState<DatasetStats | null>(null);
    const [riskDistribution, setRiskDistribution] = useState<RiskDistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsData, riskData] = await Promise.all([
                apiGetDatasetStats(),
                apiGetRiskDistribution(),
            ]);
            setStats(statsData);
            setRiskDistribution(riskData);
        } catch {
            console.warn('Stats API unavailable, using mock data');
            setStats(mockStats as unknown as DatasetStats);
            setRiskDistribution(mockRisk);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, riskDistribution, isLoading, refresh: fetchStats };
}
