import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { MyTasks } from './pages/MyTasks';
import { AuthPage } from './pages/AuthPage';
import { supabase } from './lib/supabase';

function App() {
  const [currentTab, setCurrentTab] = useState('tasks');
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setCurrentUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return currentUser ? <MyTasks userId={currentUser.id} /> : null;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'tasks':
        return 'Minhas Tarefas';
      default:
        return 'Gamanager';
    }
  };

  if (authLoading) {
    return (
      <div className="center-state">
        <p>Carregando sessao...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="main-content">
        <Header title={getTitle()} userEmail={currentUser.email ?? ''} onLogout={handleLogout} />
        <main className="page-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
