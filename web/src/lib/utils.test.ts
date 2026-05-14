import { describe, expect, it } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import { convertTimestamps } from './utils'

describe('convertTimestamps', () => {
  it('converts Firestore timestamps to dates and preserves other values', () => {
    const createdAt = Timestamp.fromDate(new Date('2026-05-14T10:00:00.000Z'))

    const result = convertTimestamps<{ createdAt: Date; name: string; deletedAt: null }>({
      createdAt,
      name: 'Broadcast',
      deletedAt: null,
    })

    expect(result).toEqual({
      createdAt: new Date('2026-05-14T10:00:00.000Z'),
      name: 'Broadcast',
      deletedAt: null,
    })
  })
})

