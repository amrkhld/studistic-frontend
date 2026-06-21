'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, Trash2, Edit2, MoreVertical, Sparkles } from 'lucide-react';
import { TaskData } from '@/lib/api';
import { forwardRef } from 'react';
import { Menu } from '@/shared/components/Menu';

export interface TaskCardNodeProps {
    task: TaskData;
    onEdit: (task: TaskData) => void;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
    isDragging?: boolean;
    attributes?: any;
    listeners?: any;
    style?: React.CSSProperties;
}

function PriorityDot({ priority }: { priority: string }) {
    const color = priority === 'high' ? '#f87171' : priority === 'medium' ? '#fbbf24' : '#34d399';
    return (
        <span 
            style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: color, 
                display: 'inline-block', 
                flexShrink: 0,
                boxShadow: `0 0 6px ${color}80` 
            }} 
        />
    );
}

export const TaskCardNode = forwardRef<HTMLDivElement, TaskCardNodeProps>(({
    task, onEdit, onDelete, isOverlay, isDragging, attributes, listeners, style
}, ref) => {
    const isSuggested = task.description?.includes('[AI Suggested]');
    const displayDescription = task.description
        ? task.description.replace('[AI Suggested]', '').trim()
        : '';

    return (
        <div
            ref={ref}
            id={isOverlay ? undefined : String(task.id)}
            style={style}
            className={`group relative glass p-4 rounded-[14px] transition-colors border ${
                isOverlay ? 'border-[var(--accent-cyan)] shadow-[0_0_20px_rgba(56,189,248,0.25)] cursor-grabbing scale-[1.02]' : 
                (isDragging ? 'opacity-30 border-transparent' : 'border-transparent hover:border-[rgba(255,255,255,0.1)]')
            }`}
        >
            <div className="flex items-start gap-2.5">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="mt-1 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-white/5 transition-colors -ml-1 -mt-1"
                >
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <PriorityDot priority={task.priority} />
                        <span className="text-[13px] font-semibold tracking-wide flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                            <span className="truncate">{task.title}</span>
                            {isSuggested && (
                                <Sparkles size={11} className="text-purple-400 animate-pulse shrink-0" style={{ color: 'var(--accent-purple)' }} />
                            )}
                        </span>
                    </div>
                    
                    {displayDescription && (
                        <p className="text-[11px] mb-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {displayDescription}
                        </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                        {isSuggested && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider text-white shrink-0 scale-90 -ml-1.5"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(56, 189, 248, 0.25))',
                                    border: '1px solid rgba(167, 139, 250, 0.3)',
                                    color: 'var(--accent-purple)'
                                }}>
                                Suggested
                            </span>
                        )}
                        {task.due_date && (
                            <div className="flex items-center gap-1.5">
                                <Calendar size={11} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions (Hover) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Menu
                    trigger={
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                            <MoreVertical size={14} />
                        </button>
                    }
                    items={[
                        { label: 'Edit Task', icon: <Edit2 size={14} />, onClick: (e) => { e.stopPropagation(); onEdit(task); } },
                        { label: 'Delete Task', icon: <Trash2 size={14} />, onClick: (e) => { e.stopPropagation(); onDelete(task.id); }, variant: 'danger' }
                    ]}
                />
            </div>
        </div>
    );
});
TaskCardNode.displayName = 'TaskCardNode';

export function TaskCard({ task, onEdit, onDelete }: Omit<TaskCardNodeProps, 'isOverlay' | 'isDragging' | 'attributes' | 'listeners' | 'style'>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 0 : 1,
    };

    return (
        <TaskCardNode
            ref={setNodeRef}
            style={style}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            isDragging={isDragging}
            attributes={attributes}
            listeners={listeners}
        />
    );
}
