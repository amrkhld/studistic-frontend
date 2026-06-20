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
import { KanbanSkeleton } from '@/shared/components/LoadingSkeleton';
import { Plus } from 'lucide-react';
import { KanbanColumn } from '@/features/to-study/components/KanbanColumn';
import { TaskCard, TaskCardNode } from '@/features/to-study/components/TaskCard';
import { TaskModal } from '@/features/to-study/components/TaskModal';
import { TaskData } from '@/lib/api';

const COLUMNS = [
    { id: 'todo', title: 'To Do', dot: '#f87171' },
    { id: 'in-progress', title: 'In Progress', dot: '#fbbf24' },
    { id: 'done', title: 'Done', dot: '#34d399' },
];

export default function ToStudyPage() {
    const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
    const [activeTask, setActiveTask] = useState<TaskData | null>(null);
    const [activeTaskWidth, setActiveTaskWidth] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<TaskData | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
            // Measure the exact DOM width if available, otherwise fallback to dnd-kit's measured rect
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
        // The over.id can be either a column ID or a task ID (if dropped on top of another task)
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === taskId);
        if (!activeTask) return;

        // Determine the target column ID
        const targetColumnId = (COLUMNS.find(c => c.id === overId)?.id 
            || tasks.find(t => t.id === overId)?.status) as TaskData['status'];

        if (targetColumnId && activeTask.status !== targetColumnId) {
            // Update immediately (optimistic UI) will happen via the hook, but we need to trigger API
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

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in h-full flex flex-col">
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
        </div>
    );
}
