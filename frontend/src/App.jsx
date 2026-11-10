
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
import ManageShop from './pages/owner/ManageShop'
import ManageMenu from './pages/owner/ManageMenu'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageShops from './pages/admin/ManageShops'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-orange-500">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
      <a href="/" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold">
        Back to Home
      </a>
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
            <Route path="/owner/shop" element={<ManageShop />} />
            <Route path="/owner/menu" element={<ManageMenu />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/shops" element={<ManageShops />} />
          </Route>

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
