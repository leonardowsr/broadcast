import { useMessageFilters } from '../stores/useMessageFilters'
import { useContacts } from '../hooks/useContacts'
import { useConnections } from '../hooks/useConnections'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export default function MessageFilters() {
  const filters = useMessageFilters()
  const { list: listConnections } = useConnections()
  const { list: listContacts } = useContacts(filters.connectionId || undefined)

  const connections = listConnections.data ?? []
  const contacts = listContacts.data ?? []

  return (
    <Box className="flex gap-3 items-end flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Status</label>
        <select
          value={filters.status}
          onChange={(e) => filters.setStatus(e.target.value as 'scheduled' | 'sent' | 'all')}
          className="border border-neutral-300 rounded px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="scheduled">Agendadas</option>
          <option value="sent">Enviadas</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Conexão</label>
        <select
          value={filters.connectionId}
          onChange={(e) => filters.setConnectionId(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Contato</label>
        <select
          value={filters.contactId}
          onChange={(e) => filters.setContactId(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <Button
        variant="text"
        size="small"
        onClick={filters.reset}
        className="self-end"
      >
        Limpar
      </Button>
    </Box>
  )
}
