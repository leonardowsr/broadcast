import { onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Timestamp } from 'firebase-admin/firestore'
import { db } from './firebaseAdmin'
import { sendDueScheduledMessages } from './processScheduledMessagesCore'

export const processScheduledMessages = onCall({ region: 'southamerica-east1' }, async (request) => {
  const tenantId = request.auth?.token?.tenantId as string | undefined
  if (!tenantId) {
    throw new Error('Unauthenticated')
  }

  const processed = await processDueMessages(tenantId)
  return { processed }
})

export const processDueScheduledMessages = onSchedule(
  {
    region: 'southamerica-east1',
    schedule: 'every 1 minutes',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    await processDueMessages()
  },
)

async function processDueMessages(tenantId?: string) {
  return sendDueScheduledMessages({
    db: {
      collection: (name) => db.collection(name),
      batch: () => {
        const batch = db.batch()
        return {
          update: (message, data) => batch.update(message.ref, data),
          commit: () => batch.commit(),
        }
      },
    },
    now: Timestamp.now(),
    tenantId,
  })
}
