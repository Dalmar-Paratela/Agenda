import './Sidebar.css';
import { LayoutDashboard, CheckSquare, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-logo">
                    <span className="emoji">🧭</span>
                    <span className="brand-gama">Gama</span><span className="brand-nager">nager</span>
                </h1>
            </div>

            <div className="sidebar-menu">
                <span className="menu-label">Menu</span>
                <nav>
                    <button
                        className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('dashboard')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`menu-item ${currentTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('tasks')}
                    >
                        <CheckSquare size={20} />
                        <span>Minhas Tarefas</span>
                    </button>
                </nav>
            </div>

            <div className="sidebar-footer">
                <nav className="bottom-nav">
                    <button className="menu-item">
                        <Settings size={20} />
                        <span>Configurações</span>
                    </button>
                    <button className="menu-item">
                        <HelpCircle size={20} />
                        <span>Ajuda & Suporte</span>
                    </button>
                </nav>
            </div>
        </aside>
    );
}
