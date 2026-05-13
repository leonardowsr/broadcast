import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import type { Connection } from '@shared/types'

interface ParsedContact {
  name: string
  phone: string
}

interface Props {
  open: boolean
  connections: Connection[]
  onClose: () => void
  onImport: (contacts: { name: string; phone: string; connectionId: string }[]) => Promise<void>
}

export default function ContactImportDialog({ open, connections, onClose, onImport }: Props) {
  const [connectionId, setConnectionId] = useState('')
  const [preview, setPreview] = useState<ParsedContact[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n').filter(Boolean)
    const result: ParsedContact[] = []
    for (const line of lines) {
      const parts = line.split(',').map((s) => s.trim())
      if (parts.length >= 2 && parts[0] && parts[1]) {
        result.push({ name: parts[0], phone: parts[1] })
      }
    }
    return result
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setError('Nenhum contato válido encontrado. Use: nome,telefone')
      }
      setPreview(parsed)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!connectionId || preview.length === 0) return
    setImporting(true)
    try {
      await onImport(preview.map((c) => ({ ...c, connectionId })))
      onClose()
      setPreview([])
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setPreview([])
    setError('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar Contatos (CSV)</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <select
          value={connectionId}
          onChange={(e) => setConnectionId(e.target.value)}
          required
          className="border border-neutral-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Selecione uma conexão</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFile}
          className="text-sm"
        />

        {error && <Alert severity="error">{error}</Alert>}

        {preview.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">{preview.length} contato(s) encontrado(s):</p>
            <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm">
              {preview.map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-neutral-500">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={preview.length === 0 || !connectionId || importing}
        >
          Importar {preview.length > 0 ? `(${preview.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
