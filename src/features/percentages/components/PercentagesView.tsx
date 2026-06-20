'use client';

import { useState, useEffect } from 'react';
import { usePrediction } from '@/shared/hooks/usePrediction';
import { useStats } from '@/shared/hooks/useStats';
import { PercentagesSkeleton } from '@/shared/components/LoadingSkeleton';
import { Slider, Pills } from '@/shared/components/FormControls';
import { getRiskBadgeClass } from '@/lib/mock-data';
import { 
    BarChart3, PieChart, Sparkles, Clock, Target, Moon, 
    BookOpen, Dumbbell, GraduationCap, RotateCcw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { StudentFeaturesPayload, PredictionResult } from '@/lib/api';

export function PercentagesView() {
    const { features, prediction, isLoading: predLoading, simulatePrediction } = usePrediction();
    const { stats, riskDistribution, isLoading: statsLoading } = useStats();

    // Simulation states
    const [simFeatures, setSimFeatures] = useState<StudentFeaturesPayload>({ ...features });
    const [simPrediction, setSimPrediction] = useState<PredictionResult | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [targetScore, setTargetScore] = useState<number>(85);
    const [optimizationPlan, setOptimizationPlan] = useState<string[]>([]);

    // Reset simulator when real features or predictions load
    useEffect(() => {
        if (features) {
            setSimFeatures({ ...features });
        }
    }, [features]);

    useEffect(() => {
        if (prediction) {
            setSimPrediction(prediction);
        }
    }, [prediction]);

    // Run debounced simulation predict call
    useEffect(() => {
        if (!features) return;

        // Skip predicting if it matches base features exactly
        if (JSON.stringify(simFeatures) === JSON.stringify(features)) {
            setSimPrediction(prediction);
            return;
        }

        setIsSimulating(true);
        const timer = setTimeout(async () => {
            try {
                const result = await simulatePrediction(simFeatures);
                if (result) {
                    setSimPrediction(result);
                }
            } catch (err) {
                console.error('Simulation run failed:', err);
            } finally {
                setIsSimulating(false);
            }
        }, 300); // 300ms debounce to prevent API thrashing on slider moves

        return () => clearTimeout(timer);
    }, [simFeatures, features, prediction, simulatePrediction]);

    // Re-calculate the optimization plan
    useEffect(() => {
        if (!simPrediction) return;

        const currentScore = simPrediction.predicted_score;
        const gap = targetScore - currentScore;

        if (gap <= 0) {
            setOptimizationPlan(['You have already achieved your target score! Great job.']);
            return;
        }

        const plan: string[] = [];

        // Simple heuristic rules to recommend adjustments based on SHAP coefficients
        if (simFeatures.attendance < 95 && gap > 0) {
            const neededAttendance = Math.min(98, simFeatures.attendance + Math.ceil(gap * 1.5));
            const diff = neededAttendance - simFeatures.attendance;
            if (diff > 2) {
                plan.push(`Increase Attendance from ${simFeatures.attendance}% to ${neededAttendance}% (+${diff}%)`);
            }
        }

        if (simFeatures.hours_studied < 30 && gap > 0) {
            const neededHours = Math.min(36, simFeatures.hours_studied + Math.ceil(gap * 0.8));
            const diff = neededHours - simFeatures.hours_studied;
            if (diff > 1) {
                plan.push(`Increase Study Hours from ${simFeatures.hours_studied}h to ${neededHours}h per week (+${diff}h)`);
            }
        }

        if (simFeatures.tutoring_sessions < 4 && gap > 0) {
            const neededSessions = Math.min(6, simFeatures.tutoring_sessions + 2);
            plan.push(`Attend ${neededSessions} Tutoring Sessions per month (currently ${simFeatures.tutoring_sessions})`);
        }

        if (simFeatures.sleep_hours < 8 && gap > 0) {
            plan.push('Ensure a consistent 7.5 to 8 hours of sleep for optimum memory retention');
        }

        if (simFeatures.motivation_level !== 'High') {
            plan.push('Aim for high motivation. Break tasks down into smaller milestones');
        }

        // Return top 3 recommendations
        setOptimizationPlan(plan.slice(0, 3));
    }, [simPrediction, targetScore, simFeatures]);

    if (predLoading || statsLoading || !prediction || !stats || !simPrediction) {
        return <PercentagesSkeleton />;
    }

    const baseScore = prediction.predicted_score;
    const simScore = simPrediction.predicted_score;
    const scoreDiff = simScore - baseScore;

    const handleReset = () => {
        setSimFeatures({ ...features });
        setSimPrediction(prediction);
    };

    const handleFeatureChange = <K extends keyof StudentFeaturesPayload>(key: K, value: StudentFeaturesPayload[K]) => {
        setSimFeatures(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <header>
                <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Feature Contributions</h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Analyze global feature impact and simulate how adjustments affect your prediction in real-time
                </p>
            </header>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Side: SHAP contributions and overall statistics */}
                <div className="lg:col-span-5 space-y-5">
                    {/* SHAP Chart */}
                    <div className="glass p-6 animate-slide-up stagger-1">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={15} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
                                <h2 className="text-[14px] font-semibold">Global Feature Importance</h2>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Model Analysis</span>
                        </div>
                        <div className="space-y-4">
                            {prediction.feature_importances.slice(0, 7).map((f, i) => {
                                const w = (f.importance / prediction.feature_importances[0].importance) * 100;
                                return (
                                    <div key={f.feature}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{i + 1}. {f.display_name}</span>
                                            <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--accent-cyan)' }}>{(f.importance * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="metric-bar">
                                            <div className="metric-bar-fill" style={{
                                                width: `${w}%`,
                                                background: i < 3 ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(56,189,248,0.3)',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Risk Distribution */}
                    <div className="glass p-6 animate-slide-up stagger-2">
                        <div className="flex items-center gap-2 mb-5">
                            <PieChart size={15} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} />
                            <h2 className="text-[14px] font-semibold">Risk Distribution</h2>
                        </div>
                        <div className="space-y-4">
                            {riskDistribution.map((r) => (
                                <div key={r.label}>
                                    <div className="flex justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span style={{ width: 8, height: 8, borderRadius: 3, background: r.color }} />
                                            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        </div>
                                        <span className="text-[12px] font-semibold" style={{ color: r.color }}>{r.percentage}%</span>
                                    </div>
                                    <div className="metric-bar">
                                        <div className="metric-bar-fill" style={{ width: `${r.percentage}%`, background: r.color }} />
                                    </div>
                                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.count.toLocaleString()} students</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stacked bar */}
                    <div className="glass p-5 animate-slide-up stagger-3">
                        <h3 className="text-[12px] font-semibold mb-3">Overall Distribution</h3>
                        <div className="flex rounded-lg overflow-hidden h-7">
                            {riskDistribution.map((r) => (
                                <div key={r.label} style={{ width: `${r.percentage}%`, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {r.percentage > 10 && <span className="text-[10px] font-bold text-white">{r.percentage}%</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: What-If ML Predictor Simulator */}
                <div className="lg:col-span-7 glass p-6 animate-slide-up stagger-2 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2">
                            <Sparkles size={15} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} />
                            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>"What-If" Academic Score Simulator</h2>
                        </div>
                        {JSON.stringify(simFeatures) !== JSON.stringify(features) && (
                            <button 
                                onClick={handleReset}
                                className="text-[10px] flex items-center gap-1 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold cursor-pointer"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <RotateCcw size={10} /> Reset Sliders
                            </button>
                        )}
                    </div>

                    {/* Live Simulation Display */}
                    <div 
                        className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl relative overflow-hidden transition-all duration-300"
                        style={{ 
                            background: 'rgba(255,255,255,0.015)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            opacity: isSimulating ? 0.7 : 1
                        }}
                    >
                        {/* Simulation indicator */}
                        {isSimulating && (
                            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--accent-purple)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" /> Calculating...
                            </div>
                        )}

                        {/* Simulated score */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Simulated Score</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[32px] font-bold font-mono leading-none" style={{ color: 'var(--accent-cyan)' }}>
                                    {simScore.toFixed(1)}%
                                </span>
                                {scoreDiff !== 0 && (
                                    <span 
                                        className="text-[11px] font-bold font-mono"
                                        style={{ color: scoreDiff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
                                    >
                                        {scoreDiff >= 0 ? `+${scoreDiff.toFixed(1)}%` : `${scoreDiff.toFixed(1)}%`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Simulated Risk level */}
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>Risk Level</div>
                            <div className={`${getRiskBadgeClass(simPrediction.risk_level)} mt-1`}>
                                {simPrediction.risk_level}
                            </div>
                        </div>

                        {/* Confidence */}
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Prediction Confidence</div>
                            <div className="text-[20px] font-bold font-mono" style={{ color: 'var(--accent-purple)' }}>
                                {simPrediction.confidence}%
                            </div>
                        </div>
                    </div>

                    {/* Simulator Inputs */}
                    <div className="space-y-5 pt-3">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Academic & Lifestyle Habits</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <Slider label="Attendance Rate" value={simFeatures.attendance}
                                onChange={(v) => handleFeatureChange('attendance', v)} min={0} max={100} unit="%" icon={Target} />
                            
                            <Slider label="Hours Studied / Week" value={simFeatures.hours_studied}
                                onChange={(v) => handleFeatureChange('hours_studied', v)} min={0} max={44} unit="h" icon={Clock} />

                            <Slider label="Previous Exam Scores" value={simFeatures.previous_scores}
                                onChange={(v) => handleFeatureChange('previous_scores', v)} min={0} max={100} unit="" icon={BookOpen} />

                            <Slider label="Sleep Hours / Night" value={simFeatures.sleep_hours}
                                onChange={(v) => handleFeatureChange('sleep_hours', v)} min={3} max={12} unit="h" icon={Moon} />
                            
                            <Slider label="Tutoring Sessions / Mo" value={simFeatures.tutoring_sessions}
                                onChange={(v) => handleFeatureChange('tutoring_sessions', v)} min={0} max={8} unit="" icon={GraduationCap} />

                            <Slider label="Physical Activity / Wk" value={simFeatures.physical_activity}
                                onChange={(v) => handleFeatureChange('physical_activity', v)} min={0} max={6} unit="h" icon={Dumbbell} />
                        </div>

                        {/* Environmental inputs */}
                        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Support & Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Pills label="Motivation Level" options={['Low', 'Medium', 'High']}
                                    value={simFeatures.motivation_level} onChange={(v) => handleFeatureChange('motivation_level', v)} />

                                <Pills label="Access to Resources" options={['Low', 'Medium', 'High']}
                                    value={simFeatures.access_to_resources} onChange={(v) => handleFeatureChange('access_to_resources', v)} />

                                <Pills label="Parental Involvement" options={['Low', 'Medium', 'High']}
                                    value={simFeatures.parental_involvement} onChange={(v) => handleFeatureChange('parental_involvement', v)} />

                                <Pills label="Peer Influence" options={['Negative', 'Neutral', 'Positive']}
                                    value={simFeatures.peer_influence} onChange={(v) => handleFeatureChange('peer_influence', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Goal Optimizer Section */}
                    <div className="p-5 rounded-2xl bg-white/[0.01] space-y-4" style={{ border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 size={13} style={{ color: 'var(--accent-green)' }} />
                                Real-Time Goal Optimizer
                            </h3>
                            {/* Selector for target score */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target:</span>
                                <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                                    <input 
                                        type="number" 
                                        min={50} max={100}
                                        value={targetScore} 
                                        onChange={(e) => setTargetScore(Math.max(50, Math.min(100, parseInt(e.target.value) || 0)))}
                                        className="w-8 outline-none font-bold text-[12px] text-right font-mono"
                                        style={{ background: 'transparent', color: 'var(--foreground)' }}
                                    />
                                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>%</span>
                                </div>
                            </div>
                        </div>

                        {/* Plan rendering */}
                        <div className="space-y-2">
                            {optimizationPlan.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-[12px]">
                                    <ChevronRight size={13} className="mt-1 text-sky-400 shrink-0" />
                                    <span style={{ color: step.startsWith('You') ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
