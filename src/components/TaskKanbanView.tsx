import { useState, useRef } from 'react';
import './TaskKanbanView.css';
import { Paperclip, MessageSquare, Plus, Clock, X, GripVertical } from 'lucide-react';
import type { Task, KanbanColumn } from '../pages/MyTasks';

interface Props {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    columns: KanbanColumn[];
    setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
}

const PRIORITY_OPTIONS = [
    { label: 'Alta', color: '#E0E7FF', textColor: '#4F46E5' },
    { label: 'Média', color: '#FEF3C7', textColor: '#D97706' },
    { label: 'Baixa', color: '#D1FAE5', textColor: '#059669' },
];

export function TaskKanbanView({ tasks, setTasks, columns, setColumns }: Props) {
    const [dragState, setDragState] = useState<{ taskId: number; sourceColumnId: string } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
    const [addingToColumnId, setAddingToColumnId] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('');
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const nextTaskId = useRef(Math.max(...tasks.map(t => t.id), 0) + 1);
    const nextColId = useRef(columns.length + 10);

    const taskMap = new Map(tasks.map(t => [t.id, t]));

    function handleDragStart(e: React.DragEvent, taskId: number, sourceColumnId: string) {
        setDragState({ taskId, sourceColumnId });
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
        setDragState(null);
        setDragOverColumnId(null);
    }

    function handleDragOver(e: React.DragEvent, columnId: string) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumnId !== columnId) setDragOverColumnId(columnId);
    }

    function handleDrop(e: React.DragEvent, targetColumnId: string) {
        e.preventDefault();
        if (!dragState) return;
        if (dragState.sourceColumnId === targetColumnId) {
            setDragState(null);
            setDragOverColumnId(null);
            return;
        }
        setColumns(prev => prev.map(col => {
            if (col.id === dragState.sourceColumnId) {
                return { ...col, taskIds: col.taskIds.filter(id => id !== dragState.taskId) };
            }
            if (col.id === targetColumnId) {
                return { ...col, taskIds: [...col.taskIds, dragState.taskId] };
            }
            return col;
        }));
        setDragState(null);
        setDragOverColumnId(null);
    }

    function startAddingTask(columnId: string) {
        setAddingToColumnId(columnId);
        setNewTaskTitle('');
        setNewTaskCategory('');
    }

    function handleAddTask(columnId: string) {
        if (!newTaskTitle.trim()) {
            setAddingToColumnId(null);
            return;
        }
        const newTask: Task = {
            id: nextTaskId.current++,
            title: newTaskTitle.trim(),
            category: newTaskCategory.trim() || 'Geral',
            priority: 'Média',
            priorityColor: PRIORITY_OPTIONS[1].color,
            priorityTextColor: PRIORITY_OPTIONS[1].textColor,
            daysLeft: 7,
            status: 'In Review',
            statusColor: '#FFE4E6',
            statusTextColor: '#E11D48',
            attachments: 0,
            comments: 0,
            progress: 0,
        };
        setTasks(prev => [...prev, newTask]);
        setColumns(prev => prev.map(col =>
            col.id === columnId ? { ...col, taskIds: [...col.taskIds, newTask.id] } : col
        ));
        setNewTaskTitle('');
        setNewTaskCategory('');
        setAddingToColumnId(null);
    }

    function handleAddColumn() {
        if (!newColumnTitle.trim()) {
            setIsAddingColumn(false);
            return;
        }
        const newCol: KanbanColumn = {
            id: `col-custom-${nextColId.current++}`,
            title: newColumnTitle.trim().toUpperCase(),
            taskIds: [],
        };
        setColumns(prev => [...prev, newCol]);
        setNewColumnTitle('');
        setIsAddingColumn(false);
    }

    function handleDeleteColumn(columnId: string) {
        setColumns(prev => prev.filter(col => col.id !== columnId));
    }

    return (
        <div className="task-kanban-view">
            <div className="kanban-board">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className={`kanban-column${dragOverColumnId === col.id && dragState?.sourceColumnId !== col.id ? ' drag-over' : ''}`}
                        onDragOver={e => handleDragOver(e, col.id)}
                        onDrop={e => handleDrop(e, col.id)}
                        onDragLeave={e => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setDragOverColumnId(null);
                            }
                        }}
                    >
                        <div className="kanban-column-header">
                            <h3>{col.title} <span className="task-count">{col.taskIds.length}</span></h3>
                            <div className="column-header-actions">
                                <button className="btn-add-task" title="Adicionar tarefa" onClick={() => startAddingTask(col.id)}>
                                    <Plus size={15} />
                                </button>
                                <button className="btn-delete-column" title="Remover coluna" onClick={() => handleDeleteColumn(col.id)}>
                                    <X size={13} />
                                </button>
                            </div>
                        </div>

                        <div className="kanban-cards">
                            {col.taskIds.map(taskId => {
                                const task = taskMap.get(taskId);
                                if (!task) return null;
                                return (
                                    <div
                                        key={task.id}
                                        className={`kanban-card${dragState?.taskId === task.id ? ' dragging' : ''}`}
                                        draggable
                                        onDragStart={e => handleDragStart(e, task.id, col.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="kanban-card-drag-handle">
                                            <GripVertical size={14} />
                                        </div>
                                        <div className="kanban-card-tags">
                                            <span className="tag" style={{ backgroundColor: task.priorityColor, color: task.priorityTextColor }}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <h4 className="kanban-card-title">{task.title}</h4>
                                        <span className="kanban-card-category">{task.category}</span>
                                        <div className="kanban-card-footer">
                                            <div className="kanban-card-metrics">
                                                <span className="metric"><Paperclip size={12} /> {task.attachments}</span>
                                                <span className="metric"><MessageSquare size={12} /> {task.comments}</span>
                                            </div>
                                            <div className="kanban-card-time">
                                                <Clock size={12} /> {task.daysLeft}d
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {addingToColumnId === col.id && (
                                <div className="kanban-inline-form">
                                    <input
                                        autoFocus
                                        className="kanban-input"
                                        placeholder="Título da tarefa..."
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddTask(col.id);
                                            if (e.key === 'Escape') setAddingToColumnId(null);
                                        }}
                                    />
                                    <input
                                        className="kanban-input"
                                        placeholder="Categoria (opcional)..."
                                        value={newTaskCategory}
                                        onChange={e => setNewTaskCategory(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddTask(col.id);
                                            if (e.key === 'Escape') setAddingToColumnId(null);
                                        }}
                                    />
                                    <div className="inline-form-actions">
                                        <button className="btn-confirm-inline" onClick={() => handleAddTask(col.id)}>
                                            Adicionar
                                        </button>
                                        <button className="btn-cancel-inline" onClick={() => setAddingToColumnId(null)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isAddingColumn ? (
                    <div className="kanban-add-column-form">
                        <input
                            autoFocus
                            className="kanban-input"
                            placeholder="Nome da coluna..."
                            value={newColumnTitle}
                            onChange={e => setNewColumnTitle(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddColumn();
                                if (e.key === 'Escape') setIsAddingColumn(false);
                            }}
                        />
                        <div className="inline-form-actions">
                            <button className="btn-confirm-inline" onClick={handleAddColumn}>
                                Criar Coluna
                            </button>
                            <button className="btn-cancel-inline" onClick={() => setIsAddingColumn(false)}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="btn-add-column" onClick={() => setIsAddingColumn(true)}>
                        <Plus size={16} /> Nova Coluna
                    </button>
                )}
            </div>
        </div>
    );
}
