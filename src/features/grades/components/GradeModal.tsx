'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ChevronDown } from 'lucide-react';
import { GradeData } from '@/lib/api';
import { Menu } from '@/shared/components/Menu';
import { getGradeColor } from '@/lib/mock-data';

interface GradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (grade: Omit<GradeData, 'id' | 'user_id'>) => Promise<void>;
}

const commonSemesters = ['Fall 2025', 'Spring 2025', 'Summer 2025', 'Fall 2024', 'Spring 2024'];
const creditHoursOptions = [1, 2, 3, 4, 5];
const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
};

// Helper to estimate grade from score
function getEstimatedGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D+';
    if (score >= 45) return 'D';
    return 'F';
}

export function GradeModal({ isOpen, onClose, onSave }: GradeModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [score, setScore] = useState<number | ''>('');
    const [grade, setGrade] = useState('A');
    const [creditHours, setCreditHours] = useState(3);
    
    const [semester, setSemester] = useState('Fall 2025');
    const [isCustomSemester, setIsCustomSemester] = useState(false);
    const [customSemesterText, setCustomSemesterText] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            setCourseName('');
            setCourseCode('');
            setScore('');
            setGrade('A');
            setCreditHours(3);
            setSemester('Fall 2025');
            setIsCustomSemester(false);
            setCustomSemesterText('');
        }
    }, [isOpen]);

    // Estimate grade on score change
    const handleScoreChange = (val: string) => {
        if (val === '') {
            setScore('');
            return;
        }
        const num = parseFloat(val);
        if (isNaN(num)) return;
        
        // Clamp score
        const clamped = Math.max(0, Math.min(100, num));
        setScore(clamped);
        setGrade(getEstimatedGrade(clamped));
    };

    if (!isOpen || !isMounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseName.trim() || !courseCode.trim() || score === '') return;

        setIsSaving(true);
        try {
            const finalSemester = isCustomSemester ? customSemesterText.trim() || 'Custom Semester' : semester;
            await onSave({
                course_name: courseName.trim(),
                course_code: courseCode.trim().toUpperCase(),
                score: Number(score),
                grade,
                semester: finalSemester,
                credit_hours: creditHours,
            });
            onClose();
        } catch (err) {
            console.error('Failed to save grade:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-modal-backdrop">
            <div 
                className="w-full max-w-md p-6 rounded-2xl relative animate-modal-content shadow-2xl backdrop-blur-xl" 
                style={{ 
                    background: 'rgba(8, 13, 31, 0.65)', 
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
                    Add Course & Grade
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Course Title */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Course Title *</label>
                        <input
                            required
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            placeholder="e.g. Data Structures"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                        />
                    </div>

                    {/* Course Code */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Course Code *</label>
                        <input
                            required
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            placeholder="e.g. CS201"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                        />
                    </div>

                    {/* Grid for Score and Grade */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Score */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Score (0-100) *</label>
                            <input
                                required
                                type="number"
                                min={0}
                                max={100}
                                step="any"
                                value={score}
                                onChange={(e) => handleScoreChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none font-mono"
                                placeholder="85"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                            />
                        </div>

                        {/* Grade select */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Grade</label>
                            <Menu
                                align="left"
                                className="w-full"
                                fullWidthDropdown
                                trigger={
                                    <div 
                                        className="w-full px-3 py-2 rounded-xl text-[13px] cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                    >
                                        <span style={{ color: getGradeColor(grade) }}>{grade}</span>
                                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                }
                                items={Object.keys(gradePoints).map((g) => ({
                                    label: `${g} (${gradePoints[g].toFixed(1)} pts)`,
                                    onClick: () => setGrade(g),
                                }))}
                            />
                        </div>
                    </div>

                    {/* Grid for Credits and Semester */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Credit Hours */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Credits</label>
                            <Menu
                                align="left"
                                className="w-full"
                                fullWidthDropdown
                                trigger={
                                    <div 
                                        className="w-full px-3 py-2 rounded-xl text-[13px] cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                    >
                                        <span>{creditHours} Credits</span>
                                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                }
                                items={creditHoursOptions.map((h) => ({
                                    label: `${h} Credit${h > 1 ? 's' : ''}`,
                                    onClick: () => setCreditHours(h),
                                }))}
                            />
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Semester</label>
                            <Menu
                                align="left"
                                className="w-full"
                                fullWidthDropdown
                                trigger={
                                    <div 
                                        className="w-full px-3 py-2 rounded-xl text-[13px] cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                    >
                                        <span className="truncate">{isCustomSemester ? 'Custom...' : semester}</span>
                                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                }
                                items={[
                                    ...commonSemesters.map((s) => ({
                                        label: s,
                                        onClick: () => {
                                            setSemester(s);
                                            setIsCustomSemester(false);
                                        },
                                    })),
                                    {
                                        label: 'Custom...',
                                        onClick: () => setIsCustomSemester(true),
                                    }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Custom Semester text input (if selected) */}
                    {isCustomSemester && (
                        <div className="animate-fade-in">
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Custom Semester Name *</label>
                            <input
                                required
                                type="text"
                                value={customSemesterText}
                                onChange={(e) => setCustomSemesterText(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                                placeholder="e.g. Winter 2026"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                            />
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer hover:bg-white/5"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-lg"
                            style={{ 
                                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', 
                                color: '#fff',
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Saving...' : 'Save Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
