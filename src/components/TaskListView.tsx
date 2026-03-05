import './TaskListView.css';
import { Paperclip, MessageSquare, Clock, MoreHorizontal } from 'lucide-react';
import type { Task } from '../pages/MyTasks';

interface Props {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onNewTask: () => void;
}

function TaskRow({ task }: { task: Task }) {
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
                    <div className="progress-bar-fill" style={{ width: `${task.progress}%` }}></div>
                </div>
                <span className="progress-text">{task.progress}%</span>
            </div>

            <button className="btn-more"><MoreHorizontal size={16} /></button>
        </div>
    );
}

export function TaskListView({ tasks, onNewTask }: Props) {
    const todoTasks = tasks.filter(t => t.status !== 'In Progress' && t.status !== 'Input Needed');
    const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Input Needed');

    return (
        <div className="task-list-view">
            <div className="list-section">
                <h3 className="section-title">A FAZER <span>...</span></h3>
                <div className="task-list">
                    {todoTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </div>
                <button className="btn-add-dashed" onClick={onNewTask}>+ Adicionar Nova Tarefa</button>
            </div>

            <div className="list-section">
                <h3 className="section-title">PROJETOS ATIVOS <span>...</span></h3>
                <div className="task-list">
                    {activeTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </div>
            </div>
        </div>
    );
}
