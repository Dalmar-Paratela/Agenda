# Gamanager

Aplicativo React + Vite com deploy automatico no GitHub Pages.

## Rodar localmente

```bash
npm ci
npm run dev
```

## Publicacao na nuvem (GitHub Pages)

1. Crie um repositorio vazio no GitHub (exemplo: `gamanager`).
2. Conecte o remoto local:

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

3. Envie para a branch principal:

```bash
git push -u origin main
```

4. No GitHub, va em `Settings > Pages` e deixe `Source` como `GitHub Actions`.

A cada `push` na `main`, o workflow `.github/workflows/deploy.yml` publica uma nova versao.

Link esperado do app:

```text
https://SEU_USUARIO.github.io/SEU_REPOSITORIO/
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

Isso sincroniza com o GitHub e dispara novo deploy automaticamente.
