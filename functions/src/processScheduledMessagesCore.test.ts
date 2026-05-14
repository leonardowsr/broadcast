import { describe, expect, it, vi } from 'vitest'
import { sendDueScheduledMessages } from './processScheduledMessagesCore'

function makeDb(docs: string[]) {
  const filters: Array<[string, string, unknown]> = []
  const updates: Array<{ doc: string; data: unknown }> = []
  const commit = vi.fn(async () => undefined)

  const query = {
    where: vi.fn((field: string, operator: string, value: unknown) => {
      filters.push([field, operator, value])
      return query
    }),
    limit: vi.fn(() => query),
    get: vi.fn(async () => ({ empty: docs.length === 0, size: docs.length, docs })),
  }

  return {
    db: {
      collection: vi.fn(() => query),
      batch: vi.fn(() => ({
        update: vi.fn((doc: string, data: unknown) => updates.push({ doc, data })),
        commit,
      })),
    },
    filters,
    updates,
    commit,
  }
}

describe('sendDueScheduledMessages', () => {
  it('marks due scheduled messages as sent for one tenant', async () => {
    const { db, filters, updates, commit } = makeDb(['msg-1', 'msg-2'])

    await expect(sendDueScheduledMessages({ db, now: 'now', tenantId: 'tenant-1' })).resolves.toBe(2)
    expect(filters).toEqual([
      ['status', '==', 'scheduled'],
      ['scheduledAt', '<=', 'now'],
      ['deletedAt', '==', null],
      ['tenantId', '==', 'tenant-1'],
    ])
    expect(updates).toEqual([
      { doc: 'msg-1', data: { status: 'sent', sentAt: 'now' } },
      { doc: 'msg-2', data: { status: 'sent', sentAt: 'now' } },
    ])
    expect(commit).toHaveBeenCalledOnce()
  })

  it('does not commit when there are no due messages', async () => {
    const { db, commit } = makeDb([])

    await expect(sendDueScheduledMessages({ db, now: 'now' })).resolves.toBe(0)
    expect(commit).not.toHaveBeenCalled()
  })
})

