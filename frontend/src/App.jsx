import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/auth/Login'

const Placeholder = ({ title }) => <div className="p-10 text-2xl">{title}</div>

function Home() {
  const { user, logout } = useAuth()
  return (
    <div className="p-10">
      <p>Hello {user?.name} ({user?.role})</p>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">Logout</button>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute roles={['shop_owner']} />}>
            <Route path="/owner" element={<Placeholder title="Owner Dashboard" />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}