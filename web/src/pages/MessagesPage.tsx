import { useCallback, useMemo, useState } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useConnections } from '../hooks/useConnections'
import { useContacts } from '../hooks/useContacts'
import MessageDialog from '../components/MessageDialog'
import MessageFilters from '../components/MessageFilters'
import type { Message } from '@shared/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

const statusColor = (s: string) => {
  switch (s) {
    case 'scheduled':
      return 'warning'
    case 'sent':
      return 'success'
    default:
      return 'default'
  }
}

interface MessageRowProps {
  msg: Message
  connectionName: string
  contactNames: string
  onEdit: (msg: Message) => void
  onDelete: (id: string) => void
}

function MessageRow({ msg, connectionName, contactNames, onEdit, onDelete }: MessageRowProps) {
  return (
    <TableRow>
      <TableCell className="max-w-xs truncate">{msg.body}</TableCell>
      <TableCell>{connectionName}</TableCell>
      <TableCell className="max-w-xs truncate">{contactNames}</TableCell>
      <TableCell>
        <Chip label={msg.status} color={statusColor(msg.status)} size="small" />
      </TableCell>
      <TableCell>
        {msg.scheduledAt
          ? new Date(msg.scheduledAt).toLocaleString()
          : '-'}
      </TableCell>
      <TableCell>
        {msg.createdAt?.toLocaleDateString() ?? '-'}
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => onEdit(msg)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(msg.id)} size="small">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

interface MessageTableProps {
  messages: Message[]
  connectionMap: Map<string, string>
  contactMap: Map<string, string>
  onEdit: (msg: Message) => void
  onDelete: (id: string) => void
}

function MessageTable({ messages, connectionMap, contactMap, onEdit, onDelete }: MessageTableProps) {
  if (messages.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-neutral-500">
          Nenhuma mensagem encontrada
        </TableCell>
      </TableRow>
    )
  }

  return messages.map((msg) => {
    const names = msg.contactIds
      .map((id) => contactMap.get(id))
      .filter(Boolean)
      .join(', ')

    return (
      <MessageRow
        key={msg.id}
        msg={msg}
        connectionName={connectionMap.get(msg.connectionId) ?? msg.connectionId}
        contactNames={names}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  })
}

export default function MessagesPage() {
  const { messages, loading, error, create, update, remove } = useMessages()
  const { list: listConnections } = useConnections()
  const { list: listContacts } = useContacts()
  const [dialog, setDialog] = useState<'closed' | 'create' | Message>('closed')

  const connections = listConnections.data ?? []
  const contacts = listContacts.data ?? []

  const connectionMap = useMemo(
    () => new Map(connections.map((c) => [c.id, c.name])),
    [connections],
  )

  const contactMap = useMemo(
    () => new Map(contacts.map((c) => [c.id, c.name])),
    [contacts],
  )

  const handleSave = useCallback(
    async (data: {
      body: string
      connectionId: string
      contactIds: string[]
      scheduledAt: Date | null
    }) => {
      if (typeof dialog === 'object') {
        await update({
          id: dialog.id,
          body: data.body,
          contactIds: data.contactIds,
          scheduledAt: data.scheduledAt,
        })
      } else {
        await create(data)
      }
      setDialog('closed')
    },
    [dialog, update, create],
  )

  const handleEdit = useCallback((msg: Message) => {
    setDialog(msg)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Excluir esta mensagem?')) {
        remove(id)
      }
    },
    [remove],
  )

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={() => setDialog('create')}>
            Nova Mensagem
          </Button>
        </Box>
      </Box>

      <MessageFilters />

      <TableContainer component={Paper} className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mensagem</TableCell>
              <TableCell>Conexão</TableCell>
              <TableCell>Contatos</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Agendado</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <MessageTable
              messages={messages}
              connectionMap={connectionMap}
              contactMap={contactMap}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TableBody>
        </Table>
      </TableContainer>

      <MessageDialog
        open={dialog !== 'closed'}
        message={typeof dialog === 'object' ? dialog : null}
        connections={connections}
        contacts={contacts}
        onClose={() => setDialog('closed')}
        onSave={handleSave}
      />

    </Box>
  )
}
