# Broadcast — Issues

---

## #1 — Auth + Tenant bootstrap

**Type:** AFK
**Blocked by:** None

### What to build

Usuário consegue se registrar com email/senha ou Google, fazer login, e ver o dashboard protegido com sidebar de navegação. Ao registrar, uma blocking function cria automaticamente o tenant e seta a custom claim `tenantId` no token. Usuário não autenticado é redirecionado para `/login`. Rotas protegidas por AuthGuard. Shell com AppLayout (sidebar: Conexões, Contatos, Mensagens, Logout).

### Acceptance criteria

- [ ] Registro com email/senha funcional
- [ ] Login com email/senha funcional
- [ ] Login com Google funcional
- [ ] `beforeUserCreated` cria doc em `tenants` e seta custom claim `tenantId`
- [ ] Custom claim `tenantId` disponível no token do cliente
- [ ] AuthGuard redireciona para `/login` se não autenticado
- [ ] Usuário autenticado acessa `/app/*` e vê AppLayout com sidebar
- [ ] Logout funcional
- [ ] Regras de segurança Firestore restringem acesso por `tenantId`

---

## #2 — Conexões CRUD

**Type:** AFK
**Blocked by:** #1

### What to build

Usuário logado gerencia suas conexões. Tela com tabela listando conexões (nome, data de criação). Botão "Nova conexão" abre dialog com campo nome. Linha da tabela tem ações editar (abre dialog preenchido) e excluir (soft delete — seta `deletedAt`). Todas queries filtram `deletedAt == null` e `tenantId == <tenant do usuário>`. Hook `useConnections` com TanStack Query (invalidate após mutation).

### Acceptance criteria

- [ ] Lista conexões do tenant logado (sem deletadas)
- [ ] Cria nova conexão (dialog, campo nome)
- [ ] Edita nome da conexão (dialog preenchido)
- [ ] Soft delete conexão (seta `deletedAt`, não aparece mais na lista)
- [ ] Conexões de outro tenant não aparecem
- [ ] Campos obrigatórios validados (nome não vazio)

---

## #3 — Contatos CRUD

**Type:** AFK
**Blocked by:** #2

### What to build

Usuário logado gerencia contatos vinculados a conexões. Tela com tabela (nome, telefone, nome da conexão). Botão "Novo contato" abre dialog com campos nome, telefone e select de conexão (lista conexões do tenant). Ações editar e excluir (soft delete). Hook `useContacts` com TanStack Query. Select de conexão filtra apenas conexões não deletadas do tenant.

### Acceptance criteria

- [ ] Lista contatos do tenant logado (sem deletados)
- [ ] Select de conexão mostra apenas conexões ativas do tenant
- [ ] Cria contato com nome, telefone, conexão vinculada
- [ ] Edita contato (dialog preenchido)
- [ ] Soft delete contato
- [ ] Contatos de outro tenant não aparecem
- [ ] Validação: nome e telefone obrigatórios, conexão obrigatória

---

## #4 — Mensagens CRUD + Agendamento + Realtime

**Type:** AFK
**Blocked by:** #3

### What to build

Usuário cria mensagens selecionando múltiplos contatos, corpo da mensagem, e opcionalmente agenda para horário futuro. Tabela de mensagens em tempo real com `onSnapshot` — status muda automaticamente de `scheduled` para `sent` quando a callable function `processScheduledMessages` é invocada. Dialog de criação/edição com multiselect de contatos (filtrados por conexão selecionada), campo body, datetime picker para agendamento. Status exibido como badge (scheduled = laranja, sent = verde). Ações editar e excluir (soft delete). Ao abrir a página, hook `useProcessScheduled` chama a callable function que faz batch update de mensagens com `scheduledAt <= now`.

### Acceptance criteria

- [ ] Cria mensagem selecionando múltiplos contatos (multiselect)
- [ ] Contatos do multiselect filtrados pela conexão selecionada
- [ ] Agenda mensagem com data/hora futura (campo `scheduledAt`)
- [ ] Mensagem sem agendamento criada com status `sent`
- [ ] Mensagem com agendamento criada com status `scheduled`
- [ ] `processScheduledMessages` atualiza status `scheduled` → `sent` quando `scheduledAt <= now`
- [ ] Lista de mensagens atualiza em tempo real (`onSnapshot`)
- [ ] Badge de status reflete estado atual
- [ ] Edita mensagem (dialog preenchido)
- [ ] Soft delete mensagem
- [ ] Mensagens de outro tenant não aparecem
- [ ] Validação: pelo menos 1 contato, body não vazio

---

## #5 — Filtros de mensagens

**Type:** AFK
**Blocked by:** #4

### What to build

Filtros na tela de mensagens: por status (scheduled/sent), por conexão (select), por contato (select usando `array-contains`). Estado dos filtros gerenciado por Zustand store. Selecionar conexão recarrega lista de contatos disponíveis para aquele filtro. Filtros aplicados em tempo real via `onSnapshot` com query composta. UI de filtros como barra horizontal acima da tabela.

### Acceptance criteria

- [ ] Filtro por status: scheduled, sent, ou todos
- [ ] Filtro por conexão: select com conexões do tenant
- [ ] Filtro por contato: select com contatos da conexão filtrada (usa `array-contains`)
- [ ] Ao selecionar conexão, select de contato recarrega
- [ ] Filtros combinados funcionam (ex: status=scheduled + conexão=X + contato=Y)
- [ ] Limpar filtros reseta para lista completa
- [ ] Filtros persistem no estado do Zustand durante a sessão
