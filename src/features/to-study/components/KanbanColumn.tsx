'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskData } from '@/lib/api';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    dot: string;
    tasks: TaskData[];
    onEditTask: (task: TaskData) => void;
    onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ id, title, dot, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'Column', column: { id, title } }
    });

    return (
        <div className="flex flex-col h-full animate-slide-up">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: dot }} />
                <h2 className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: `${dot}15`, color: dot }}>
                    {tasks.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div 
                ref={setNodeRef}
                className={`flex-1 rounded-2xl p-2 transition-colors duration-200 min-h-[150px] ${
                    isOver ? 'bg-white/5 border border-dashed border-white/20' : 'bg-transparent border border-transparent'
                }`}
            >
                <div className="space-y-3">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onEdit={onEditTask} 
                                onDelete={onDeleteTask} 
                            />
                        ))}
                    </SortableContext>

                    {tasks.length === 0 && (
                        <div className="text-center py-10 rounded-xl mt-2" style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Drop tasks here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
