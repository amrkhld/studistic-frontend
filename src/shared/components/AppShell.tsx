'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Sidebar } from '@/shared/components/Sidebar';

/**
 * App shell — hides sidebar on auth pages, guards all other routes.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';

    // Redirect unauthenticated users to login (except on auth pages)
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isAuthPage) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, isLoading, isAuthPage, router, pathname]);

    // Auth pages: full-width, no sidebar, no guard
    if (isAuthPage) {
        return (
            <div className="relative z-10 flex w-full h-full items-center justify-center">
                {children}
            </div>
        );
    }

    // Loading state while checking auth
    if (isLoading) {
        return (
            <div className="relative z-10 flex w-full h-full items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: 'var(--accent-cyan)', borderTopColor: 'transparent' }} />
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated — don't render (redirect is happening)
    if (!isAuthenticated) return null;

    // Authenticated: sidebar + content
    return (
        <div className="relative z-10 flex w-full h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
