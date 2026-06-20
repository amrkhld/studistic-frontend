'use client';

import { useState, useRef, ReactNode } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export interface MenuItemProps {
    label: string;
    icon?: ReactNode;
    onClick: (e: React.MouseEvent) => void;
    variant?: 'default' | 'danger';
}

export interface MenuProps {
    trigger: ReactNode;
    items: MenuItemProps[];
    align?: 'left' | 'right';
    position?: 'top' | 'bottom';
    className?: string;
    fullWidthDropdown?: boolean;
}

export function Menu({ trigger, items, align = 'right', position = 'bottom', className = '', fullWidthDropdown = false }: MenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsOpen(false));

    return (
        <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer w-full h-full">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute z-[9999] ${fullWidthDropdown ? 'w-full' : 'w-48'} max-h-64 overflow-y-auto rounded-xl shadow-2xl backdrop-blur-2xl animate-menu-fade-in ${
                        align === 'right' ? 'right-0' : 'left-0'
                    } ${
                        position === 'top' ? 'bottom-full mb-2 origin-bottom' : 'mt-2 origin-top'
                    }`}
                    style={{
                        background: 'rgba(8, 13, 31, 0.65)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    item.onClick(e);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                    item.variant === 'danger' 
                                        ? 'text-[#f87171] hover:bg-red-500/10' 
                                        : 'text-[var(--foreground)] hover:bg-white/10'
                                }`}
                            >
                                {item.icon && (
                                    <span style={{ color: item.variant === 'danger' ? '#f87171' : 'var(--text-muted)' }}>
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
