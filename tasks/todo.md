# Broadcast — Plano de Implementação

## Decisões de Arquitetura

| Decisão | Escolha |
|---|---|
| Estrutura | `web/` (frontend Vite), `functions/` (Firebase Functions), `shared/` (tipos TS) |
| Modelo Firestore | Flat collections sem subcoleções. `tenantId` redundante em toda doc |
| Isolamento multi-tenant | Custom claim `tenantId` + regras de segurança Firestore |
| Auth | Email/senha + Google login |
| UI | MUI + Tailwind v4 (`enableCssLayer`, `className`) |
| Roteamento | React Router v7 |
| Estado servidor | TanStack Query v5 |
| Estado local | Zustand v5 |
| Autenticação UI | AuthContext simples |
| Tempo real | Só na tela de mensagens (`onSnapshot`) |
| Agendamento | Callable function `processScheduledMessages` (plano Spark) |
| Delete | Soft delete (`deletedAt: Timestamp`) |
| Filtros mensagens | status + connectionId + contactId |

## Modelo Firestore

```
tenants/{tenantId}
  name: string
  createdAt: Timestamp

connections/{connId}
  tenantId: string
  name: string
  deletedAt: Timestamp | null
  createdAt: Timestamp

contacts/{contactId}
  tenantId: string
  connectionId: string
  name: string
  phone: string
  deletedAt: Timestamp | null
  createdAt: Timestamp

messages/{msgId}
  tenantId: string
  connectionId: string
  contactIds: string[]
  body: string
  status: 'scheduled' | 'sent' | 'failed'
  scheduledAt: Timestamp | null
  sentAt: Timestamp | null
  deletedAt: Timestamp | null
  createdAt: Timestamp
```

## Fluxo de Autenticação + Tenant

1. Usuário cadastra/login via Firebase Auth (email/senha ou Google)
2. `beforeUserCreated` blocking function: cria doc em `tenants`, seta custom claim `{ tenantId }`
3. Cliente lê claim do token → usa em todas queries Firestore
4. Regras de segurança validam `resource.data.tenantId == request.auth.token.tenantId`

## Fluxo de Mensagens Agendadas

1. Usuário cria mensagem com `status: 'scheduled'` + `scheduledAt`
2. Ao abrir tela de mensagens, cliente chama `processScheduledMessages`
3. Função callable faz query: `status == 'scheduled' && scheduledAt <= now`, atualiza batch pra `sent`
4. `onSnapshot` realtime reflete mudança na UI

## Estrutura de Pastas

```
broadcast/
├── shared/
│   └── types.ts
├── web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── config/
│   │   │   └── firebase.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── stores/
│   │   │   └── useMessageFilters.ts       (Zustand)
│   │   ├── hooks/
│   │   │   ├── useConnections.ts
│   │   │   ├── useContacts.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useProcessScheduled.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ConnectionsPage.tsx
│   │   │   ├── ContactsPage.tsx
│   │   │   └── MessagesPage.tsx
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── ConnectionDialog.tsx
│   │   │   ├── ContactDialog.tsx
│   │   │   ├── MessageDialog.tsx
│   │   │   └── MessageFilters.tsx
│   │   └── index.css                     (Tailwind)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── functions/
│   ├── src/
│   │   ├── index.ts
│   │   ├── beforeUserCreated.ts
│   │   └── processScheduledMessages.ts
│   ├── tsconfig.json
│   └── package.json
└── firebase.json
```

## Tarefas

### 1. Scaffold do projeto
- [ ] Criar estrutura `shared/`, `web/`, `functions/`
- [ ] Inicializar Vite + React + TypeScript em `web/`
- [ ] Configurar Tailwind v4 no Vite
- [ ] Configurar MUI com `enableCssLayer`
- [ ] Inicializar Firebase Functions em `functions/`

### 2. Tipos compartilhados
- [ ] `shared/types.ts` — Connection, Contact, Message, Tenant

### 3. Firebase config
- [ ] `web/src/config/firebase.ts` — inicialização Firebase
- [ ] `.env` — variáveis de ambiente
- [ ] `firebase.json` — configuração hosting + functions + firestore + emulators

### 4. Autenticação
- [ ] `AuthContext.tsx` — onAuthStateChanged, login, register, loginWithGoogle, logout
- [ ] `LoginPage.tsx`
- [ ] `RegisterPage.tsx`
- [ ] `AuthGuard.tsx` — redireciona /login se não autenticado
- [ ] `AppLayout.tsx` — shell com sidebar navegação

### 5. Tenant + Regras de Segurança
- [ ] `functions/src/beforeUserCreated.ts` — blocking function
- [ ] `firestore.rules` — regras de segurança
- [ ] `firestore.indexes.json` — índices compostos

### 6. Conexões CRUD
- [ ] `useConnections.ts` — hook com TanStack Query (list, create, update, soft delete)
- [ ] `ConnectionsPage.tsx` — tabela + dialog
- [ ] `ConnectionDialog.tsx` — form create/edit

### 7. Contatos CRUD
- [ ] `useContacts.ts` — hook com TanStack Query (list, create, update, soft delete)
- [ ] `ContactsPage.tsx` — tabela + dialog
- [ ] `ContactDialog.tsx` — form create/edit com select de conexão

### 8. Mensagens CRUD + Agendamento + Realtime
- [ ] `useMessages.ts` — hook com TanStack Query + onSnapshot
- [ ] `useProcessScheduled.ts` — hook que chama callable function
- [ ] `functions/src/processScheduledMessages.ts` — actualiza status scheduled→sent
- [ ] `MessagesPage.tsx` — tabela + filtros + dialog
- [ ] `MessageDialog.tsx` — form create/edit com select múltiplo de contatos + datetime picker
- [ ] `MessageFilters.tsx` — filtros status, conexão, contato
- [ ] `useMessageFilters.ts` — Zustand store

### 9. Verificação final
- [ ] Lint + typecheck
- [ ] Teste manual de fluxo completo
- [ ] Verificar isolamento multi-tenant (usuário A não vê dados do B)
