export interface AuthUserContext {
  uid: string
  token: {
    tenantId?: unknown
    name?: unknown
    email?: unknown
  }
}

interface TenantDoc {
  get: () => Promise<{ exists: boolean }>
  set: (data: { name: string; createdAt: unknown }) => Promise<unknown>
}

interface EnsureTenantDeps {
  tenantDoc: (tenantId: string) => TenantDoc
  serverTimestamp: () => unknown
  setCustomUserClaims: (uid: string, claims: { tenantId: string }) => Promise<unknown>
}

export async function ensureTenantForUser(deps: EnsureTenantDeps, user: AuthUserContext) {
  const tenantId = typeof user.token.tenantId === 'string' ? user.token.tenantId : user.uid
  const ref = deps.tenantDoc(tenantId)
  const snap = await ref.get()

  if (!snap.exists) {
    await ref.set({
      name: readTenantName(user),
      createdAt: deps.serverTimestamp(),
    })
  }

  if (user.token.tenantId !== tenantId) {
    await deps.setCustomUserClaims(user.uid, { tenantId })
  }

  return { tenantId }
}

function readTenantName(user: AuthUserContext) {
  if (typeof user.token.name === 'string' && user.token.name.trim()) return user.token.name
  if (typeof user.token.email === 'string' && user.token.email.trim()) return user.token.email
  return 'Novo tenant'
}
