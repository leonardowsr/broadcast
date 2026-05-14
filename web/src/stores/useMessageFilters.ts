import { create } from 'zustand'

interface MessageFilters {
  status: 'scheduled' | 'sent' | 'all'
  connectionId: string
  contactId: string
  setStatus: (s: 'scheduled' | 'sent' | 'all') => void
  setConnectionId: (id: string) => void
  setContactId: (id: string) => void
  reset: () => void
}

export const useMessageFilters = create<MessageFilters>((set) => ({
  status: 'all',
  connectionId: '',
  contactId: '',
  setStatus: (status) => set({ status }),
  setConnectionId: (connectionId) => set({ connectionId, contactId: '' }),
  setContactId: (contactId) => set({ contactId }),
  reset: () => set({ status: 'all', connectionId: '', contactId: '' }),
}))
