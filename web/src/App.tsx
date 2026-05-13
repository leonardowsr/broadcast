import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthGuard } from './components/AuthGuard'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ConnectionsPage from './pages/ConnectionsPage'
import ContactsPage from './pages/ContactsPage'
import MessagesPage from './pages/MessagesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/connections" element={<ConnectionsPage />} />
          <Route path="/app/contacts" element={<ContactsPage />} />
          <Route path="/app/messages" element={<MessagesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
