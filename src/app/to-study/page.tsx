'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    DndContext, 
    DragOverlay, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasks } from '@/shared/hooks/useTasks';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePrediction } from '@/shared/hooks/usePrediction';
import { KanbanSkeleton } from '@/shared/components/LoadingSkeleton';
import { Plus, Sparkles, Check, X, Lock } from 'lucide-react';
import { KanbanColumn } from '@/features/to-study/components/KanbanColumn';
import { TaskCard, TaskCardNode } from '@/features/to-study/components/TaskCard';
import { TaskModal } from '@/features/to-study/components/TaskModal';
import { PremiumUpgradeModal } from '@/shared/components/PremiumUpgradeModal';
import { TaskData, apiGetGeminiSuggestedTasks, GeminiSuggestedTask } from '@/lib/api';

const COLUMNS = [
    { id: 'todo', title: 'To Do', dot: '#f87171' },
    { id: 'in-progress', title: 'In Progress', dot: '#fbbf24' },
    { id: 'done', title: 'Done', dot: '#34d399' },
];

export default function ToStudyPage() {
    const { user, token } = useAuth();
    const { features, prediction } = usePrediction();
    const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
    const [activeTask, setActiveTask] = useState<TaskData | null>(null);
    const [activeTaskWidth, setActiveTaskWidth] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<TaskData | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [suggestions, setSuggestions] = useState<GeminiSuggestedTask[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load AI Suggested Tasks for Pro members
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (user?.is_premium && token && features && prediction) {
                setIsFetchingSuggestions(true);
                try {
                    const data = await apiGetGeminiSuggestedTasks(features, prediction.predicted_score, token);
                    // Filter out suggestions that match existing tasks by title
                    const existingTitles = tasks.map(t => t.title.toLowerCase());
                    const filtered = data.filter(s => !existingTitles.includes(s.title.toLowerCase()));
                    setSuggestions(filtered);
                } catch (e) {
                    console.warn('Failed to load suggested tasks:', e);
                } finally {
                    setIsFetchingSuggestions(false);
                }
            } else {
                setSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [user?.is_premium, token, features, prediction, tasks.length]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (isLoading) return <KanbanSkeleton />;

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
            const element = document.getElementById(String(active.id));
            if (element) {
                setActiveTaskWidth(element.getBoundingClientRect().width);
            } else if (active.rect.current?.initial?.width) {
                setActiveTaskWidth(active.rect.current.initial.width);
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        setActiveTaskWidth(null);

        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === taskId);
        if (!activeTask) return;

        const targetColumnId = (COLUMNS.find(c => c.id === overId)?.id 
            || tasks.find(t => t.id === overId)?.status) as TaskData['status'];

        if (targetColumnId && activeTask.status !== targetColumnId) {
            await updateTask(taskId, { status: targetColumnId });
        }
    };

    const handleOpenModal = (task?: TaskData) => {
        setTaskToEdit(task || null);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: Partial<TaskData>) => {
        if (taskData.id) {
            const { id, ...updates } = taskData;
            await updateTask(id, updates);
        } else {
            await createTask(taskData as Omit<TaskData, 'id' | 'user_id'>);
        }
    };

    const handleConfirmSuggestion = async (suggested: GeminiSuggestedTask) => {
        try {
            await createTask({
                title: suggested.title,
                description: suggested.description,
                priority: suggested.priority,
                status: 'todo',
                due_date: suggested.due_date,
            });
            // Dismiss locally
            setSuggestions(prev => prev.filter(s => s.title !== suggested.title));
        } catch (e) {
            console.error('Failed to confirm suggestion:', e);
        }
    };

    const handleDismissSuggestion = (title: string) => {
        setSuggestions(prev => prev.filter(s => s.title !== title));
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 h-full flex flex-col animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>To-Study Board</h1>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Organize your study tasks with a Kanban workflow</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer btn-minimal"
                    style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(56,189,248,0.15)' }}
                >
                    <Plus size={14} /> Add Task
                </button>
            </header>

            <div className="flex-1 min-h-0">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCorners} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
                        {COLUMNS.map((col) => {
                            const colTasks = tasks.filter((t) => t.status === col.id);
                            
                            // Prepare AI suggested items for the 'todo' column
                            let suggestedNodes: React.ReactNode = null;
                            if (col.id === 'todo') {
                                if (user?.is_premium) {
                                    if (suggestions.length > 0) {
                                        suggestedNodes = (
                                            <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-3">
                                                <div className="flex items-center gap-1.5 px-1">
                                                    <Sparkles size={12} style={{ color: 'var(--accent-purple)' }} className="animate-pulse" />
                                                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)' }}>AI Suggested Tasks</span>
                                                </div>
                                                {suggestions.map((s, idx) => (
                                                    <div key={idx} className="glass p-3.5 rounded-[14px] border border-dashed border-purple-500/20 bg-purple-500/[0.01] relative flex flex-col gap-2 animate-slide-up">
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.priority === 'high' ? '#f87171' : s.priority === 'medium' ? '#fbbf24' : '#34d399', display: 'inline-block' }} />
                                                                <h4 className="text-[12.5px] font-semibold" style={{ color: 'var(--foreground)' }}>{s.title}</h4>
                                                            </div>
                                                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                                {s.description.replace('[AI Suggested]', '').trim()}
                                                            </p>
                                                            {s.due_date && (
                                                                <div className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                                                    Due: {new Date(s.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 mt-1">
                                                            <button
                                                                onClick={() => handleConfirmSuggestion(s)}
                                                                className="flex-1 py-1 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-colors hover:opacity-90"
                                                                style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' }}
                                                            >
                                                                <Check size={10} /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleDismissSuggestion(s.title)}
                                                                className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                                                style={{ color: 'var(--text-muted)' }}
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                } else {
                                    // Lock Prompt for free users
                                    suggestedNodes = (
                                        <div className="mt-4 pt-4 border-t border-white/[0.04]">
                                            <div className="glass p-3.5 rounded-[14px] border border-dashed border-white/5 text-center flex flex-col items-center gap-2 bg-white/[0.005]">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles size={11} style={{ color: 'var(--accent-purple)' }} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]">AI Suggested Tasks</span>
                                                </div>
                                                <p className="text-[10px] leading-relaxed max-w-[190px]" style={{ color: 'var(--text-muted)' }}>
                                                    Let Gemini generate active weekly Kanban items to help boost your exam scores.
                                                </p>
                                                <button
                                                    onClick={() => setIsUpgradeOpen(true)}
                                                    className="mt-1 py-1 px-3 rounded-lg text-[10px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
                                                    style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' }}
                                                >
                                                    <Lock size={10} />
                                                    Unlock with Pro
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            return (
                                <KanbanColumn 
                                    key={col.id}
                                    id={col.id}
                                    title={col.title}
                                    color={col.dot}
                                    dot={col.dot}
                                    tasks={colTasks}
                                    onEditTask={(task) => handleOpenModal(task)}
                                    onDeleteTask={deleteTask}
                                    suggestedTasks={suggestedNodes}
                                />
                            );
                        })}
                    </div>

                    {isMounted && createPortal(
                        <DragOverlay>
                            {activeTask ? (
                                <TaskCardNode 
                                    task={activeTask} 
                                    onEdit={() => {}} 
                                    onDelete={() => {}} 
                                    isOverlay
                                    style={activeTaskWidth ? { width: activeTaskWidth } : undefined}
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>

            <TaskModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveTask}
                taskToEdit={taskToEdit}
            />

            {isUpgradeOpen && (
                <PremiumUpgradeModal 
                    isOpen={isUpgradeOpen} 
                    onClose={() => setIsUpgradeOpen(false)} 
                />
            )}
        </div>
    );
}
