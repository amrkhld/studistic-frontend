'use client';

import '@/app/onboarding-slider.css';
import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiUpdateMyFeatures, StudentFeaturesPayload } from '@/lib/api';
import { Slider, Pills, Toggle } from '@/shared/components/FormControls';
import Logo from '@/assets/general/logo-transparent.png';
import {
    Clock, Target, Moon, BookOpen, Dumbbell, Users,
    Heart, GraduationCap, ArrowRight,
    ArrowLeft, Loader2, Sparkles, CheckCircle2,
} from 'lucide-react';

/* ───────── Step config ───────── */
const STEPS = [
    { title: 'Study Habits', desc: 'Your academic routine', icon: BookOpen },
    { title: 'Environment', desc: 'Support system & resources', icon: Users },
    { title: 'Personal Info', desc: 'A few more details', icon: Heart },
    { title: 'Ready!', desc: 'Review and get your prediction', icon: Sparkles },
];

/* ───────── Main ───────── */
export default function OnboardingPage() {
    const router = useRouter();
    const { token, user } = useAuth();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [f, setF] = useState<StudentFeaturesPayload>({
        hours_studied: 20, attendance: 80, sleep_hours: 7, previous_scores: 70,
        tutoring_sessions: 1, physical_activity: 3,
        parental_involvement: 'Medium', access_to_resources: 'Medium',
        extracurricular_activities: false, motivation_level: 'Medium',
        internet_access: true, family_income: 'Medium', teacher_quality: 'Medium',
        school_type: 'Public', peer_influence: 'Neutral', learning_disabilities: false,
        parental_education_level: 'High School', distance_from_home: 'Moderate', gender: 'Male',
    });

    const set = useCallback(<K extends keyof StudentFeaturesPayload>(k: K, v: StudentFeaturesPayload[K]) => {
        setF((prev) => ({ ...prev, [k]: v }));
    }, []);

    const handleSubmit = async () => {
        setError('');
        if (!token) {
            setError('Session expired. Please log in again.');
            setTimeout(() => router.push('/login'), 1500);
            return;
        }
        setIsSubmitting(true);
        try {
            await apiUpdateMyFeatures(f, token);
            router.push('/dashboard');
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save — redirecting to dashboard...');
            setTimeout(() => router.push('/dashboard'), 1500);
        }
    };

    const next = () => step < 3 && setStep(step + 1);
    const back = () => step > 0 && setStep(step - 1);

    /* ─── Step content ─── */
    const stepContent = useMemo(() => {
        switch (step) {
            case 0: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <Slider label="Hours Studied / Week" value={f.hours_studied} onChange={(v) => set('hours_studied', v)} min={0} max={44} unit="h" icon={Clock} />
                    <Slider label="Attendance Rate" value={f.attendance} onChange={(v) => set('attendance', v)} min={0} max={100} unit="%" icon={Target} />
                    <Slider label="Previous Exam Scores" value={f.previous_scores} onChange={(v) => set('previous_scores', v)} min={0} max={100} unit="" icon={BookOpen} />
                    <Slider label="Sleep Hours / Night" value={f.sleep_hours} onChange={(v) => set('sleep_hours', v)} min={3} max={12} unit="h" icon={Moon} />
                    <Slider label="Tutoring Sessions / Mo" value={f.tutoring_sessions} onChange={(v) => set('tutoring_sessions', v)} min={0} max={8} unit="" icon={GraduationCap} />
                    <Slider label="Physical Activity / Wk" value={f.physical_activity} onChange={(v) => set('physical_activity', v)} min={0} max={6} unit="h" icon={Dumbbell} />
                </div>
            );
            case 1: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Pills label="Parental Involvement" options={['Low', 'Medium', 'High']} value={f.parental_involvement} onChange={(v) => set('parental_involvement', v)} />
                    <Pills label="Access to Resources" options={['Low', 'Medium', 'High']} value={f.access_to_resources} onChange={(v) => set('access_to_resources', v)} />
                    <Pills label="Motivation Level" options={['Low', 'Medium', 'High']} value={f.motivation_level} onChange={(v) => set('motivation_level', v)} />
                    <Pills label="Family Income" options={['Low', 'Medium', 'High']} value={f.family_income} onChange={(v) => set('family_income', v)} />
                    <Pills label="Teacher Quality" options={['Low', 'Medium', 'High']} value={f.teacher_quality} onChange={(v) => set('teacher_quality', v)} />
                    <Pills label="Peer Influence" options={['Negative', 'Neutral', 'Positive']} value={f.peer_influence} onChange={(v) => set('peer_influence', v)} />
                </div>
            );
            case 2: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Pills label="Gender" options={['Male', 'Female']} value={f.gender} onChange={(v) => set('gender', v)} cols={2} />
                    <Pills label="School Type" options={['Public', 'Private']} value={f.school_type} onChange={(v) => set('school_type', v)} cols={2} />
                    <Pills label="Distance from Home" options={['Near', 'Moderate', 'Far']} value={f.distance_from_home} onChange={(v) => set('distance_from_home', v)} />
                    <Pills label="Parent Education" options={['High School', 'College', 'Postgraduate']} value={f.parental_education_level} onChange={(v) => set('parental_education_level', v)} />
                    <Toggle label="Internet Access" value={f.internet_access} onChange={(v) => set('internet_access', v)} />
                    <Toggle label="Extracurricular Activities" value={f.extracurricular_activities} onChange={(v) => set('extracurricular_activities', v)} />
                    <div className="md:col-span-2">
                        <Toggle label="Learning Disabilities" value={f.learning_disabilities} onChange={(v) => set('learning_disabilities', v)} />
                    </div>
                </div>
            );
            case 3: return (
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(52,211,153,0.1)' }}>
                        <CheckCircle2 size={24} strokeWidth={1.5} style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                        All set, {user?.full_name?.split(' ')[0] || 'there'}!
                    </h3>
                    <p className="text-[11px] leading-relaxed mb-5 max-w-[320px] mx-auto" style={{ color: 'var(--text-muted)' }}>
                        We&apos;ll generate your personalized performance prediction and actionable recommendations.
                    </p>
                    <div className="grid grid-cols-3 gap-3 max-w-[360px] mx-auto">
                        {[
                            { label: 'Attendance', val: `${f.attendance}%`, color: 'var(--accent-cyan)' },
                            { label: 'Study Hours', val: `${f.hours_studied}h/wk`, color: 'var(--accent-green)' },
                            { label: 'Prev. Scores', val: `${f.previous_scores}`, color: 'var(--accent-amber)' },
                        ].map((s) => (
                            <div key={s.label} className="glass-subtle p-3 rounded-xl">
                                <div className="text-[15px] font-bold" style={{ color: s.color }}>{s.val}</div>
                                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {error && (
                        <div className="mt-4 p-3 rounded-xl text-[11px] font-medium"
                            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.12)' }}>
                            {error}
                        </div>
                    )}
                </div>
            );
        }
    }, [step, f, set, user, error]);

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            {/* Left — Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center w-[42%] p-12 auth-logo">
                <div className="max-w-[320px]">
                    <Image src={Logo} alt="Studistic" width={200} height={67} priority />
                    <p className="text-[14px] mt-5 leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                        Let&apos;s set up your profile so we can generate{' '}
                        <span style={{ color: 'var(--accent-cyan)' }}>personalized predictions.</span>
                    </p>
                    <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        This takes about 2 minutes. Your data is only used for your own predictions and is never shared.
                    </p>

                    {/* Step indicator */}
                    <div className="mt-10 space-y-2">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 py-1.5 transition-all duration-200"
                                style={{ opacity: i <= step ? 1 : 0.35 }}>
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                    style={{
                                        background: i < step ? 'rgba(52,211,153,0.15)' : i === step ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                                        color: i < step ? 'var(--accent-green)' : i === step ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                    }}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold" style={{ color: i <= step ? 'var(--foreground)' : 'var(--text-muted)' }}>{s.title}</div>
                                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
                <div className="w-full max-w-[560px]">
                    {/* Mobile logo + progress */}
                    <div className="lg:hidden mb-6">
                        <Image src={Logo} alt="Studistic" width={120} height={40} className="mb-4" priority />
                        <div className="flex gap-1.5">
                            {STEPS.map((_, i) => (
                                <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: i < step ? '100%' : i === step ? '50%' : '0%',
                                            background: 'var(--accent-cyan)',
                                        }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card */}
                    <div className="auth-form glass p-7 rounded-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(56,189,248,0.1)' }}>
                                {(() => { const I = STEPS[step].icon; return <I size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />; })()}
                            </div>
                            <div>
                                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Step {step + 1} of {STEPS.length}
                                </span>
                                <h2 className="text-[16px] font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>
                                    {STEPS[step].title}
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="animate-fade-in" key={step}>
                            {stepContent}
                        </div>

                        {/* Nav */}
                        <div className="flex items-center justify-between mt-7 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {step > 0 ? (
                                <button type="button" onClick={back}
                                    className="flex items-center gap-1.5 text-[11px] font-medium transition-all cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}>
                                    <ArrowLeft size={13} /> Back
                                </button>
                            ) : <span />}

                            {step < 3 ? (
                                <button type="button" onClick={next}
                                    className="auth-btn flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-semibold"
                                    style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', color: '#fff', cursor: 'pointer' }}>
                                    Continue <ArrowRight size={13} />
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                                    className="auth-btn flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-semibold"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
                                        color: '#fff',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: isSubmitting ? 0.7 : 1,
                                    }}>
                                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <><Sparkles size={13} /> Get My Prediction</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
