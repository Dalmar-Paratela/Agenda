# Gamanager

Aplicativo React + Vite com autenticacao (cadastro/login) e banco por usuario usando Supabase.

## O que foi implementado

- Cadastro e login com email/senha (Supabase Auth)
- Sessao do usuario no app (login/logout)
- Tarefas e colunas Kanban persistidas em Postgres
- Isolamento por usuario com Row Level Security (RLS)
- Deploy automatico no GitHub Pages a cada push na branch `main`

## Seguranca

Nao existe sistema 100% a prova de ataque, mas este projeto usa praticas robustas:

- Senha nao fica no front-end; autenticacao e hash sao gerenciados pelo Supabase Auth
- As tabelas usam RLS com `auth.uid() = user_id`
- Um usuario autenticado so consegue ler/escrever os proprios dados
- O front-end usa chave anonima (segura com RLS) e nunca chave de servico

## Configuracao do banco (Supabase)

1. Crie um projeto em https://supabase.com
2. No painel do projeto, abra `SQL Editor`
3. Execute o arquivo [`supabase/schema.sql`](supabase/schema.sql)
4. Em `Authentication > Providers`, deixe Email habilitado
5. Em `Authentication > URL Configuration`, adicione a URL do seu app (local e producao)

## Variaveis de ambiente

1. Copie `.env.example` para `.env.local`
2. Preencha com seus valores do Supabase:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_SUPABASE
```

## Rodar localmente

```bash
npm ci
npm run dev
```

## Publicacao na nuvem (GitHub Pages)

A cada push na `main`, o workflow `.github/workflows/deploy.yml` publica nova versao.

Antes do primeiro deploy, configure em `Settings > Secrets and variables > Actions`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

URL do projeto:

```text
https://dalmar-paratela.github.io/Agenda/
```

## Sincronizacao de alteracoes locais

Fluxo manual:

```bash
git add .
git commit -m "sua mensagem"
git push
```

Fluxo rapido com script:

```powershell
.\sync.ps1 "sua mensagem"
```

## Estrutura relevante

- `src/pages/AuthPage.tsx`: cadastro/login
- `src/lib/supabase.ts`: cliente Supabase
- `src/pages/MyTasks.tsx`: leitura/escrita de tarefas e colunas por usuario
- `supabase/schema.sql`: tabelas, trigger e politicas RLS
