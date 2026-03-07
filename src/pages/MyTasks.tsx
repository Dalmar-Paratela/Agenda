import { useEffect, useMemo, useState } from 'react';
import './MyTasks.css';
import { Filter, ArrowUpDown, EyeOff, MoreHorizontal, Plus, X } from 'lucide-react';
import { TaskListView } from '../components/TaskListView';
import { TaskKanbanView } from '../components/TaskKanbanView';
import { supabase } from '../lib/supabase';

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
  columnId: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
}

interface MyTasksProps {
  userId: string;
}

interface TaskRow {
  id: number;
  title: string;
  category: string;
  priority: string;
  priority_color: string;
  priority_text_color: string;
  days_left: number;
  status: string;
  status_color: string;
  status_text_color: string;
  attachments: number;
  comments: number;
  progress: number;
  column_id: string;
}

interface ColumnRow {
  id: string;
  title: string;
  position: number;
}

const PRIORITY_OPTIONS = [
  { label: 'Alta', color: '#E0E7FF', textColor: '#4F46E5' },
  { label: 'Media', color: '#FEF3C7', textColor: '#D97706' },
  { label: 'Baixa', color: '#D1FAE5', textColor: '#059669' },
];

const DEFAULT_COLUMNS: ColumnRow[] = [
  { id: 'col-1', title: 'A FAZER', position: 1 },
  { id: 'col-2', title: 'EM PROGRESSO', position: 2 },
  { id: 'col-3', title: 'REVISAO', position: 3 },
  { id: 'col-4', title: 'CONCLUIDO', position: 4 },
];

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    priorityColor: row.priority_color,
    priorityTextColor: row.priority_text_color,
    daysLeft: row.days_left,
    status: row.status,
    statusColor: row.status_color,
    statusTextColor: row.status_text_color,
    attachments: row.attachments,
    comments: row.comments,
    progress: row.progress,
    columnId: row.column_id,
  };
}

function mapColumnRow(row: ColumnRow): KanbanColumn {
  return {
    id: row.id,
    title: row.title,
    position: row.position,
  };
}

