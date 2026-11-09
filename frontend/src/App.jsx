
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

import PublicLayout from './layouts/PublicLayout'
import StudentLayout from './layouts/StudentLayout'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'

import ReviewFeed from './pages/auth/ReviewFeed'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import Shops from './pages/Shops'
import ShopDetails from './pages/ShopDetails'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'

import CreateReview from './pages/CreateReview'
import Favorites from './pages/Favorites'
import Complaint from './pages/Complaint'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

import OwnerDashboard from './pages/OwnerDashboard'

function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-2">This page is coming soon.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<ReviewFeed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:id" element={<ShopDetails />} />

            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
          </Route>

          {/* Student Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/reviews/new" element={<CreateReview />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/complaints/new" element={<Complaint />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Shop Owner Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route
              path="/owner/shop"
              element={<Placeholder title="Manage Shop" />}
            />
            <Route
              path="/owner/menu"
              element={<Placeholder title="Manage Menu" />}
            />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin"
              element={<Placeholder title="Admin Dashboard" />}
            />
            <Route
              path="/admin/users"
              element={<Placeholder title="Manage Users" />}
            />
            <Route
              path="/admin/shops"
              element={<Placeholder title="Manage Shops" />}
            />
          </Route>

          {/* Not Found */}
          <Route
            path="*"
            element={<Placeholder title="404 - Page Not Found" />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
