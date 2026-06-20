'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Auth layout — no sidebar, just aurora background + centered content.
 * Redirects to /dashboard if already authenticated (except on /onboarding).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only redirect away from login, to allow register to navigate to /onboarding
        if (!isLoading && isAuthenticated && pathname === '/login') {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-cyan)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    // Redirect is happening (for login when already authenticated)
    if (isAuthenticated && pathname === '/login') return null;

    return <>{children}</>;
}
