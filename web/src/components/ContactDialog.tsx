import { useState, useEffect, type FormEvent } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import type { Contact, Connection } from '@shared/types'

interface Props {
  open: boolean
  contact: Contact | null
  connections: Connection[]
  onClose: () => void
  onSave: (data: { name: string; phone: string; connectionId: string }) => Promise<void>
}

export default function ContactDialog({ open, contact, connections, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [connectionId, setConnectionId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? '')
      setPhone(contact?.phone ?? '')
      setConnectionId(contact?.connectionId ?? '')
    }
  }, [open, contact])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ name, phone, connectionId })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{contact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth required />
          <select
            value={connectionId}
            onChange={(e) => setConnectionId(e.target.value)}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || !name.trim() || !phone.trim() || !connectionId}>
            {contact ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
