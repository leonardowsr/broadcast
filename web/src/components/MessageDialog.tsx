import { useState, useEffect, type FormEvent } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import type { Message, Contact, Connection } from '@shared/types'

interface Props {
  open: boolean
  message: Message | null
  connections: Connection[]
  contacts: Contact[]
  onClose: () => void
  onSave: (data: {
    body: string
    connectionId: string
    contactIds: string[]
    scheduledAt: Date | null
  }) => Promise<void>
}

export default function MessageDialog({ open, message, connections, contacts, onClose, onSave }: Props) {
  const [connectionId, setConnectionId] = useState('')
  const [body, setBody] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredContacts = contacts.filter((c) => c.connectionId === connectionId)

  useEffect(() => {
    if (open) {
      setConnectionId(message?.connectionId ?? '')
      setBody(message?.body ?? '')
      setSelectedContacts(message?.contactIds ?? [])
      setScheduledAt(
        message?.scheduledAt
          ? new Date(message.scheduledAt).toISOString().slice(0, 16)
          : '',
      )
    }
  }, [open, message])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        body,
        connectionId,
        contactIds: selectedContacts,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{message ? 'Editar Mensagem' : 'Nova Mensagem'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <select
            value={connectionId}
            onChange={(e) => {
              setConnectionId(e.target.value)
              setSelectedContacts([])
            }}
            required
            className="border border-neutral-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Selecione uma conexão</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <TextField
            label="Mensagem"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
          />

          <fieldset>
            <legend className="text-sm font-medium mb-1">Contatos</legend>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border rounded p-2">
              {!connectionId && (
                <p className="text-sm text-neutral-500">Selecione uma conexão primeiro</p>
              )}
              {connectionId && filteredContacts.length === 0 && (
                <p className="text-sm text-neutral-500">Nenhum contato nesta conexão</p>
              )}
              {filteredContacts.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.id)}
                    onChange={() => toggleContact(c.id)}
                  />
                  {c.name} — {c.phone}
                </label>
              ))}
            </div>
          </fieldset>

          <TextField
            label="Agendar para"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !body.trim() || !connectionId || selectedContacts.length === 0}
          >
            {message ? 'Salvar' : scheduledAt ? 'Agendar' : 'Enviar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
