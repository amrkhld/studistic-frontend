'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ChevronDown } from 'lucide-react';
import { TaskData } from '@/lib/api';
import { Menu } from '@/shared/components/Menu';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<TaskData>) => Promise<void>;
    taskToEdit?: TaskData | null;
}

export function TaskModal({ isOpen, onClose, onSave, taskToEdit }: TaskModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskData['status']>('todo');
    const [priority, setPriority] = useState<TaskData['priority']>('medium');
    const [dueDate, setDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            setTitle(taskToEdit?.title || '');
            setDescription(taskToEdit?.description || '');
            setStatus(taskToEdit?.status || 'todo');
            setPriority(taskToEdit?.priority || 'medium');
            setDueDate(taskToEdit?.due_date ? taskToEdit.due_date.split('T')[0] : '');
        }
    }, [isOpen, taskToEdit]);

    if (!isOpen || !isMounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...(taskToEdit && { id: taskToEdit.id }),
                title,
                description,
                status,
                priority,
                due_date: dueDate || undefined,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-modal-backdrop">
            <div 
                className="w-full max-w-md p-6 rounded-2xl relative animate-modal-content shadow-2xl backdrop-blur-xl" 
                style={{ 
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <X size={18} />
                </button>

                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
                    {taskToEdit ? 'Edit Task' : 'New Task'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Title *</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            placeholder="What needs to be done?"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none min-h-[80px]"
                            placeholder="Add more details..."
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Status</label>
                            <Menu
                                align="left"
                                className="w-full"
                                fullWidthDropdown
                                trigger={
                                    <div 
                                        className="w-full px-3 py-2 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                    >
                                        <span>{status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Done'}</span>
                                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                }
                                items={[
                                    { label: 'To Do', onClick: () => setStatus('todo') },
                                    { label: 'In Progress', onClick: () => setStatus('in-progress') },
                                    { label: 'Done', onClick: () => setStatus('done') }
                                ]}
                            />
                        </div>
                        
                        {/* Priority */}
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Priority</label>
                            <Menu
                                align="left"
                                className="w-full"
                                fullWidthDropdown
                                trigger={
                                    <div 
                                        className="w-full px-3 py-2 rounded-xl text-[13px] outline-none cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
                                    >
                                        <span>{priority === 'low' ? 'Low' : priority === 'medium' ? 'Medium' : 'High'}</span>
                                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                }
                                items={[
                                    { label: 'Low', onClick: () => setPriority('low') },
                                    { label: 'Medium', onClick: () => setPriority('medium') },
                                    { label: 'High', onClick: () => setPriority('high') }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)', colorScheme: 'dark' }}
                        />
                    </div>

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
                            {isSaving ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
