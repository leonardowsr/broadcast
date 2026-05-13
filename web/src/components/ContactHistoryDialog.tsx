import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import { collection, query, where, orderBy, onSnapshot, type Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

interface HistoryMessage {
  id: string
  body: string
  status: string
  createdAt: Timestamp | null
}

interface Props {
  open: boolean
  contactId: string
  contactName: string
  onClose: () => void
}

export default function ContactHistoryDialog({ open, contactId, contactName, onClose }: Props) {
  const { tenantId } = useAuth()
  const [messages, setMessages] = useState<HistoryMessage[]>([])

  useEffect(() => {
    if (!tenantId || !contactId) return
    const q = query(
      collection(db, 'messages'),
      where('tenantId', '==', tenantId),
      where('contactIds', 'array-contains', contactId),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistoryMessage)))
    })
    return unsub
  }, [tenantId, contactId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Histórico — {contactName}</DialogTitle>
      <DialogContent>
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma mensagem para este contato.</p>
        )}
        <Table>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="text-sm">{msg.body}</TableCell>
                <TableCell>
                  <Chip
                    label={msg.status}
                    color={msg.status === 'sent' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
