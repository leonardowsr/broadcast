import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useConnections } from '../hooks/useConnections'
import { useContacts } from '../hooks/useContacts'
import { useMessages } from '../hooks/useMessages'

export default function DashboardPage() {
  const { list: connections } = useConnections()
  const { list: contacts } = useContacts()
  const { messages, loading } = useMessages()

  const conns = connections.data ?? []
  const conts = contacts.data ?? []

  const sent = messages.filter((m) => m.status === 'sent').length
  const scheduled = messages.filter((m) => m.status === 'scheduled').length

  const chartData = conns.map((c, i) => ({
    id: c.id,
    value: conts.filter((ct) => ct.connectionId === c.id).length,
    label: c.name,
    color: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#c2185b', '#5d4037'][i % 8],
  })).filter((d) => d.value > 0)

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">Dashboard</Typography>

      <Box display="flex" gap={3} flexWrap="wrap" mb={6}>
        {[
          { label: 'Conexões', value: conns.length, color: 'bg-blue-500' },
          { label: 'Contatos', value: conts.length, color: 'bg-green-500' },
          { label: 'Enviadas', value: sent, color: 'bg-purple-500' },
          { label: 'Agendadas', value: scheduled, color: 'bg-orange-500' },
        ].map((item) => (
          <Card key={item.label} className="flex-1 min-w-40">
            <CardContent>
              <Typography variant="h3" className="font-bold">{item.value}</Typography>
              <Typography variant="body2" className="text-neutral-500">{item.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Contatos por Conexão</Typography>
            <Box display="flex" justifyContent="center">
              <PieChart
                series={[{ data: chartData }]}
                width={400}
                height={300}
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
