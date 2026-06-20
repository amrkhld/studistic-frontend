'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiGetTasks, apiCreateTask, apiUpdateTask, apiDeleteTask, TaskData } from '@/lib/api';
import { kanbanTasks as mockTasks } from '@/lib/mock-data';

export function useTasks() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            if (token) {
                const data = await apiGetTasks(token);
                setTasks(data);
            } else {
                setTasks(mockTasks as unknown as TaskData[]);
            }
        } catch {
            console.warn('Tasks API unavailable, using mock data');
            setTasks(mockTasks as unknown as TaskData[]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(async (task: Omit<TaskData, 'id' | 'user_id'>) => {
        if (!token) {
            const mockNew: TaskData = {
                ...task,
                id: Math.random().toString(36).substring(2, 9),
                user_id: 'mock-user',
            };
            setTasks((prev) => [...prev, mockNew]);
            return;
        }
        const newTask = await apiCreateTask(task, token);
        setTasks((prev) => [...prev, newTask]);
    }, [token]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Omit<TaskData, 'id' | 'user_id'>>) => {
        const originalTask = tasks.find(t => t.id === taskId);
        
        // Optimistically update the UI immediately
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));

        if (!token) return;

        try {
            const updated = await apiUpdateTask(taskId, updates, token);
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
        } catch (error) {
            console.error('Failed to update task, rolling back:', error);
            if (originalTask) {
                setTasks((prev) => prev.map((t) => (t.id === taskId ? originalTask : t)));
            }
        }
    }, [token, tasks]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!token) {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            return;
        }
        await apiDeleteTask(taskId, token);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }, [token]);

    return { tasks, isLoading, createTask, updateTask, deleteTask, refresh: fetchTasks };
}
