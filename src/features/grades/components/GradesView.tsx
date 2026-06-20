'use client';

import { useState } from 'react';
import { useGrades } from '@/shared/hooks/useGrades';
import { getGradeColor } from '@/lib/mock-data';
import { GradesSkeleton } from '@/shared/components/LoadingSkeleton';
import { GraduationCap, Plus, Trash2, Calendar, Award } from 'lucide-react';
import { GPASimulator, GradeDistribution } from './GPAWidgets';
import { GradeModal } from './GradeModal';

const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
};

export function GradesView() {
    const { grades, isLoading, addGrade, deleteGrade } = useGrades();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <GradesSkeleton />;

    // Calculations
    const totalCredits = grades.reduce((s, g) => s + g.credit_hours, 0);
    const totalPoints = grades.reduce((s, g) => s + (gradePoints[g.grade] || 0) * g.credit_hours, 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const avgScore = grades.length > 0 ? grades.reduce((s, g) => s + g.score, 0) / grades.length : 0;

    // Grouping by Semester
    const semesters = grades.reduce((acc, g) => {
        if (!acc[g.semester]) acc[g.semester] = [];
        acc[g.semester].push(g);
        return acc;
    }, {} as Record<string, typeof grades>);

    // Sorted semesters (Fall 2025, Spring 2025, etc.)
    // A basic sorting helper for semesters:
    const sortedSemesters = Object.entries(semesters).sort((a, b) => {
        // Fall 2025 -> [Fall, 2025]
        const [semA, yearA] = a[0].split(' ');
        const [semB, yearB] = b[0].split(' ');
        const yA = parseInt(yearA) || 0;
        const yB = parseInt(yearB) || 0;
        
        if (yA !== yB) return yB - yA; // Newer years first
        
        const semOrder: Record<string, number> = { 'Fall': 3, 'Summer': 2, 'Spring': 1 };
        return (semOrder[semB] || 0) - (semOrder[semA] || 0);
    });

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteGrade(id);
        }
    };

    // Circular GPA Gauge variables
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const gpaPercent = Math.min(1, gpa / 4.0);
    const strokeDashoffset = circumference * (1 - gpaPercent);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Grades</h1>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Track your academic results across semesters and simulate your GPA</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-lg hover:translate-y-[-1px] active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                        color: '#fff',
                    }}
                >
                    <Plus size={14} /> Add Course
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* GPA Card with circular gauge */}
                <div className="glass p-5 animate-slide-up stagger-1 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full transform -rotate-95" viewBox="0 0 50 50">
                            {/* Background Circle */}
                            <circle 
                                cx="25" cy="25" r={radius} 
                                fill="transparent" 
                                stroke="rgba(255,255,255,0.03)" 
                                strokeWidth="4" 
                            />
                            {/* Progress Circle */}
                            <circle 
                                cx="25" cy="25" r={radius} 
                                fill="transparent" 
                                stroke="var(--accent-cyan)" 
                                strokeWidth="4"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out-in' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono" style={{ color: 'var(--foreground)' }}>
                            GPA
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Cumulative GPA</div>
                        <div className="text-[24px] font-bold leading-none font-mono" style={{ color: 'var(--accent-cyan)' }}>{gpa.toFixed(2)}</div>
                    </div>
                </div>

                {/* Average Score */}
                <div className="glass p-5 animate-slide-up stagger-2">
                    <div className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Average Score</div>
                    <div className="text-[28px] font-bold leading-none font-mono" style={{ color: 'var(--accent-purple)' }}>
                        {avgScore.toFixed(1)}<span className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>%</span>
                    </div>
                </div>

                {/* Total Credits */}
                <div className="glass p-5 animate-slide-up stagger-3">
                    <div className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Credits</div>
                    <div className="text-[28px] font-bold leading-none font-mono" style={{ color: 'var(--accent-green)' }}>
                        {totalCredits}<span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}> Hrs</span>
                    </div>
                </div>

                {/* Courses Count */}
                <div className="glass p-5 animate-slide-up stagger-4">
                    <div className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Courses</div>
                    <div className="text-[28px] font-bold leading-none font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {grades.length}<span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}> Enrolled</span>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Tables Panel */}
                <div className="lg:col-span-8 space-y-6">
                    {grades.length === 0 ? (
                        <div className="glass p-12 text-center animate-slide-up stagger-2">
                            <GraduationCap size={36} strokeWidth={1} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                            <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No Academic Grades Yet</h3>
                            <p className="text-[12px] max-w-sm mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>Add your courses with credit hours and final scores to calculate your GPA and analyze academic performance.</p>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                                style={{
                                    background: 'rgba(56,189,248,0.1)',
                                    color: 'var(--accent-cyan)',
                                    border: '1px solid rgba(56,189,248,0.15)',
                                }}
                            >
                                <Plus size={13} /> Add Your First Course
                            </button>
                        </div>
                    ) : (
                        sortedSemesters.map(([semester, semGrades], si) => {
                            // Calculate Semester GPA & Credits
                            const semCredits = semGrades.reduce((s, g) => s + g.credit_hours, 0);
                            const semPoints = semGrades.reduce((s, g) => s + (gradePoints[g.grade] || 0) * g.credit_hours, 0);
                            const semGPA = semCredits > 0 ? semPoints / semCredits : 0;

                            return (
                                <div key={semester} className={`glass p-6 animate-slide-up stagger-${Math.min(si + 2, 6)}`}>
                                    {/* Semester Header */}
                                    <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--accent-cyan)' }} />
                                            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>{semester}</h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="glass-subtle px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400">
                                                GPA: {semGPA.toFixed(2)}
                                            </span>
                                            <span className="glass-subtle px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                {semCredits} Credits
                                            </span>
                                        </div>
                                    </div>

                                    {/* Semester Course List */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    {['Course', 'Code', 'Score', 'Grade', 'Credits', ''].map((h) => (
                                                        <th key={h} className="text-[10px] font-semibold text-left py-2 px-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {semGrades.map((g) => (
                                                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <td className="py-3 px-3 text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{g.course_name}</td>
                                                        <td className="py-3 px-3 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{g.course_code}</td>
                                                        <td className="py-3 px-3 text-[12px] font-mono" style={{ color: 'var(--foreground)' }}>{g.score}</td>
                                                        <td className="py-3 px-3">
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                                                                style={{ background: `${getGradeColor(g.grade)}18`, color: getGradeColor(g.grade) }}>
                                                                {g.grade}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-[12px] font-mono" style={{ color: 'var(--text-muted)' }}>{g.credit_hours}</td>
                                                        <td className="py-2 px-2 text-right">
                                                            <button 
                                                                onClick={() => handleDelete(g.id, g.course_name)}
                                                                className="text-red-400/60 hover:text-red-400 hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer"
                                                                title="Delete Course"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar Panel */}
                <div className="lg:col-span-4 space-y-6">
                    {/* GPA Simulator */}
                    <div className="animate-slide-up stagger-2">
                        <GPASimulator 
                            grades={grades} 
                            currentGPA={gpa}
                            currentCredits={totalCredits}
                            currentPoints={totalPoints}
                        />
                    </div>

                    {/* Grade Distribution */}
                    <div className="animate-slide-up stagger-3">
                        <GradeDistribution grades={grades} />
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            <GradeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addGrade}
            />
        </div>
    );
}
