import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { OrgProvider } from './lib/OrgContext'
import { ToastProvider } from './lib/ToastContext'
import ConfigWarning from './components/ConfigWarning'
import Login from './components/Login'
import Register from './components/Register'
import AcceptInvite from './pages/AcceptInvite'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Preise from './pages/Preise'
import Impressum from './pages/Impressum'
import Datenschutz from './pages/Datenschutz'
import Intern from './pages/Intern'

function RootRoute() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/app" replace />
  return <Landing />
}

function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  // Send the user back to whatever protected page they were headed for
  // before ProtectedRoute detoured them here (e.g. the "Intern" footer
  // link) — without this, login always dumped everyone on /app regardless
  // of where they actually meant to go.
  if (session) return <Navigate to={location.state?.from?.pathname || '/app'} replace />
  return children
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/preise" element={<Preise />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route
        path="/intern"
        element={
          <ProtectedRoute>
            <ToastProvider>
              <Intern />
            </ToastProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <OrgProvider>
              <AppShell />
            </OrgProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigWarning />

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
