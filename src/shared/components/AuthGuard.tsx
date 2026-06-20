'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Auth guard — wraps protected content and redirects to /login if not authenticated.
 * Place this inside components that require authentication.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: 'var(--accent-cyan)', borderTopColor: 'transparent' }} />
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
