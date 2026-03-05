import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './AuthPage.css';

export function AuthPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (!data.session) {
          setInfoMessage('Cadastro criado. Verifique o email para confirmar a conta.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">Gamanager</div>
        <h1>{isRegisterMode ? 'Criar conta' : 'Entrar'}</h1>
        <p>{isRegisterMode ? 'Crie seu acesso com email e senha.' : 'Acesse sua area com email e senha.'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage && <div className="auth-message error">{errorMessage}</div>}
          {infoMessage && <div className="auth-message info">{infoMessage}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processando...' : isRegisterMode ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setIsRegisterMode((previous) => !previous);
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          {isRegisterMode ? 'Ja possui conta? Entrar' : 'Ainda nao tem conta? Cadastrar'}
        </button>
      </div>
    </div>
  );
}
