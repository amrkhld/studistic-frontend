'use client';

import React from 'react';

/* ═══════════════════════════════════════════
   Shared Form Controls
   Reusable across Onboarding, Profile Edit, etc.
   ═══════════════════════════════════════════ */

/* ───────── Slider with filled track ───────── */
export function Slider({ label, value, onChange, min, max, unit, icon: Icon }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    unit: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={13} strokeWidth={1.5} style={{ color: 'rgba(200,210,255,0.4)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <span className="text-[13px] font-bold font-mono tabular-nums" style={{ color: 'var(--foreground)' }}>
                    {value}<span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>{unit}</span>
                </span>
            </div>
            <input type="range" min={min} max={max} value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="onboarding-slider"
                style={{
                    background: `linear-gradient(to right, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0.6) ${pct}%, rgba(255,255,255,0.06) ${pct}%, rgba(255,255,255,0.06) 100%)`,
                }} />
        </div>
    );
}

/* ───────── Option pills ───────── */
export function Pills({ label, options, value, onChange, cols = 3 }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    cols?: number;
}) {
    return (
        <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: 'var(--text-muted)' }}>{label}</label>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {options.map((o) => (
                    <button key={o} type="button" onClick={() => onChange(o)}
                        className="py-2 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer"
                        style={{
                            background: value === o ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${value === o ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.05)'}`,
                            color: value === o ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        }}>
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ───────── Toggle ───────── */
export function Toggle({ label, value, onChange }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button type="button" onClick={() => onChange(!value)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer"
            style={{
                background: value ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${value ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}>
            <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>{label}</span>
            <div className="w-8 h-[18px] rounded-full transition-all duration-200 flex items-center px-0.5 shrink-0"
                style={{ background: value ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)' }}>
                <div className="w-3.5 h-3.5 rounded-full bg-white transition-all duration-200"
                    style={{ transform: value ? 'translateX(13px)' : 'translateX(0)' }} />
            </div>
        </button>
    );
}
