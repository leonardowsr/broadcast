export interface Tenant {
  id: string
  name: string
  createdAt: Date
}

export interface Connection {
  id: string
  tenantId: string
  name: string
  deletedAt: Date | null
  createdAt: Date
}

export interface Contact {
  id: string
  tenantId: string
  connectionId: string
  name: string
  phone: string
  deletedAt: Date | null
  createdAt: Date
}

export interface Message {
  id: string
  tenantId: string
  connectionId: string
  contactIds: string[]
  body: string
  status: 'scheduled' | 'sent' | 'failed'
  scheduledAt: Date | null
  sentAt: Date | null
  deletedAt: Date | null
  createdAt: Date
}

export type CreateConnectionInput = Pick<Connection, 'name'>
export type UpdateConnectionInput = Partial<CreateConnectionInput>

export type CreateContactInput = Pick<Contact, 'name' | 'phone' | 'connectionId'>
export type UpdateContactInput = Partial<CreateContactInput>

export type CreateMessageInput = Pick<Message, 'body' | 'connectionId' | 'contactIds' | 'scheduledAt'>
export type UpdateMessageInput = Partial<Pick<Message, 'body' | 'scheduledAt' | 'contactIds'>>
