'use client';

import { 
    GraduationCap, Calendar, BarChart3, PieChart, 
    Sparkles, CheckCircle2, ChevronRight, ArrowRightLeft,
    GripVertical 
} from 'lucide-react';

/**
 * Pulsing skeleton loader that matches the Studistic glass aesthetic.
 */
export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl animate-pulse"
                    style={{
                        height: i === 0 ? 24 : 16,
                        width: `${85 - i * 12}%`,
                        background: 'rgba(255,255,255,0.04)',
                    }}
                />
            ))}
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            <div className="space-y-2">
                <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-72 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 glass p-6 animate-pulse" style={{ minHeight: 180 }}>
                    <LoadingSkeleton lines={4} />
                </div>
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass p-5 animate-pulse" style={{ minHeight: 120 }}>
                            <LoadingSkeleton lines={3} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 glass p-6 animate-pulse" style={{ minHeight: 200 }}>
                    <LoadingSkeleton lines={6} />
                </div>
                <div className="lg:col-span-5 glass p-6 animate-pulse" style={{ minHeight: 200 }}>
                    <LoadingSkeleton lines={4} />
                </div>
            </div>
        </div>
    );
}

export function GradesSkeleton() {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-2">
                    <div className="h-7 w-24 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-4 w-72 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div className="h-9 w-32 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </header>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Cumulative GPA */}
                <div className="glass p-5 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-white/[0.03] animate-pulse shrink-0" />
                    <div className="space-y-2">
                        <div className="h-3 w-20 rounded bg-white/[0.03]" />
                        <div className="h-6 w-12 rounded bg-white/[0.06]" />
                    </div>
                </div>
                {/* Average Score */}
                <div className="glass p-5 animate-pulse space-y-3">
                    <div className="h-3 w-20 rounded bg-white/[0.03]" />
                    <div className="h-7 w-16 rounded bg-white/[0.06]" />
                </div>
                {/* Total Credits */}
                <div className="glass p-5 animate-pulse space-y-3">
                    <div className="h-3 w-20 rounded bg-white/[0.03]" />
                    <div className="h-7 w-16 rounded bg-white/[0.06]" />
                </div>
                {/* Courses Count */}
                <div className="glass p-5 animate-pulse space-y-3">
                    <div className="h-3 w-16 rounded bg-white/[0.03]" />
                    <div className="h-7 w-24 rounded bg-white/[0.06]" />
                </div>
            </div>

            {/* Main Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Tables Panel (Left side, col-span-8) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Semester Card 1 */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="opacity-30" />
                                <div className="h-5 w-24 rounded bg-white/[0.06] animate-pulse" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-white/[0.04] animate-pulse" />
                                <div className="h-5 w-16 rounded-full bg-white/[0.04] animate-pulse" />
                            </div>
                        </div>
                        {/* Course table skeleton */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-5 gap-2 pb-2 border-b border-white/[0.04]">
                                <div className="h-3 w-16 rounded bg-white/[0.03]" />
                                <div className="h-3 w-12 rounded bg-white/[0.03]" />
                                <div className="h-3 w-8 rounded bg-white/[0.03]" />
                                <div className="h-3 w-10 rounded bg-white/[0.03]" />
                                <div className="h-3 w-10 rounded bg-white/[0.03]" />
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="grid grid-cols-5 gap-2 py-1 border-b border-white/[0.02] items-center">
                                    <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
                                    <div className="h-3.5 w-16 rounded bg-white/[0.03] animate-pulse" />
                                    <div className="h-4 w-8 rounded bg-white/[0.04] animate-pulse" />
                                    <div className="h-4 w-10 rounded bg-white/[0.05] animate-pulse" />
                                    <div className="h-3.5 w-8 rounded bg-white/[0.03] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Semester Card 2 */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="opacity-30" />
                                <div className="h-5 w-24 rounded bg-white/[0.06] animate-pulse" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-5 w-16 rounded-full bg-white/[0.04] animate-pulse" />
                                <div className="h-5 w-16 rounded-full bg-white/[0.04] animate-pulse" />
                            </div>
                        </div>
                        {/* Course table skeleton */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-5 gap-2 pb-2 border-b border-white/[0.04]">
                                <div className="h-3 w-16 rounded bg-white/[0.03]" />
                                <div className="h-3 w-12 rounded bg-white/[0.03]" />
                                <div className="h-3 w-8 rounded bg-white/[0.03]" />
                                <div className="h-3 w-10 rounded bg-white/[0.03]" />
                                <div className="h-3 w-10 rounded bg-white/[0.03]" />
                            </div>
                            {[1, 2].map((i) => (
                                <div key={i} className="grid grid-cols-5 gap-2 py-1 border-b border-white/[0.02] items-center">
                                    <div className="h-4 w-28 rounded bg-white/[0.04] animate-pulse" />
                                    <div className="h-3.5 w-14 rounded bg-white/[0.03] animate-pulse" />
                                    <div className="h-4 w-8 rounded bg-white/[0.04] animate-pulse" />
                                    <div className="h-4 w-10 rounded bg-white/[0.05] animate-pulse" />
                                    <div className="h-3.5 w-8 rounded bg-white/[0.03] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Panel (Right side, col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* GPA Simulator */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                            <div className="flex items-center gap-2">
                                <GraduationCap size={15} className="opacity-30" />
                                <div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" />
                            </div>
                        </div>
                        {/* Simulated output block */}
                        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex justify-between">
                            <div className="space-y-1.5">
                                <div className="h-3 w-20 rounded bg-white/[0.03]" />
                                <div className="h-6 w-14 rounded bg-white/[0.06] animate-pulse" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 w-16 rounded bg-white/[0.03]" />
                                <div className="h-6 w-12 rounded bg-white/[0.05] animate-pulse" />
                            </div>
                        </div>
                        {/* Simulator inputs */}
                        <div className="space-y-3">
                            <div className="h-3 w-16 rounded bg-white/[0.03]" />
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="h-3.5 w-24 rounded bg-white/[0.04] animate-pulse" />
                                        <div className="h-3 w-8 rounded bg-white/[0.04] animate-pulse" />
                                    </div>
                                    <div className="h-1.5 w-full rounded bg-white/[0.03]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grade Distribution */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
                            <div className="w-4 h-4 rounded bg-white/[0.05] animate-pulse" />
                            <div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" />
                        </div>
                        {/* Bars skeleton */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <div className="h-3.5 w-8 rounded bg-white/[0.04]" />
                                        <div className="h-3.5 w-12 rounded bg-white/[0.04]" />
                                    </div>
                                    <div className="h-3 w-full rounded bg-white/[0.03] overflow-hidden">
                                        <div className="h-full bg-white/[0.05] animate-pulse" style={{ width: `${80 - i * 20}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PercentagesSkeleton() {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <header className="space-y-2">
                <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-96 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            </header>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Side (Col-span-5) */}
                <div className="lg:col-span-5 space-y-5">
                    {/* SHAP Chart */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={15} className="opacity-30" />
                                <div className="h-4 w-36 rounded bg-white/[0.06] animate-pulse" />
                            </div>
                            <div className="h-3 w-16 rounded bg-white/[0.03]" />
                        </div>
                        {/* Feature contribution bars */}
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="h-3.5 w-32 rounded bg-white/[0.04]" />
                                        <div className="h-3 w-8 rounded bg-white/[0.04]" />
                                    </div>
                                    <div className="h-1.5 w-full rounded bg-white/[0.03] overflow-hidden">
                                        <div className="h-full bg-white/[0.05] animate-pulse" style={{ width: `${90 - i * 12}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Distribution */}
                    <div className="glass p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
                            <PieChart size={15} className="opacity-30" />
                            <div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" />
                        </div>
                        {/* Risk distribution bars */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
                                            <div className="h-3.5 w-20 rounded bg-white/[0.04]" />
                                        </div>
                                        <div className="h-3.5 w-8 rounded bg-white/[0.04]" />
                                    </div>
                                    <div className="h-1.5 w-full rounded bg-white/[0.03] overflow-hidden">
                                        <div className="h-full bg-white/[0.05] animate-pulse" style={{ width: i === 1 ? '55%' : i === 2 ? '30%' : '15%' }} />
                                    </div>
                                    <div className="h-3 w-16 rounded bg-white/[0.02]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overall Distribution (Stacked bar) */}
                    <div className="glass p-5 space-y-3">
                        <div className="h-3.5 w-28 rounded bg-white/[0.04]" />
                        <div className="h-7 w-full rounded-lg bg-white/[0.03] animate-pulse" />
                    </div>
                </div>

                {/* Right Side (Col-span-7) */}
                <div className="lg:col-span-7 glass p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                            <Sparkles size={15} className="opacity-30" />
                            <div className="h-4 w-44 rounded bg-white/[0.06] animate-pulse" />
                        </div>
                    </div>

                    {/* Live Simulation Display Block */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                        <div className="space-y-2">
                            <div className="h-3.5 w-24 rounded bg-white/[0.03]" />
                            <div className="h-8 w-20 rounded bg-white/[0.06] animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3.5 w-16 rounded bg-white/[0.03]" />
                            <div className="h-6 w-24 rounded-full bg-white/[0.05] animate-pulse" style={{ marginTop: 6 }} />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3.5 w-28 rounded bg-white/[0.03]" />
                            <div className="h-8 w-16 rounded bg-white/[0.05] animate-pulse" />
                        </div>
                    </div>

                    {/* Simulator Inputs */}
                    <div className="space-y-5 pt-3">
                        <div className="h-4 w-48 rounded bg-white/[0.04]" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded bg-white/[0.03]" />
                                            <div className="h-3.5 w-24 rounded bg-white/[0.04]" />
                                        </div>
                                        <div className="h-3 w-8 rounded bg-white/[0.03]" />
                                    </div>
                                    <div className="h-1.5 w-full rounded bg-white/[0.03]" />
                                </div>
                            ))}
                        </div>

                        {/* Environmental inputs */}
                        <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                            <div className="h-4 w-40 rounded bg-white/[0.04]" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3.5 w-28 rounded bg-white/[0.03]" />
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="h-8 rounded bg-white/[0.03] animate-pulse" />
                                            <div className="h-8 rounded bg-white/[0.03] animate-pulse" />
                                            <div className="h-8 rounded bg-white/[0.03] animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Goal Optimizer Section */}
                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-36 rounded bg-white/[0.04]" />
                            <div className="h-6 w-20 rounded bg-white/[0.03]" />
                        </div>
                        <div className="space-y-2.5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <ChevronRight size={13} className="opacity-30" />
                                    <div className="h-3.5 w-[85%] rounded bg-white/[0.03] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ComparisonsSkeleton() {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-2">
                    <div className="h-7 w-36 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-4 w-80 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div className="h-9 w-40 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </header>

            {/* Comparisons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="glass p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-28 rounded bg-white/[0.05] animate-pulse" />
                            <div className="h-3.5 w-16 rounded bg-white/[0.04] animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            {/* You bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <div className="h-3 w-8 rounded bg-white/[0.03]" />
                                    <div className="h-3 w-10 rounded bg-white/[0.03]" />
                                </div>
                                <div className="h-2 w-full rounded bg-white/[0.03] overflow-hidden">
                                    <div className="h-full bg-white/[0.05] animate-pulse" style={{ width: `${70 - i * 5}%` }} />
                                </div>
                            </div>
                            {/* Cohort bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <div className="h-3 w-16 rounded bg-white/[0.03]" />
                                    <div className="h-3 w-10 rounded bg-white/[0.03]" />
                                </div>
                                <div className="h-2 w-full rounded bg-white/[0.03] overflow-hidden">
                                    <div className="h-full bg-white/[0.04] animate-pulse" style={{ width: `${60 + i * 3}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-white/[0.04] text-center">
                            <div className="h-3 w-20 rounded bg-white/[0.02] mx-auto animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Gap Analysis Card */}
            <div className="glass p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
                    <ArrowRightLeft size={15} className="opacity-30" />
                    <div className="h-4 w-48 rounded bg-white/[0.06] animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-subtle p-4 flex gap-3 items-start animate-pulse">
                            <div className="w-4 h-4 rounded-full bg-white/[0.03] shrink-0 mt-0.5" />
                            <div className="space-y-2 w-full">
                                <div className="h-3.5 w-[90%] rounded bg-white/[0.03]" />
                                <div className="h-3 w-[50%] rounded bg-white/[0.02]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function KanbanSkeleton() {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in h-full flex flex-col">
            {/* Header Skeleton */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
                <div className="space-y-2">
                    <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-4 w-72 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div className="h-9 w-28 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </header>

            {/* Columns Grid */}
            <div className="flex-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
                    {[
                        { title: 'To Do', color: '#f87171', count: 3 },
                        { title: 'In Progress', color: '#fbbf24', count: 2 },
                        { title: 'Done', color: '#34d399', count: 1 },
                    ].map((col, index) => (
                        <div key={index} className="flex flex-col h-full animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: col.color, boxShadow: `0 0 6px ${col.color}80` }} />
                                <span className="text-[13px] font-semibold text-white/40">{col.title}</span>
                                <div className="h-4.5 w-6 rounded-full ml-auto bg-white/[0.04] animate-pulse flex items-center justify-center text-[10px] text-white/30 font-bold" />
                            </div>

                            {/* Column Area */}
                            <div className="flex-1 space-y-3">
                                {Array.from({ length: col.count }).map((_, i) => (
                                    <div key={i} className="glass p-4 rounded-[14px] flex items-start gap-2.5 border border-transparent">
                                        {/* Grip Handle */}
                                        <div className="mt-1 opacity-20 shrink-0">
                                            <GripVertical size={14} className="text-white/40" />
                                        </div>
                                        {/* Task Content */}
                                        <div className="flex-1 space-y-2.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color, boxShadow: `0 0 4px ${col.color}80` }} />
                                                <div className="h-4 w-[60%] rounded bg-white/[0.05] animate-pulse" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
                                                {i % 2 === 0 && <div className="h-3 w-[80%] rounded bg-white/[0.03] animate-pulse" />}
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <Calendar size={11} className="opacity-20 text-white/40" />
                                                <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

