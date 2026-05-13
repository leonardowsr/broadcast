import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { where, type FirestoreError, type QueryConstraint } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { createTenantDoc, listActiveTenantDocs, softDeleteTenantDoc, updateTenantDoc } from '../lib/tenantFirestore'
import type { Contact, CreateContactInput, UpdateContactInput } from '@shared/types'

export function useContacts(connectionId?: string) {
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()

  const list = useQuery<Contact[], FirestoreError>({
    queryKey: ['contacts', tenantId, connectionId],
    queryFn: async () => {
      if (!tenantId) return []
      const constraints: QueryConstraint[] = []
      if (connectionId) {
        constraints.push(where('connectionId', '==', connectionId))
      }
      return listActiveTenantDocs<Contact>('contacts', tenantId, constraints)
    },
    enabled: !!tenantId,
  })

  const create = useMutation({
    mutationFn: async (input: CreateContactInput) => {
      if (!tenantId) throw new Error('Sem tenant')
      await createTenantDoc('contacts', tenantId, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateContactInput & { id: string }) => {
      await updateTenantDoc('contacts', id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await softDeleteTenantDoc('contacts', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })

  return { list, create, update, remove }
}
