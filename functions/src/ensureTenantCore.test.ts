import { describe, expect, it, vi } from 'vitest'
import { ensureTenantForUser, type AuthUserContext } from './ensureTenantCore'

function makeDeps(existingTenant = false) {
  const set = vi.fn(async () => undefined)
  const setCustomUserClaims = vi.fn(async () => undefined)

  return {
    deps: {
      tenantDoc: vi.fn(() => ({
        get: vi.fn(async () => ({ exists: existingTenant })),
        set,
      })),
      serverTimestamp: () => 'server-now',
      setCustomUserClaims,
    },
    set,
    setCustomUserClaims,
  }
}

describe('ensureTenantForUser', () => {
  it('creates a tenant from the authenticated user and sets the tenant claim', async () => {
    const { deps, set, setCustomUserClaims } = makeDeps(false)
    const user: AuthUserContext = {
      uid: 'user-1',
      token: { email: 'ana@example.com' },
    }

    await expect(ensureTenantForUser(deps, user)).resolves.toEqual({ tenantId: 'user-1' })
    expect(deps.tenantDoc).toHaveBeenCalledWith('user-1')
    expect(set).toHaveBeenCalledWith({ name: 'ana@example.com', createdAt: 'server-now' })
    expect(setCustomUserClaims).toHaveBeenCalledWith('user-1', { tenantId: 'user-1' })
  })

  it('keeps an existing tenant claim and does not rewrite existing tenants', async () => {
    const { deps, set, setCustomUserClaims } = makeDeps(true)
    const user: AuthUserContext = {
      uid: 'user-1',
      token: { tenantId: 'tenant-1', name: 'Acme' },
    }

    await expect(ensureTenantForUser(deps, user)).resolves.toEqual({ tenantId: 'tenant-1' })
    expect(deps.tenantDoc).toHaveBeenCalledWith('tenant-1')
    expect(set).not.toHaveBeenCalled()
    expect(setCustomUserClaims).not.toHaveBeenCalled()
  })
})

