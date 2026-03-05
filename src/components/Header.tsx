import './Header.css';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <header className="header">
            <h2 className="header-title">{title}</h2>

            <div className="header-search">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search or type a command" />
                <span className="shortcut-hint">⌘ F</span>
            </div>

            <div className="header-actions">
                <button className="btn-notification">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </button>
                <div className="avatar">
                    <img src="https://i.pravatar.cc/150?img=11" alt="User avatar" />
                </div>
            </div>
        </header>
    );
}
