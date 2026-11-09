import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

import PublicLayout from './layouts/PublicLayout'
import StudentLayout from './layouts/StudentLayout'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ReviewFeed from './pages/auth/ReviewFeed'

// Temporary pages
function Placeholder({ title }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">
        {title}
      </h1>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <Routes>
          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route
              path="/"
              element={<ReviewFeed />}
            />

            <Route
              path="/shops"
              element={<Placeholder title="Shops" />}
            />

            <Route
              path="/shops/:id"
              element={<Placeholder title="Shop Details" />}
            />

            <Route
              path="/events"
              element={<Placeholder title="Events" />}
            />

            <Route
              path="/events/:id"
              element={<Placeholder title="Event Details" />}
            />
          </Route>

          {/* Student Pages */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route element={<StudentLayout />}>
              <Route
                path="/reviews/new"
                element={<Placeholder title="Create Review" />}
              />

              <Route
                path="/favorites"
                element={<Placeholder title="Favorites" />}
              />

              <Route
                path="/complaints/new"
                element={<Placeholder title="Create Complaint" />}
              />

              <Route
                path="/notifications"
                element={<Placeholder title="Notifications" />}
              />

              <Route
                path="/profile"
                element={<Placeholder title="My Profile" />}
              />
            </Route>
          </Route>

          {/* Shop Owner Pages */}
          <Route element={<ProtectedRoute roles={['shop_owner']} />}>
            <Route element={<OwnerLayout />}>
              <Route
                path="/owner"
                element={<Placeholder title="Owner Dashboard" />}
              />

              <Route
                path="/owner/shop"
                element={<Placeholder title="Manage Shop" />}
              />

              <Route
                path="/owner/menu"
                element={<Placeholder title="Manage Menu" />}
              />
            </Route>
          </Route>

          {/* Admin Pages */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AdminLayout />}>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}