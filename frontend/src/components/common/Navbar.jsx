
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [shopsMenuOpen, setShopsMenuOpen] = useState(false)

  const publicLinks = [
    { to: '/', label: 'Reviews' },
    { to: '/shops', label: 'Shops' },
    { to: '/events', label: 'Events' },
  ]

  const roleLinks = {
    student: [
      { to: '/complaints', label: 'Complaints' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/profile', label: 'My Profile' },
    ],

    shop_owner: [
      { to: '/owner', label: 'Dashboard' },
      { to: '/owner/shop', label: 'Manage Shop' },
      { to: '/owner/menu', label: 'Manage Menu' },
      { to: '/owner/complaints', label: 'Complaints' },
    ],

    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/users', label: 'Manage Users' },
      { to: '/admin/shops', label: 'Manage Shops' },
      { to: '/admin/complaints', label: 'Complaints' },
    ],
  }

  const links = [
    ...publicLinks,
    ...(roleLinks[user?.role] || []),
  ]
  const linkStyle = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-orange-500'
        : 'text-gray-600 hover:text-orange-500'
    }`

  const onLogout = async () => {
    await logout()
    setOpen(false)
    setShopsMenuOpen(false)
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            setOpen(false)
            setShopsMenuOpen(false)
          }}
          className="text-2xl font-extrabold text-orange-500"
        >
          CampusBite
        </Link>

        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center gap-6">

          {links.map((link) => (
            link.to === '/shops' ? (
              <div
                key={link.to}
                className="relative flex items-center gap-1"
              >
                <NavLink
                  to="/shops"
                  className={linkStyle}
                >
                  Shops
                </NavLink>

                {user?.role === 'student' && (
                  <button
                    type="button"
                    onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                    className="text-gray-500 hover:text-orange-500 text-sm px-1"
                    aria-label="Toggle Shops menu"
                  >
                    {shopsMenuOpen ? '▲' : '▼'}
                  </button>
                )}

                {user?.role === 'student' && shopsMenuOpen && (
                  <div className="absolute left-0 top-full z-50 pt-3">
                    <div className="w-44 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                      <NavLink
                        to="/favorites"
                        onClick={() => setShopsMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                            isActive
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                          }`
                        }
                      >
                        ★ Favorites
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={linkStyle}
              >
                {link.label}
              </NavLink>
            )
          ))}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name}
              </span>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-orange-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Register
              </Link>
            </div>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>

      {/* Mobile Navbar */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4">

          {links.map((link) => (
            link.to === '/shops' ? (
              <div
                key={link.to}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <NavLink
                    to="/shops"
                    onClick={() => {
                      setOpen(false)
                      setShopsMenuOpen(false)
                    }}
                    className={linkStyle}
                  >
                    Shops
                  </NavLink>

                  {user?.role === 'student' && (
                    <button
                      type="button"
                      onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                      className="text-sm font-bold text-gray-500 px-3"
                      aria-label="Toggle Shops menu"
                    >
                      {shopsMenuOpen ? '−' : '+'}
                    </button>
                  )}
                </div>

                {user?.role === 'student' && shopsMenuOpen && (
                  <NavLink
                    to="/favorites"
                    onClick={() => {
                      setOpen(false)
                      setShopsMenuOpen(false)
                    }}
                    className="ml-4 text-sm font-medium text-gray-600 hover:text-orange-500"
                  >
                    ★ Favorites
                  </NavLink>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => {
                  setOpen(false)
                  setShopsMenuOpen(false)
                }}
                className={linkStyle}
              >
                {link.label}
              </NavLink>
            )
          ))}

          <div className="border-t pt-4">

            {user ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm text-gray-600">
                  {user.name}
                </span>

                <button
                  onClick={onLogout}
                  className="text-left text-red-500 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-gray-600"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="text-orange-500 font-medium"
                >
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  )
}
