# Broadcast

Projeto prático em React, TypeScript e Firebase para gerenciar conexões, contatos e mensagens agendadas em um modelo SaaS multi-tenant.

## Requisitos

- Node.js 20+
- npm
- Firebase CLI
- Projeto Firebase com Auth, Firestore, Functions e Hosting habilitados

## Configuração

Instale as dependências:

```bash
npm --prefix web install
npm --prefix functions install
```

Crie o arquivo `web/.env` com base em `web/.env.example`:

```bash
cp web/.env.example web/.env
```

Preencha as variáveis do Firebase no `web/.env`.

## Rodar localmente

Frontend:

```bash
npm --prefix web run dev
```

Functions:

```bash
npm --prefix functions run build
firebase emulators:start --only auth,firestore,functions,hosting
```

## Testes

```bash
npm --prefix web test
npm --prefix functions test
```

## Build

```bash
npm --prefix web run build
npm --prefix functions run build
```

## Deploy

O projeto está configurado para o Firebase project `english-project-a59da` e o Hosting site `broadcast-bf499`.

```bash
firebase deploy
```

Link publicado:

https://broadcast-bf499.web.app

