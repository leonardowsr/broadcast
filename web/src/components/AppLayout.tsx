import { Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useThemeToggle } from '../context/ThemeContext'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HubIcon from '@mui/icons-material/Hub'
import PeopleIcon from '@mui/icons-material/People'
import EmailIcon from '@mui/icons-material/Email'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const navItems = [
  { label: 'Dashboard', path: '/app', icon: <DashboardIcon /> },
  { label: 'Conexões', path: '/app/connections', icon: <HubIcon /> },
  { label: 'Contatos', path: '/app/contacts', icon: <PeopleIcon /> },
  { label: 'Mensagens', path: '/app/messages', icon: <EmailIcon /> },
]

export function AppLayout() {
  const { logout } = useAuth()
  const { mode, toggle } = useThemeToggle()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar position="static">
        <Toolbar className="flex justify-between">
          <Typography variant="h6">Broadcast</Typography>
          <Box display="flex" gap={1}>
            <Button color="inherit" onClick={toggle} startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}>
              {mode === 'dark' ? 'Claro' : 'Escuro'}
            </Button>
            <Button color="inherit" onClick={logout}>
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box display="flex" flex={1}>
        <Box
          component="nav"
          className="w-60 border-r border-neutral-200 dark:border-neutral-700 shrink-0"
        >
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon className="min-w-10">{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
        </Box>

        <Box component="main" className="flex-1 p-6">
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
