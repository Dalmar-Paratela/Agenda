import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { MyTasks } from './pages/MyTasks';

function App() {
  const [currentTab, setCurrentTab] = useState('tasks');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <MyTasks />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Minhas Tarefas';
      default: return 'Gamanager';
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="main-content">
        <Header title={getTitle()} />
        <main className="page-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
