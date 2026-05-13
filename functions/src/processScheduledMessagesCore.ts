interface QuerySnapshot<TDoc> {
  empty: boolean
  size: number
  docs: TDoc[]
}

interface Query<TDoc> {
  where: (field: string, operator: string, value: unknown) => Query<TDoc>
  limit: (count: number) => Query<TDoc>
  get: () => Promise<QuerySnapshot<TDoc>>
}

interface Batch<TDoc> {
  update: (ref: TDoc, data: { status: 'sent'; sentAt: unknown }) => void
  commit: () => Promise<unknown>
}

interface ScheduledMessagesDb<TDoc> {
  collection: (name: 'messages') => Query<TDoc>
  batch: () => Batch<TDoc>
}

export async function sendDueScheduledMessages<TDoc>(params: {
  db: ScheduledMessagesDb<TDoc>
  now: unknown
  tenantId?: string
}) {
  let messages = params.db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', params.now)
    .where('deletedAt', '==', null)
    .limit(500)

  if (params.tenantId) {
    messages = messages.where('tenantId', '==', params.tenantId)
  }

  const snapshot = await messages.get()
  if (snapshot.empty) return 0

  const batch = params.db.batch()
  snapshot.docs.forEach((message) => {
    batch.update(message, {
      status: 'sent',
      sentAt: params.now,
    })
  })

  await batch.commit()
  return snapshot.size
}
