'use client';

import { useState } from 'react';
import { usePrediction } from '@/shared/hooks/usePrediction';
import { useStats } from '@/shared/hooks/useStats';
import { ComparisonsSkeleton } from '@/shared/components/LoadingSkeleton';
import { Menu } from '@/shared/components/Menu';
import { 
    ArrowRightLeft, ArrowUp, ArrowDown, Minus, ChevronDown, 
    AlertTriangle, CheckCircle2, AlertCircle, Info, Target 
} from 'lucide-react';

type PersonaType = 'average' | 'high_performer' | 'at_risk';

export function ComparisonsView() {
    const { features, isLoading: predLoading } = usePrediction();
    const { stats, isLoading: statsLoading } = useStats();
    const [peerPersona, setPeerPersona] = useState<PersonaType>('average');

    if (predLoading || statsLoading || !stats) return <ComparisonsSkeleton />;

    // Contextual peer persona stats mapping
    const cohortStats = {
        average: {
            attendance: stats.avg_attendance,
            hours_studied: stats.avg_hours_studied,
            sleep_hours: stats.avg_sleep_hours,
            previous_scores: stats.avg_previous_scores,
            physical_activity: stats.avg_physical_activity,
            tutoring_sessions: stats.avg_tutoring_sessions,
            label: 'Overall Class Average',
            color: 'var(--text-secondary)'
        },
        high_performer: {
            attendance: 93.5,
            hours_studied: 28.0,
            sleep_hours: 7.8,
            previous_scores: 86.5,
            physical_activity: 3.5,
            tutoring_sessions: 2.2,
            label: 'High Performers (Grade A/A+)',
            color: 'var(--accent-green)'
        },
        at_risk: {
            attendance: 62.5,
            hours_studied: 8.5,
            sleep_hours: 5.5,
            previous_scores: 55.0,
            physical_activity: 1.5,
            tutoring_sessions: 0.3,
            label: 'At-Risk Cohort (Grade D/F)',
            color: 'var(--accent-red)'
        }
    };

    const activeCohort = cohortStats[peerPersona];

    const comparisons = [
        { label: 'Attendance', yours: features.attendance, average: activeCohort.attendance, unit: '%', max: 100 },
        { label: 'Hours Studied', yours: features.hours_studied, average: activeCohort.hours_studied, unit: 'h/wk', max: 44 },
        { label: 'Previous Scores', yours: features.previous_scores, average: activeCohort.previous_scores, unit: '', max: 100 },
        { label: 'Sleep Hours', yours: features.sleep_hours, average: activeCohort.sleep_hours, unit: 'h', max: 10 },
        { label: 'Physical Activity', yours: features.physical_activity, average: activeCohort.physical_activity, unit: 'h/wk', max: 6 },
        { label: 'Tutoring Sessions', yours: features.tutoring_sessions, average: activeCohort.tutoring_sessions, unit: '', max: 8 },
    ];

    // Compute gaps for analysis
    const gaps = comparisons.map(c => {
        const diff = c.yours - c.average;
        const diffPct = c.average > 0 ? (diff / c.average) * 100 : 0;
        return {
            label: c.label,
            yours: c.yours,
            average: c.average,
            diff,
            diffPct,
            unit: c.unit
        };
    });

    // Helper to generate gap checklist feedback
    const generateGapInsights = () => {
        if (peerPersona === 'high_performer') {
            return gaps.map(g => {
                if (g.diff < -0.5) {
                    // Below high performers
                    const severity = g.diffPct < -20 ? 'high' : 'medium';
                    return {
                        severity,
                        text: `Gap in ${g.label}: You are ${Math.abs(g.diff).toFixed(1)}${g.unit} below High Performers. Target is ${g.average.toFixed(1)}${g.unit}.`,
                        action: g.label === 'Attendance' ? 'Attend classes regularly to catch up.' : 
                                g.label === 'Hours Studied' ? 'Dedicate 1.5 more hours of self-study daily.' : 
                                g.label === 'Tutoring Sessions' ? 'Seek tutoring to strengthen hard concepts.' : 
                                'Optimize schedule to meet this target.'
                    };
                } else {
                    return {
                        severity: 'success',
                        text: `Excellent ${g.label}: You match or beat the High Performers benchmark! (${g.yours.toFixed(1)}${g.unit} vs ${g.average.toFixed(1)}${g.unit})`,
                        action: 'Keep up this standard to lock in your score.'
                    };
                }
            });
        } else if (peerPersona === 'at_risk') {
            return gaps.map(g => {
                if (g.diff > 0.5) {
                    return {
                        severity: 'success',
                        text: `Healthy buffer on ${g.label}: You are +${g.diff.toFixed(1)}${g.unit} above struggling students.`,
                        action: 'Maintained buffer keeps you clear of risk zones.'
                    };
                } else {
                    return {
                        severity: 'high',
                        text: `Risk Zone in ${g.label}: You match or fall below the At-Risk threshold! (${g.yours.toFixed(1)}${g.unit} vs ${g.average.toFixed(1)}${g.unit})`,
                        action: `Critical: Immediately improve your ${g.label.toLowerCase()} to escape risk classification.`
                    };
                }
            });
        } else {
            // General class averages comparison
            return gaps.map(g => {
                if (g.diff >= -0.5 && g.diff <= 0.5) {
                    return {
                        severity: 'info',
                        text: `On par with Average on ${g.label}: (${g.yours.toFixed(1)}${g.unit})`,
                        action: 'Adding slight extra effort will push you above average.'
                    };
                } else if (g.diff > 0.5) {
                    return {
                        severity: 'success',
                        text: `Above Average on ${g.label}: You score +${g.diff.toFixed(1)}${g.unit} above standard class levels.`,
                        action: 'Excellent progress, you are leading the class.'
                    };
                } else {
                    return {
                        severity: 'medium',
                        text: `Below Average on ${g.label}: You fall ${Math.abs(g.diff).toFixed(1)}${g.unit} behind the class average.`,
                        action: `Focus on improving ${g.label.toLowerCase()} next week.`
                    };
                }
            });
        }
    };

    const insights = generateGapInsights();

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header with Selector */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Peer Comparisons</h1>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Compare your academic and lifestyle habits against selected student cohorts
                    </p>
                </div>

                {/* Dropdown Menu for Cohort selection */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Compare to:</span>
                    <Menu
                        align="right"
                        trigger={
                            <div 
                                className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-white/5 border border-white/5 bg-white/[0.02]"
                                style={{ color: activeCohort.color }}
                            >
                                <span>{activeCohort.label}</span>
                                <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        }
                        items={[
                            { 
                                label: 'Class Average', 
                                onClick: () => setPeerPersona('average'),
                                icon: <ArrowRightLeft size={12} style={{ color: 'var(--text-secondary)' }} />
                            },
                            { 
                                label: 'High Performers', 
                                onClick: () => setPeerPersona('high_performer'),
                                icon: <Target size={12} style={{ color: 'var(--accent-green)' }} />
                            },
                            { 
                                label: 'At-Risk Students', 
                                onClick: () => setPeerPersona('at_risk'),
                                icon: <AlertTriangle size={12} style={{ color: 'var(--accent-red)' }} />
                            }
                        ]}
                    />
                </div>
            </header>

            {/* Comparisons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {comparisons.map((c, i) => {
                    const diff = c.yours - c.average;
                    const diffPct = c.average > 0 ? ((diff / c.average) * 100).toFixed(1) : '0';
                    const isAbove = diff > 0.5;
                    const isBelow = diff < -0.5;
                    const yPct = (c.yours / c.max) * 100;
                    const aPct = (c.average / c.max) * 100;

                    return (
                        <div key={c.label} className={`glass p-5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{c.label}</h3>
                                <div className="flex items-center gap-1">
                                    {!isAbove && !isBelow ? <Minus size={13} style={{ color: 'var(--text-muted)' }} />
                                        : isAbove ? <ArrowUp size={13} style={{ color: 'var(--accent-green)' }} />
                                            : <ArrowDown size={13} style={{ color: 'var(--accent-red)' }} />}
                                    <span className="text-[11px] font-semibold"
                                        style={{ color: !isAbove && !isBelow ? 'var(--text-muted)' : isAbove ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                        {!isAbove && !isBelow ? 'On par' : `${isAbove ? '+' : ''}${diffPct}%`}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {/* Yours bar */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium" style={{ color: 'var(--accent-cyan)' }}>You</span>
                                        <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--accent-cyan)' }}>{c.yours}{c.unit}</span>
                                    </div>
                                    <div className="metric-bar" style={{ height: 8, borderRadius: 4 }}>
                                        <div className="metric-bar-fill" style={{ width: `${yPct}%`, background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))', height: 8, borderRadius: 4 }} />
                                    </div>
                                </div>
                                {/* Peer Average bar */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Cohort Avg</span>
                                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{c.average.toFixed(1)}{c.unit}</span>
                                    </div>
                                    <div className="metric-bar" style={{ height: 8, borderRadius: 4 }}>
                                        <div className="metric-bar-fill" style={{ width: `${aPct}%`, background: 'rgba(255,255,255,0.08)', height: 8, borderRadius: 4 }} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    Diff:{' '}
                                    <span style={{ color: !isAbove && !isBelow ? 'var(--text-muted)' : isAbove ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                                        {isAbove ? '+' : ''}{diff.toFixed(1)} {c.unit}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Gap Analysis & Action Items Card */}
            <div className="glass p-6 animate-slide-up">
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <ArrowRightLeft size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
                    <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>Gap Analysis & Recommendations</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((ins, idx) => (
                        <div key={idx} className="glass-subtle p-4 flex gap-3 items-start">
                            {ins.severity === 'high' ? (
                                <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-red)' }} />
                            ) : ins.severity === 'medium' ? (
                                <Info size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-amber)' }} />
                            ) : ins.severity === 'info' ? (
                                <Info size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                            ) : (
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-green)' }} />
                            )}
                            <div>
                                <div className="text-[12px] font-medium leading-tight" style={{ color: 'var(--foreground)' }}>
                                    {ins.text}
                                </div>
                                <div className="text-[10px] mt-1.5 font-medium leading-normal" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="font-semibold uppercase tracking-wider text-[8px] mr-1 bg-white/5 px-1 py-0.5 rounded" style={{ color: 'var(--accent-cyan)' }}>Suggestion</span>
                                    {ins.action}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
