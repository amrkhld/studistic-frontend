'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import Logo from '@/assets/general/logo-transparent.png';
import { Mail, Lock, User, GraduationCap, Calendar, ArrowRight, Loader2, BarChart3, ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import { Menu } from '@/shared/components/Menu';

const PREDEFINED_COLLEGES = [
  'College of Computing & IT',
  'College of Engineering',
  'College of Business',
  'College of Science',
  'College of Humanities & Social Sciences',
  'College of Art & Design',
  'College of Medicine & Health Sciences',
];

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({
        full_name: '', email: '', password: '', confirmPassword: '',
        department: 'College of Computing & IT', year: 1,
    });
    const [isCustomActive, setIsCustomActive] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const update = (field: string, value: string | number) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setIsLoading(true);
        try {
            await register({ email: form.email, password: form.password, full_name: form.full_name, department: form.department, year: form.year });
            router.push('/onboarding');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left — Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center w-[48%] p-12 auth-logo">
                <div className="max-w-[360px]">
                    <Image src={Logo} alt="Studistic" width={220} height={73} priority />
                    <p className="text-[15px] mt-6 leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                        Predict Early. Act Smarter.<br />
                        <span style={{ color: 'var(--accent-cyan)' }}>Succeed Faster.</span>
                    </p>
                    <p className="text-[12px] mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        AI-powered student performance monitoring and early-warning system that helps you stay ahead of your academic goals.
                    </p>

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
                <div className="w-full max-w-[440px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden auth-logo text-center mb-8">
                        <Image src={Logo} alt="Studistic" width={150} height={50} className="mx-auto" priority />
                    </div>

                    <div className="auth-form glass p-8 rounded-2xl">
                        <div className="mb-6">
                            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                                Create your account
                            </h1>
                            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                Start tracking performance with AI-powered insights
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
                                <label htmlFor="register-name" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                    style={{ color: 'var(--text-muted)' }}>Full Name</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                    <input id="register-name" type="text" value={form.full_name}
                                        onChange={(e) => update('full_name', e.target.value)} required placeholder="Your full name"
                                        className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="register-email" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                    style={{ color: 'var(--text-muted)' }}>Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                    <input id="register-email" type="email" value={form.email}
                                        onChange={(e) => update('email', e.target.value)} required placeholder="you@university.edu"
                                        className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="register-password" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                        style={{ color: 'var(--text-muted)' }}>Password</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                        <input id="register-password" type="password" value={form.password}
                                            onChange={(e) => update('password', e.target.value)} required placeholder="Min 6 chars"
                                            className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="register-confirm" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                        style={{ color: 'var(--text-muted)' }}>Confirm</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                        <input id="register-confirm" type="password" value={form.confirmPassword}
                                            onChange={(e) => update('confirmPassword', e.target.value)} required placeholder="Repeat"
                                            className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="auth-divider text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                Academic Info
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                     <label htmlFor="register-department" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                         style={{ color: 'var(--text-muted)' }}>College / Faculty</label>
                                     <div className="relative">
                                         <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                         <Menu
                                             align="left"
                                             fullWidthDropdown
                                             className="w-full"
                                             trigger={
                                                 <div className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors">
                                                     <span>{form.department || 'Select College'}</span>
                                                     <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                                 </div>
                                             }
                                             items={[
                                                 { label: 'College of Computing & IT', onClick: () => { update('department', 'College of Computing & IT'); setIsCustomActive(false); } },
                                                 { label: 'College of Engineering', onClick: () => { update('department', 'College of Engineering'); setIsCustomActive(false); } },
                                                 { label: 'College of Business', onClick: () => { update('department', 'College of Business'); setIsCustomActive(false); } },
                                                 { label: 'College of Science', onClick: () => { update('department', 'College of Science'); setIsCustomActive(false); } },
                                                 { label: 'College of Humanities & Social Sciences', onClick: () => { update('department', 'College of Humanities & Social Sciences'); setIsCustomActive(false); } },
                                                 { label: 'College of Art & Design', onClick: () => { update('department', 'College of Art & Design'); setIsCustomActive(false); } },
                                                 { label: 'College of Medicine & Health Sciences', onClick: () => { update('department', 'College of Medicine & Health Sciences'); setIsCustomActive(false); } },
                                                 { label: 'Other (Custom...)', onClick: () => { update('department', ''); setIsCustomActive(true); } }
                                             ]}
                                         />
                                     </div>
                                     {(isCustomActive || (form.department && !PREDEFINED_COLLEGES.includes(form.department))) && (
                                         <div className="mt-1.5 animate-fade-in">
                                             <input
                                                 id="custom-college"
                                                 type="text"
                                                 value={form.department}
                                                 onChange={(e) => update('department', e.target.value)}
                                                 placeholder="Enter custom college name..."
                                                 className="auth-input w-full px-4 py-2.5 rounded-xl text-[13px] outline-none"
                                             />
                                         </div>
                                     )}
                                </div>
                                <div>
                                    <label htmlFor="register-year" className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block"
                                        style={{ color: 'var(--text-muted)' }}>Year</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                        <Menu
                                            align="left"
                                            fullWidthDropdown
                                            className="w-full"
                                            trigger={
                                                <div className="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors">
                                                    <span>Year {form.year}</span>
                                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                                </div>
                                            }
                                            items={[1, 2, 3, 4, 5, 6].map(y => ({
                                                label: `Year ${y}`,
                                                onClick: () => update('year', y)
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button id="register-submit" type="submit" disabled={isLoading}
                                className="auth-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold mt-1"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                                    color: '#fff',
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                }}>
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={14} /></>}
                            </button>
                        </form>
                    </div>

                    <p className="auth-footer text-center mt-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent-cyan)' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
