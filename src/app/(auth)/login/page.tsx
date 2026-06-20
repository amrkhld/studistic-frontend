'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import Logo from '@/assets/general/logo-transparent.png';
import { Mail, Lock, ArrowRight, Loader2, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('expired') === 'true') {
                setError('Your session has expired. Please sign in again.');
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left — Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center w-[48%] p-12 auth-logo">
                <div className="max-w-[360px]">
                    <Image
                        src={Logo}
                        alt="Studistic"
                        width={220}
                        height={73}
                        priority
                    />
                    <p className="text-[15px] mt-6 leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                        Predict Early. Act Smarter.<br />
                        <span style={{ color: 'var(--accent-cyan)' }}>Succeed Faster.</span>
                    </p>
                    <p className="text-[12px] mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        AI-powered student performance monitoring and early-warning system that helps you stay ahead of your academic goals.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-8 space-y-3">
                        {[
                            { icon: BarChart3, text: 'ML-powered score predictions', color: 'var(--accent-cyan)' },
                            { icon: ShieldCheck, text: 'Early risk detection & alerts', color: 'var(--accent-green)' },
                            { icon: Zap, text: 'Personalized recommendations', color: 'var(--accent-amber)' },
                        ].map((f) => (
                            <div key={f.text} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `color-mix(in srgb, ${f.color} 12%, transparent)` }}>
                                    <f.icon size={13} strokeWidth={1.5} style={{ color: f.color }} />
                                </div>
                                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden auth-logo text-center mb-8">
                        <Image src={Logo} alt="Studistic" width={150} height={50} className="mx-auto" priority />
                    </div>

                    <div className="auth-form glass p-8 rounded-2xl">
                        <div className="mb-6">
                            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                                Welcome back
                            </h1>
                            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                Sign in to continue to your dashboard
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 p-3 rounded-xl text-[12px] font-medium animate-slide-up"
                                style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.12)' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="login-email" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                    style={{ color: 'var(--text-muted)' }}>Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }} />
                                    <input id="login-email" type="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)} required
                                        placeholder="you@university.edu"
                                        className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="login-password" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                    style={{ color: 'var(--text-muted)' }}>Password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }} />
                                    <input id="login-password" type="password" value={password}
                                        onChange={(e) => setPassword(e.target.value)} required
                                        placeholder="Enter your password"
                                        className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                </div>
                            </div>

                            <button id="login-submit" type="submit" disabled={isLoading}
                                className="auth-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold mt-2"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                                    color: '#fff',
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                }}>
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={14} /></>}
                            </button>
                        </form>
                    </div>

                    <p className="auth-footer text-center mt-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent-cyan)' }}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
