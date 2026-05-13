import { useState, useCallback, useMemo } from 'react'
import { useContacts } from '../hooks/useContacts'
import { useConnections } from '../hooks/useConnections'
import ContactDialog from '../components/ContactDialog'
import ContactImportDialog from '../components/ContactImportDialog'
import ContactHistoryDialog from '../components/ContactHistoryDialog'
import type { Contact } from '@shared/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import HistoryIcon from '@mui/icons-material/History'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

export default function ContactsPage() {
  const { list: listContacts, create, update, remove } = useContacts()
  const { list: listConnections } = useConnections()
  const [dialog, setDialog] = useState<'closed' | 'create' | Contact>('closed')
  const [importOpen, setImportOpen] = useState(false)
  const [history, setHistory] = useState<{ id: string; name: string } | null>(null)

  const connections = listConnections.data ?? []
  const contacts = listContacts.data ?? []

  const connectionMap = useMemo(
    () => new Map(connections.map((c) => [c.id, c.name])),
    [connections],
  )

  const handleSave = useCallback(
    async (data: { name: string; phone: string; connectionId: string }) => {
      if (typeof dialog === 'object') {
        await update.mutateAsync({ id: dialog.id, ...data })
      } else {
        await create.mutateAsync(data)
      }
      setDialog('closed')
    },
    [dialog, update, create],
  )

  const handleImport = useCallback(
    async (contacts: { name: string; phone: string; connectionId: string }[]) => {
      for (const c of contacts) {
        await create.mutateAsync(c)
      }
    },
    [create],
  )

  const handleEdit = useCallback((contact: Contact) => {
    setDialog(contact)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Excluir este contato?')) {
        remove.mutate(id)
      }
    },
    [remove],
  )

  if (listContacts.isLoading) return <CircularProgress />
  if (listContacts.isError) return <Alert severity="error">{listContacts.error?.message}</Alert>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <h1 className="text-2xl font-bold">Contatos</h1>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setImportOpen(true)}>
            Importar CSV
          </Button>
          <Button variant="contained" onClick={() => setDialog('create')}>
            Novo Contato
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Conexão</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-neutral-500">
                  Nenhum contato encontrado
                </TableCell>
              </TableRow>
            )}
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{connectionMap.get(contact.connectionId) ?? contact.connectionId}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setHistory({ id: contact.id, name: contact.name })} size="small">
                    <HistoryIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(contact)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(contact.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ContactDialog
        open={dialog !== 'closed'}
        contact={typeof dialog === 'object' ? dialog : null}
        connections={connections}
        onClose={() => setDialog('closed')}
        onSave={handleSave}
      />

      <ContactImportDialog
        open={importOpen}
        connections={connections}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      {history && (
        <ContactHistoryDialog
          open
          contactId={history.id}
          contactName={history.name}
          onClose={() => setHistory(null)}
        />
      )}
    </Box>
  )
}
