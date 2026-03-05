import { useState, useRef } from 'react';
import './MyTasks.css';
import { Filter, ArrowUpDown, EyeOff, MoreHorizontal, Plus, X } from 'lucide-react';
import { TaskListView } from '../components/TaskListView';
import { TaskKanbanView } from '../components/TaskKanbanView';

export interface Task {
    id: number;
    title: string;
    category: string;
    priority: string;
    priorityColor: string;
    priorityTextColor: string;
    daysLeft: number;
    status: string;
    statusColor: string;
    statusTextColor: string;
    attachments: number;
    comments: number;
    progress: number;
}

export interface KanbanColumn {
    id: string;
    title: string;
    taskIds: number[];
}

const PRIORITY_OPTIONS = [
    { label: 'Alta', color: '#E0E7FF', textColor: '#4F46E5' },
    { label: 'Média', color: '#FEF3C7', textColor: '#D97706' },
    { label: 'Baixa', color: '#D1FAE5', textColor: '#059669' },
];

const INITIAL_TASKS: Task[] = [
    {
        id: 1,
        title: 'Schedule Me An Appointment With My Endocrine...',
        category: 'Appointment',
        attachments: 12,
        comments: 21,
        status: 'In Review',
        statusColor: '#FFE4E6',
        statusTextColor: '#E11D48',
        priority: 'Alta',
        priorityColor: '#E0E7FF',
        priorityTextColor: '#4F46E5',
        daysLeft: 15,
        progress: 0,
    },
    {
        id: 2,
        title: 'Track Medicine Delivery',
        category: 'Tracking',
        attachments: 4,
        comments: 32,
        status: 'Drafts',
        statusColor: '#F3F4F6',
        statusTextColor: '#4B5563',
        priority: 'Média',
        priorityColor: '#FEF3C7',
        priorityTextColor: '#D97706',
        daysLeft: 12,
        progress: 0,
    },
    {
        id: 3,
        title: 'Plan An Event',
        category: 'Planning',
        attachments: 11,
        comments: 8,
        status: 'In Progress',
        statusColor: '#E0EBFF',
        statusTextColor: '#0E5DF0',
        priority: 'Média',
        priorityColor: '#FCE7F3',
        priorityTextColor: '#DB2777',
        daysLeft: 32,
        progress: 26,
    },
    {
        id: 4,
        title: 'Return A Package',
        category: 'Delivery',
        attachments: 7,
        comments: 12,
        status: 'In Progress',
        statusColor: '#E0EBFF',
        statusTextColor: '#0E5DF0',
        priority: 'Média',
        priorityColor: '#FEF3C7',
        priorityTextColor: '#D97706',
        daysLeft: 4,
        progress: 74,
    },
    {
        id: 5,
        title: 'Get A Passport',
        category: 'Personal Help',
        attachments: 4,
        comments: 16,
        status: 'Input Needed',
        statusColor: '#F3F4F6',
        statusTextColor: '#4B5563',
        priority: 'Baixa',
        priorityColor: '#D1FAE5',
        priorityTextColor: '#059669',
        daysLeft: 22,
        progress: 38,
    },
];

const INITIAL_COLUMNS: KanbanColumn[] = [
    { id: 'col-1', title: 'A FAZER', taskIds: [1, 5] },
    { id: 'col-2', title: 'EM PROGRESSO', taskIds: [3, 4] },
    { id: 'col-3', title: 'REVISÃO', taskIds: [2] },
    { id: 'col-4', title: 'CONCLUÍDO', taskIds: [] },
];

export function MyTasks() {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
    const [showModal, setShowModal] = useState(false);
    const nextId = useRef(INITIAL_TASKS.length + 1);

    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newPriority, setNewPriority] = useState('Média');
    const [newDays, setNewDays] = useState(7);

    function openModal() {
        setNewTitle('');
        setNewCategory('');
        setNewPriority('Média');
        setNewDays(7);
        setShowModal(true);
    }

    function handleCreateTask(e: React.FormEvent) {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const priority = PRIORITY_OPTIONS.find(p => p.label === newPriority) || PRIORITY_OPTIONS[1];
        const newTask: Task = {
            id: nextId.current++,
            title: newTitle.trim(),
            category: newCategory.trim() || 'Geral',
            priority: priority.label,
            priorityColor: priority.color,
            priorityTextColor: priority.textColor,
            daysLeft: newDays,
            status: 'In Review',
            statusColor: '#FFE4E6',
            statusTextColor: '#E11D48',
            attachments: 0,
            comments: 0,
            progress: 0,
        };

        setTasks(prev => [...prev, newTask]);
        setColumns(prev => prev.map((col, i) =>
            i === 0 ? { ...col, taskIds: [...col.taskIds, newTask.id] } : col
        ));
        setShowModal(false);
    }

    return (
        <div className="my-tasks-page">
            <div className="tasks-toolbar">
                <div className="toolbar-left">
                    <button className="btn-tool"><Filter size={16} /> Filter</button>
                    <button className="btn-tool"><ArrowUpDown size={16} /> Sort</button>
                    <button className="btn-tool"><EyeOff size={16} /> Hide</button>
                    <button className="btn-tool icon-only"><MoreHorizontal size={16} /></button>
                </div>

                <div className="toolbar-right">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            Lista
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            Kanban
                        </button>
                    </div>
                    <button className="btn-new-project" onClick={openModal}>
                        <Plus size={16} /> Nova Tarefa
                    </button>
                </div>
            </div>

            <div className="tasks-content">
                {viewMode === 'list'
                    ? <TaskListView tasks={tasks} setTasks={setTasks} onNewTask={openModal} />
                    : <TaskKanbanView tasks={tasks} setTasks={setTasks} columns={columns} setColumns={setColumns} />
                }
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nova Tarefa</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="modal-form">
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    autoFocus
                                    placeholder="Digite o título da tarefa..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoria</label>
                                <input
                                    placeholder="Ex: Trabalho, Pessoal, Saúde..."
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Prioridade</label>
                                    <select value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                                        {PRIORITY_OPTIONS.map(p => (
                                            <option key={p.label} value={p.label}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Dias restantes</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newDays}
                                        onChange={e => setNewDays(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel-modal" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit-modal">
                                    Criar Tarefa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
