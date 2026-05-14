import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password)
      navigate('/app/connections')
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Erro ao cadastrar')
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" className="bg-neutral-50 dark:bg-neutral-900">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4 p-6">
          <Typography variant="h5" className="text-center font-bold">
            Cadastro
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" fullWidth>
              Cadastrar
            </Button>
          </form>

          <Typography className="text-center text-sm">
            Já tem conta? <Link to="/login" className="underline">Entrar</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
