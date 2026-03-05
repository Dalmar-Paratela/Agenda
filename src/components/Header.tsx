import './Header.css';
import { Search, Bell, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  userEmail: string;
  onLogout: () => void;
}

export function Header({ title, userEmail, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <h2 className="header-title">{title}</h2>

      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search or type a command" />
        <span className="shortcut-hint">Ctrl + K</span>
      </div>

      <div className="header-actions">
        <button className="btn-notification" aria-label="Notificacoes">
          <Bell size={20} />
          <span className="notification-badge" />
        </button>

        <div className="user-pill" title={userEmail}>
          <span>{userEmail}</span>
        </div>

        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}
