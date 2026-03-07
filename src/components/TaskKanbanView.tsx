import { useMemo, useState } from 'react';
import './TaskKanbanView.css';
import { Paperclip, MessageSquare, Plus, Clock, X, GripVertical, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Task, KanbanColumn } from '../pages/MyTasks';

interface Props {
  tasks: Task[];
  columns: KanbanColumn[];
  onMoveTask: (taskId: number, targetColumnId: string) => Promise<void>;
  onCreateTaskInColumn: (columnId: string, title: string, category: string) => Promise<void>;
  onCreateColumn: (title: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => Promise<void>;
}

export function TaskKanbanView({
  tasks,
  columns,
  onMoveTask,
  onCreateTaskInColumn,
  onCreateColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
}: Props) {
  const [dragState, setDragState] = useState<{ taskId: number; sourceColumnId: string } | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, Task[]>();

    for (const column of columns) {
      map.set(column.id, []);
    }

    for (const task of tasks) {
      if (!map.has(task.columnId)) {
        map.set(task.columnId, []);
      }

      map.get(task.columnId)?.push(task);
    }

    return map;
  }, [columns, tasks]);

  function handleDragStart(event: React.DragEvent, taskId: number, sourceColumnId: string) {
    setDragState({ taskId, sourceColumnId });
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd() {
    setDragState(null);
    setDragOverColumnId(null);
  }

  function handleDragOver(event: React.DragEvent, columnId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) setDragOverColumnId(columnId);
  }

  async function handleDrop(event: React.DragEvent, targetColumnId: string) {
    event.preventDefault();
    if (!dragState) return;

    if (dragState.sourceColumnId === targetColumnId) {
      setDragState(null);
      setDragOverColumnId(null);
      return;
    }

    setErrorMessage(null);

    try {
      await onMoveTask(dragState.taskId, targetColumnId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao mover tarefa.';
      setErrorMessage(message);
    } finally {
      setDragState(null);
      setDragOverColumnId(null);
    }
  }

  function startAddingTask(columnId: string) {
    setAddingToColumnId(columnId);
    setNewTaskTitle('');
    setNewTaskCategory('');
  }

  async function handleAddTask(columnId: string) {
    if (!newTaskTitle.trim()) {
      setAddingToColumnId(null);
      return;
    }

    setErrorMessage(null);

    try {
      await onCreateTaskInColumn(columnId, newTaskTitle, newTaskCategory);
      setNewTaskTitle('');
      setNewTaskCategory('');
      setAddingToColumnId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar tarefa.';
      setErrorMessage(message);
    }
  }

  async function handleAddColumn() {
    if (!newColumnTitle.trim()) {
      setIsAddingColumn(false);
      return;
    }

    setErrorMessage(null);

    try {
      await onCreateColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar coluna.';
      setErrorMessage(message);
    }
  }

  async function handleDeleteColumn(columnId: string) {
    setErrorMessage(null);

    try {
      await onDeleteColumn(columnId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover coluna.';
      setErrorMessage(message);
    }
  }

  return (
    <div className="task-kanban-view">
      <div className="kanban-board">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`kanban-column${dragOverColumnId === column.id && dragState?.sourceColumnId !== column.id ? ' drag-over' : ''}`}
            onDragOver={(event) => handleDragOver(event, column.id)}
            onDrop={(event) => { void handleDrop(event, column.id); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setDragOverColumnId(null);
              }
            }}
          >
            <div className="kanban-column-header">
              <h3>{column.title} <span className="task-count">{tasksByColumn.get(column.id)?.length ?? 0}</span></h3>
              <div className="column-header-actions">
                <button className="btn-add-task" title="Adicionar tarefa" onClick={() => startAddingTask(column.id)}>
                  <Plus size={15} />
                </button>
                <button className="btn-delete-column" title="Remover coluna" onClick={() => { void handleDeleteColumn(column.id); }}>
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="kanban-cards">
              {(tasksByColumn.get(column.id) ?? []).map((task) => (
                <div
                  key={task.id}
                  className={`kanban-card${dragState?.taskId === task.id ? ' dragging' : ''}`}
                  draggable
                  onDragStart={(event) => handleDragStart(event, task.id, column.id)}
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
                  <button
                    className="btn-card-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === task.id ? null : task.id);
                    }}
                  >
                    <MoreVertical size={14} />
                  </button>

                  {activeMenuId === task.id && (
                    <div className="card-context-menu" onClick={(e) => e.stopPropagation()}>
                      <button className="menu-item" onClick={() => { onEditTask(task); setActiveMenuId(null); }}>
                        <Edit2 size={12} /> Editar
                      </button>
                      <button className="menu-item danger" onClick={() => { if (confirm('Deseja realmente deletar esta tarefa?')) { void onDeleteTask(task.id); setActiveMenuId(null); } }}>
                        <Trash2 size={12} /> Deletar
                      </button>
                      <button className="menu-item" onClick={() => setActiveMenuId(null)}>
                        <X size={12} /> Sair
                      </button>
                    </div>
                  )}

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
              ))}

              {addingToColumnId === column.id && (
                <div className="kanban-inline-form">
                  <input
                    autoFocus
                    className="kanban-input"
                    placeholder="Titulo da tarefa..."
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleAddTask(column.id);
                      }
                      if (event.key === 'Escape') setAddingToColumnId(null);
                    }}
                  />
                  <input
                    className="kanban-input"
                    placeholder="Categoria (opcional)..."
                    value={newTaskCategory}
                    onChange={(event) => setNewTaskCategory(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleAddTask(column.id);
                      }
                      if (event.key === 'Escape') setAddingToColumnId(null);
                    }}
                  />
                  <div className="inline-form-actions">
                    <button className="btn-confirm-inline" onClick={() => { void handleAddTask(column.id); }}>
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
              onChange={(event) => setNewColumnTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleAddColumn();
                }
                if (event.key === 'Escape') setIsAddingColumn(false);
              }}
            />
            <div className="inline-form-actions">
              <button className="btn-confirm-inline" onClick={() => { void handleAddColumn(); }}>
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

      {errorMessage && <div className="kanban-error">{errorMessage}</div>}

      {activeMenuId !== null && (
        <div className="menu-overlay" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
}
