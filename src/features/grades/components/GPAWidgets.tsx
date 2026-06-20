'use client';

import { useState } from 'react';
import { Sparkles, Trash2, Plus, RotateCcw, BarChart2 } from 'lucide-react';
import { GradeData } from '@/lib/api';
import { Menu } from '@/shared/components/Menu';
import { getGradeColor } from '@/lib/mock-data';

const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
};

interface SimulatedCourse {
    id: string;
    course_name: string;
    credits: number;
    grade: string;
}

interface GPAWidgetsProps {
    grades: GradeData[];
    currentGPA: number;
    currentCredits: number;
    currentPoints: number;
}

export function GPASimulator({ grades, currentGPA, currentCredits, currentPoints }: GPAWidgetsProps) {
    const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>([]);
    const [courseName, setCourseName] = useState('');
    const [credits, setCredits] = useState(3);
    const [grade, setGrade] = useState('A');

    // GPA calculations including simulation
    const totalSimCredits = simulatedCourses.reduce((s, c) => s + c.credits, 0);
    const totalSimPoints = simulatedCourses.reduce((s, c) => s + (gradePoints[c.grade] || 0) * c.credits, 0);

    const overallCredits = currentCredits + totalSimCredits;
    const overallPoints = currentPoints + totalSimPoints;
    const simulatedGPA = overallCredits > 0 ? (overallPoints / overallCredits) : 0;
    const gpaDifference = simulatedGPA - currentGPA;

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        const newCourse: SimulatedCourse = {
            id: `sim-${Math.random().toString(36).substring(2, 9)}`,
            course_name: courseName.trim() || `Simulated Course ${simulatedCourses.length + 1}`,
            credits,
            grade,
        };
        setSimulatedCourses((prev) => [...prev, newCourse]);
        setCourseName('');
    };

    const handleDeleteCourse = (id: string) => {
        setSimulatedCourses((prev) => prev.filter((c) => c.id !== id));
    };

    const handleReset = () => {
        setSimulatedCourses([]);
    };

    return (
        <div className="glass p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                    <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
                    <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>GPA Simulator</h2>
                </div>
                {simulatedCourses.length > 0 && (
                    <button 
                        onClick={handleReset}
                        className="text-[10px] flex items-center gap-1 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <RotateCcw size={10} /> Reset
                    </button>
                )}
            </div>

            {/* GPA Impact Display */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02]" style={{ border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Current GPA</div>
                    <div className="text-[20px] font-bold font-mono" style={{ color: 'var(--foreground)' }}>{currentGPA.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent-purple)' }}>Simulated GPA</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-bold font-mono" style={{ color: 'var(--accent-cyan)' }}>
                            {simulatedGPA.toFixed(2)}
                        </span>
                        {simulatedCourses.length > 0 && (
                            <span 
                                className="text-[10px] font-bold font-mono"
                                style={{ color: gpaDifference >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
                            >
                                {gpaDifference >= 0 ? `+${gpaDifference.toFixed(2)}` : gpaDifference.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Simulator Form */}
            <form onSubmit={handleAddCourse} className="space-y-4">
                {/* Course Name */}
                <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Course Title</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g. AI Algorithms"
                        className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                        style={{ 
                            background: 'rgba(255,255,255,0.04)', 
                            border: '1px solid rgba(255,255,255,0.08)', 
                            color: 'var(--foreground)' 
                        }}
                    />
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Credits */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Credits</label>
                        <Menu
                            align="left"
                            position="top"
                            className="w-full"
                            fullWidthDropdown
                            trigger={
                                <div 
                                    className="w-full px-3 py-2 rounded-xl text-[13px] cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                >
                                    <span>{credits} Credits</span>
                                </div>
                            }
                            items={[1, 2, 3, 4, 5].map((num) => ({
                                label: `${num} Credit${num > 1 ? 's' : ''}`,
                                onClick: () => setCredits(num),
                            }))}
                        />
                    </div>

                    {/* Expected Grade */}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Target Grade</label>
                        <Menu
                            align="left"
                            position="top"
                            className="w-full"
                            fullWidthDropdown
                            trigger={
                                <div 
                                    className="w-full px-3 py-2 rounded-xl text-[13px] cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                >
                                    <span style={{ color: getGradeColor(grade) }}>{grade}</span>
                                </div>
                            }
                            items={Object.keys(gradePoints).map((g) => ({
                                label: `${g} (${gradePoints[g].toFixed(1)} pts)`,
                                onClick: () => setGrade(g),
                            }))}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
                    style={{
                        background: 'rgba(56,189,248,0.1)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid rgba(56,189,248,0.15)',
                    }}
                >
                    <Plus size={13} /> Add to Simulation
                </button>
            </form>

            {/* List of Simulated Courses */}
            {simulatedCourses.length > 0 && (
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Simulated Courses</div>
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                        {simulatedCourses.map((c) => (
                            <div 
                                key={c.id}
                                className="flex justify-between items-center p-2.5 rounded-xl glass-subtle"
                            >
                                <div>
                                    <div className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{c.course_name}</div>
                                    <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.credits} Credits</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-bold" style={{ color: getGradeColor(c.grade) }}>
                                        {c.grade}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteCourse(c.id)}
                                        className="text-red-400/60 hover:text-red-400 p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function GradeDistribution({ grades }: { grades: GradeData[] }) {
    // Count grade groups
    const counts = { As: 0, Bs: 0, Cs: 0, Ds: 0, Fs: 0 };
    grades.forEach((g) => {
        if (g.grade.startsWith('A')) counts.As++;
        else if (g.grade.startsWith('B')) counts.Bs++;
        else if (g.grade.startsWith('C')) counts.Cs++;
        else if (g.grade.startsWith('D')) counts.Ds++;
        else if (g.grade === 'F') counts.Fs++;
    });

    const total = grades.length || 1;
    const data = [
        { label: 'A Grades (A+, A, A-)', count: counts.As, pct: (counts.As / total) * 100, color: '#34d399' },
        { label: 'B Grades (B+, B, B-)', count: counts.Bs, pct: (counts.Bs / total) * 100, color: '#38bdf8' },
        { label: 'C Grades (C+, C, C-)', count: counts.Cs, pct: (counts.Cs / total) * 100, color: '#fbbf24' },
        { label: 'D Grades (D+, D)', count: counts.Ds, pct: (counts.Ds / total) * 100, color: '#f87171' },
        { label: 'F Grades', count: counts.Fs, pct: (counts.Fs / total) * 100, color: 'rgba(200, 210, 255, 0.2)' },
    ];

    return (
        <div className="glass p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <BarChart2 size={14} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} />
                <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>Grade Distribution</h2>
            </div>

            {/* Distribution Graph */}
            {grades.length === 0 ? (
                <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    Add courses to view distribution
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((item) => (
                        <div key={item.label} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span className="font-semibold" style={{ color: item.count > 0 ? item.color : 'var(--text-muted)' }}>
                                    {item.count} course{item.count !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${item.pct}%`, 
                                        background: item.color,
                                        boxShadow: item.count > 0 ? `0 0 10px ${item.color}33` : 'none'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
