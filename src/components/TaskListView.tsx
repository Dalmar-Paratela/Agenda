import { useEffect, useRef, useState } from 'react';
import './TaskListView.css';
import { Paperclip, MessageSquare, Clock, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import type { Task } from '../pages/MyTasks';

interface Props {
  tasks: Task[];
  onNewTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => Promise<void>;
}

function TaskRow({
  task,
  activeMenuId,
  setActiveMenuId,
  onEditTask,
  onDeleteTask,
  menuRef,
}: {
  task: Task;
  activeMenuId: number | null;
  setActiveMenuId: (id: number | null) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => Promise<void>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="task-row">
      <div className="task-info">
        <h4>{task.title}</h4>
        <span>{task.category}</span>
      </div>

      <div className="task-metrics">
        <div className="metric-badge"><Paperclip size={14} /> {task.attachments}</div>
        <div className="metric-badge"><MessageSquare size={14} /> {task.comments}</div>
      </div>

      <div className="task-tags">
        <span className="tag" style={{ backgroundColor: task.statusColor, color: task.statusTextColor }}>{task.status}</span>
        <span className="tag" style={{ backgroundColor: task.priorityColor, color: task.priorityTextColor }}>{task.priority}</span>
      </div>

      <div className="task-time">
        <Clock size={14} /> {task.daysLeft} dias
      </div>

      <div className="task-progress">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
        </div>
        <span className="progress-text">{task.progress}%</span>
      </div>

      <div className="task-actions-wrapper">
        <button
          className="btn-more"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(activeMenuId === task.id ? null : task.id);
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {activeMenuId === task.id && (
          <div ref={menuRef} className="list-context-menu" onClick={(e) => e.stopPropagation()}>
            <button className="menu-item" onClick={() => { onEditTask(task); setActiveMenuId(null); }}>
              <Edit2 size={12} /> Editar
            </button>
            <button className="menu-item danger" onClick={() => { const taskId = task.id; setActiveMenuId(null); setTimeout(() => { if (window.confirm('Deseja realmente deletar esta tarefa?')) { void onDeleteTask(taskId); } }, 50); }}>
              <Trash2 size={12} /> Deletar
            </button>
            <button className="menu-item" onClick={() => setActiveMenuId(null)}>
              <X size={12} /> Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskListView({ tasks, onNewTask, onEditTask, onDeleteTask }: Props) {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeMenuId === null) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const todoTasks = tasks.filter((task) => task.status !== 'In Progress' && task.status !== 'Input Needed');
  const activeTasks = tasks.filter((task) => task.status === 'In Progress' || task.status === 'Input Needed');

  return (
    <div className="task-list-view">
      <div className="list-section">
        <h3 className="section-title">A FAZER <span>...</span></h3>
        <div className="task-list">
          {todoTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              menuRef={menuRef}
            />
          ))}
        </div>
        <button className="btn-add-dashed" onClick={onNewTask}>+ Adicionar Nova Tarefa</button>
      </div>

      <div className="list-section">
        <h3 className="section-title">PROJETOS ATIVOS <span>...</span></h3>
        <div className="task-list">
          {activeTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              menuRef={menuRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
