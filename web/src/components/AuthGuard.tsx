import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, tenantId, loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!tenantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="error">Sessão autenticada sem tenant. Faça logout e entre novamente.</Alert>
      </Box>
    )
  }

  return <>{children}</>
}
