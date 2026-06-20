'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '@/lib/api';

interface User {
    id: string;
    email: string;
    full_name: string;
    department: string;
    year: number;
    avatar_url?: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; full_name: string; department?: string; year?: number }) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'studistic_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        // Initialize token from localStorage synchronously to prevent flash
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    // Restore user profile from localStorage token on mount
    useEffect(() => {
        const restore = async () => {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            if (!savedToken) {
                setIsLoading(false);
                return;
            }
            try {
                const profile = await apiGetMe(savedToken);
                setUser(profile as User);
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
            }
            setIsLoading(false);
        };
        restore();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await apiLogin(email, password);
        setToken(res.access_token);
        localStorage.setItem(TOKEN_KEY, res.access_token);

        // Fetch full profile
        try {
            const profile = await apiGetMe(res.access_token);
            setUser(profile as User);
        } catch {
            setUser({
                id: res.user_id,
                email: res.email,
                full_name: res.full_name || '',
                department: 'College of Computing & IT',
                year: 1,
                created_at: new Date().toISOString(),
            });
        }
    }, []);

    const register = useCallback(async (data: {
        email: string;
        password: string;
        full_name: string;
        department?: string;
        year?: number;
    }) => {
        const res = await apiRegister(data);

        // Supabase may not return a session if email confirmation is enabled.
        // In that case, auto-login immediately after registration.
        let accessToken = res.access_token;

        if (!accessToken) {
            // Auto-login since we just created the account
            const loginRes = await apiLogin(data.email, data.password);
            accessToken = loginRes.access_token;
        }

        setToken(accessToken);
        localStorage.setItem(TOKEN_KEY, accessToken);

        // Set user immediately (don't wait for /me which may fail for new users)
        setUser({
            id: res.user_id,
            email: res.email,
            full_name: res.full_name || data.full_name,
            department: data.department || 'College of Computing & IT',
            year: data.year || 1,
            created_at: new Date().toISOString(),
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
