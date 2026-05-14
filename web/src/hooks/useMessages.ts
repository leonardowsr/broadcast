import { useState, useEffect } from 'react'
import {
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { convertTimestamps } from '../lib/utils'
import { activeTenantQuery, softDeleteTenantDoc, tenantCollectionRef } from '../lib/tenantFirestore'
import type { Message, CreateMessageInput, UpdateMessageInput } from '@shared/types'
import { useMessageFilters } from '../stores/useMessageFilters'

const messagesRef = () => tenantCollectionRef('messages')

function buildQuery(tenantId: string, filters: { status: string; connectionId: string; contactId: string }) {
  const constraints: QueryConstraint[] = []

  if (filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status))
  }
  if (filters.connectionId) {
    constraints.push(where('connectionId', '==', filters.connectionId))
  }
  if (filters.contactId) {
    constraints.push(where('contactIds', 'array-contains', filters.contactId))
  }

  return activeTenantQuery('messages', tenantId, constraints)
}

export function useMessages() {
  const { tenantId } = useAuth()
  const filters = useMessageFilters()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const q = buildQuery(tenantId, filters)
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = convertTimestamps<Omit<Message, 'id'>>(d.data())
          return { id: d.id, ...data }
        })
        setMessages(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsub
  }, [tenantId, filters.status, filters.connectionId, filters.contactId])

  const create = async (input: CreateMessageInput) => {
    if (!tenantId) throw new Error('Sem tenant')
    const now = Timestamp.now()
    const isScheduled = input.scheduledAt && input.scheduledAt > now.toDate()
    await addDoc(messagesRef(), {
      ...input,
      tenantId,
      scheduledAt: input.scheduledAt ? Timestamp.fromDate(input.scheduledAt) : null,
      status: isScheduled ? 'scheduled' : 'sent',
      sentAt: isScheduled ? null : now,
      deletedAt: null,
      createdAt: now,
    })
  }

  const update = async ({ id, ...input }: UpdateMessageInput & { id: string }) => {
    const updates: Record<string, unknown> = { ...input }
    if (input.scheduledAt) {
      updates.scheduledAt = Timestamp.fromDate(input.scheduledAt)
    }
    await updateDoc(doc(messagesRef(), id), updates)
  }

  const remove = async (id: string) => {
    await softDeleteTenantDoc('messages', id)
  }

  return { messages, loading, error, create, update, remove }
}
