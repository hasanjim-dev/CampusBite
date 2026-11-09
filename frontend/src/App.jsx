import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const Placeholder = ({ title }) => <div className="text-2xl">{title}</div>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<Placeholder title="Review Feed" />} />
            <Route path="/shops" element={<Placeholder title="Shops" />} />
            <Route path="/events" element={<Placeholder title="Events" />} />

            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="/favorites" element={<Placeholder title="Favorites" />} />
            </Route>
            <Route element={<ProtectedRoute roles={['shop_owner']} />}>
              <Route path="/owner" element={<Placeholder title="Owner Dashboard" />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}