export function MyTasks({ userId }: MyTasksProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState('Media');
  const [newDays, setNewDays] = useState(7);

  const firstColumnId = useMemo(() => columns[0]?.id ?? 'col-1', [columns]);

  useEffect(() => {
    void loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function ensureDefaultColumnsIfNeeded(currentRows: ColumnRow[]) {
    if (currentRows.length > 0) return currentRows;

    const payload = DEFAULT_COLUMNS.map((column) => ({
      user_id: userId,
      id: column.id,
      title: column.title,
      position: column.position,
    }));

    const { data, error } = await supabase
      .from('kanban_columns')
      .insert(payload)
      .select('id, title, position');

    if (error) throw error;

    return (data as ColumnRow[]) ?? [];
  }

  async function loadUserData() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [taskResponse, columnResponse] = await Promise.all([
        supabase
          .from('tasks')
          .select(
            'id, title, category, priority, priority_color, priority_text_color, days_left, status, status_color, status_text_color, attachments, comments, progress, column_id',
          )
          .eq('user_id', userId)
          .order('id', { ascending: true }),
        supabase
          .from('kanban_columns')
          .select('id, title, position')
          .eq('user_id', userId)
          .order('position', { ascending: true }),
      ]);

      if (taskResponse.error) throw taskResponse.error;
      if (columnResponse.error) throw columnResponse.error;

      const resolvedColumns = await ensureDefaultColumnsIfNeeded((columnResponse.data as ColumnRow[]) ?? []);

      setColumns(resolvedColumns.map(mapColumnRow));
      setTasks(((taskResponse.data as TaskRow[]) ?? []).map(mapTaskRow));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar dados.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  function openModal() {
    setNewTitle('');
    setNewCategory('');
    setNewPriority('Media');
    setNewDays(7);
    setEditingTask(null);
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setNewTitle(task.title);
    setNewCategory(task.category);
    setNewPriority(task.priority);
    setNewDays(task.daysLeft);
    setEditingTask(task);
    setShowModal(true);
  }

  async function createTask(columnId: string, title: string, category: string, priorityLabel: string, daysLeft: number) {
    if (!title.trim()) return;

    const priority = PRIORITY_OPTIONS.find((option) => option.label === priorityLabel) ?? PRIORITY_OPTIONS[1];

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: title.trim(),
        category: category.trim() || 'Geral',
        priority: priority.label,
        priority_color: priority.color,
        priority_text_color: priority.textColor,
        days_left: daysLeft,
        status: 'In Review',
        status_color: '#FFE4E6',
        status_text_color: '#E11D48',
        attachments: 0,
        comments: 0,
        progress: 0,
        column_id: columnId,
      })
      .select(
        'id, title, category, priority, priority_color, priority_text_color, days_left, status, status_color, status_text_color, attachments, comments, progress, column_id',
      )
      .single();

    if (error) throw error;

    setTasks((previous) => [...previous, mapTaskRow(data as TaskRow)]);
  }

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      if (editingTask) {
        await handleUpdateTask(editingTask.id, {
          title: newTitle,
          category: newCategory,
          priority: newPriority,
          daysLeft: newDays,
        });
      } else {
        await createTask(firstColumnId, newTitle, newCategory, newPriority, newDays);
      }
      setShowModal(false);
      setEditingTask(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar tarefa.';
      setErrorMessage(message);
    }
  }

  async function handleUpdateTask(taskId: number, updates: Partial<Task>) {
    const priority = updates.priority ? (PRIORITY_OPTIONS.find((option) => option.label === updates.priority) ?? PRIORITY_OPTIONS[1]) : null;

    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.category !== undefined) payload.category = updates.category.trim();
    if (priority) {
      payload.priority = priority.label;
      payload.priority_color = priority.color;
      payload.priority_text_color = priority.textColor;
    }
    if (updates.daysLeft !== undefined) payload.days_left = updates.daysLeft;
    if (updates.columnId !== undefined) payload.column_id = updates.columnId;

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select('id, title, category, priority, priority_color, priority_text_color, days_left, status, status_color, status_text_color, attachments, comments, progress, column_id')
      .single();

    if (error) throw error;

    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? mapTaskRow(data as TaskRow) : task))
    );
  }

  async function handleDeleteTask(taskId: number) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;

    setTasks((previous) => previous.filter((task) => task.id !== taskId));
  }

  async function handleMoveTask(taskId: number, targetColumnId: string) {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            columnId: targetColumnId,
          }
          : task,
      ),
    );

    const { error } = await supabase
      .from('tasks')
      .update({ column_id: targetColumnId })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      setTasks(previousTasks);
      throw error;
    }
  }

  async function handleCreateTaskInColumn(columnId: string, title: string, category: string) {
    await createTask(columnId, title, category, 'Media', 7);
  }

  async function handleCreateColumn(title: string) {
    const nextPosition = columns.length > 0 ? Math.max(...columns.map((column) => column.position)) + 1 : 1;
    const columnId = `col-${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from('kanban_columns')
      .insert({
        user_id: userId,
        id: columnId,
        title: title.trim().toUpperCase(),
        position: nextPosition,
      })
      .select('id, title, position')
      .single();

    if (error) throw error;

    setColumns((previous) => [...previous, mapColumnRow(data as ColumnRow)]);
  }

  async function handleDeleteColumn(columnId: string) {
    if (columns.length <= 1) {
      throw new Error('Voce precisa manter pelo menos uma coluna.');
    }

    const fallbackColumn = columns.find((column) => column.id !== columnId);
    if (!fallbackColumn) return;

    const previousTasks = tasks;
    const previousColumns = columns;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.columnId === columnId
          ? {
            ...task,
            columnId: fallbackColumn.id,
          }
          : task,
      ),
    );
    setColumns((currentColumns) => currentColumns.filter((column) => column.id !== columnId));

    const { error: moveError } = await supabase
      .from('tasks')
      .update({ column_id: fallbackColumn.id })
      .eq('user_id', userId)
      .eq('column_id', columnId);

    if (moveError) {
      setTasks(previousTasks);
      setColumns(previousColumns);
      throw moveError;
    }

    const { error: deleteError } = await supabase
      .from('kanban_columns')
      .delete()
      .eq('user_id', userId)
      .eq('id', columnId);

    if (deleteError) {
      setTasks(previousTasks);
      setColumns(previousColumns);
      throw deleteError;
    }
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

      {errorMessage && <div className="tasks-error">{errorMessage}</div>}

      <div className="tasks-content">
        {isLoading ? (
          <div className="tasks-loading">Carregando tarefas...</div>
        ) : viewMode === 'list' ? (
          <TaskListView tasks={tasks} onNewTask={openModal} />
        ) : (
          <TaskKanbanView
            tasks={tasks}
            columns={columns}
            onMoveTask={handleMoveTask}
            onCreateTaskInColumn={handleCreateTaskInColumn}
            onCreateColumn={handleCreateColumn}
            onDeleteColumn={handleDeleteColumn}
            onEditTask={openEditModal}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditingTask(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="modal-form">
              <div className="form-group">
                <label>Titulo *</label>
                <input
                  autoFocus
                  placeholder="Digite o titulo da tarefa..."
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input
                  placeholder="Ex: Trabalho, Pessoal, Saude..."
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prioridade</label>
                  <select value={newPriority} onChange={(event) => setNewPriority(event.target.value)}>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority.label} value={priority.label}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dias restantes</label>
                  <input
                    type="number"
                    min={1}
                    value={newDays}
                    onChange={(event) => setNewDays(Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => { setShowModal(false); setEditingTask(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
