import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { FirestoreError } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { createTenantDoc, listActiveTenantDocs, softDeleteTenantDoc, updateTenantDoc } from '../lib/tenantFirestore'
import type { Connection, CreateConnectionInput, UpdateConnectionInput } from '@shared/types'

export function useConnections() {
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()

  const list = useQuery<Connection[], FirestoreError>({
    queryKey: ['connections', tenantId],
    queryFn: async () => {
      if (!tenantId) return []
      return listActiveTenantDocs<Connection>('connections', tenantId)
    },
    enabled: !!tenantId,
  })

  const create = useMutation({
    mutationFn: async (input: CreateConnectionInput) => {
      if (!tenantId) throw new Error('Sem tenant')
      await createTenantDoc('connections', tenantId, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateConnectionInput & { id: string }) => {
      await updateTenantDoc('connections', id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await softDeleteTenantDoc('connections', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  })

  return { list, create, update, remove }
}
