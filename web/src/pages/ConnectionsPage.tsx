import { useState, useCallback } from 'react'
import { useConnections } from '../hooks/useConnections'
import ConnectionDialog from '../components/ConnectionDialog'
import type { Connection } from '@shared/types'
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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

export default function ConnectionsPage() {
  const { list, create, update, remove } = useConnections()
  const [dialog, setDialog] = useState<'closed' | 'create' | Connection>('closed')
  const [error, setError] = useState('')

  const handleSave = useCallback(
    async (name: string) => {
      setError('')
      try {
        if (typeof dialog === 'object') {
          await update.mutateAsync({ id: dialog.id, name })
        } else {
          await create.mutateAsync({ name })
        }
        setDialog('closed')
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Erro desconhecido')
      }
    },
    [dialog, update, create],
  )

  const handleEdit = useCallback((conn: Connection) => {
    setDialog(conn)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Excluir esta conexão?')) {
        remove.mutate(id)
      }
    },
    [remove],
  )

  if (list.isLoading) return <CircularProgress />
  if (list.isError) return <Alert severity="error">{list.error?.message}</Alert>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <h1 className="text-2xl font-bold">Conexões</h1>
        <Button variant="contained" onClick={() => setDialog('create')}>
          Nova Conexão
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-neutral-500">
                  Nenhuma conexão encontrada
                </TableCell>
              </TableRow>
            )}
            {list.data?.map((conn) => (
              <TableRow key={conn.id}>
                <TableCell>{conn.name}</TableCell>
                <TableCell>{conn.createdAt?.toLocaleDateString() ?? '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(conn)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(conn.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {error && <Alert severity="error" className="mt-4">{error}</Alert>}

      <ConnectionDialog
        open={dialog !== 'closed'}
        connection={typeof dialog === 'object' ? dialog : null}
        onClose={() => setDialog('closed')}
        onSave={handleSave}
      />
    </Box>
  )
}
