
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles = [] }) {
  const { user } = useAuth()

  // User login না থাকলে Login page-এ পাঠাবে
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User-এর role অনুমোদিত না হলে Home page-এ পাঠাবে
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
