'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiGetGrades, apiAddGrade, apiDeleteGrade, GradeData } from '@/lib/api';
import { studentGrades as mockGrades } from '@/lib/mock-data';

export function useGrades() {
    const { token } = useAuth();
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGrades = useCallback(async () => {
        setIsLoading(true);
        try {
            if (token) {
                const data = await apiGetGrades(token);
                setGrades(data);
            } else {
                // Use mock data when not authenticated
                setGrades(mockGrades as unknown as GradeData[]);
            }
        } catch {
            console.warn('Grades API unavailable, using mock data');
            setGrades(mockGrades as unknown as GradeData[]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const addGrade = useCallback(async (grade: Omit<GradeData, 'id' | 'user_id'>) => {
        if (!token) {
            const newGrade: GradeData = {
                ...grade,
                id: `grade-${Math.random().toString(36).substring(2, 9)}`,
                user_id: 'guest',
            };
            setGrades((prev) => [newGrade, ...prev]);
            return;
        }
        await apiAddGrade(grade, token);
        await fetchGrades();
    }, [token, fetchGrades]);

    const deleteGrade = useCallback(async (gradeId: string) => {
        if (!token) {
            setGrades((prev) => prev.filter((g) => g.id !== gradeId));
            return;
        }
        await apiDeleteGrade(gradeId, token);
        setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    }, [token]);

    return { grades, isLoading, addGrade, deleteGrade, refresh: fetchGrades };
}
