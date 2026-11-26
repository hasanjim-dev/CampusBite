
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Star,
  UtensilsCrossed,
  UserCircle,
} from 'lucide-react'
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
    `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-orange-50 text-orange-600'
        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
    }`

  const closeMenus = () => {
    setOpen(false)
    setShopsMenuOpen(false)
  }

  const onLogout = async () => {
    await logout()
    closeMenus()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          to="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-200 transition-transform duration-200 group-hover:scale-105">
            <UtensilsCrossed size={23} />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              Campus<span className="text-orange-500">Bite</span>
            </span>
            <span className="hidden text-[10px] font-medium tracking-[2px] text-gray-400 sm:block">
              CAMPUS FOOD COMMUNITY
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            link.to === '/shops' ? (
              <div key={link.to} className="relative">
                <div className="flex items-center">
                  <NavLink to="/shops" className={linkStyle}>
                    Shops
                  </NavLink>

                  {user?.role === 'student' && (
                    <button
                      type="button"
                      onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-orange-50 hover:text-orange-600"
                      aria-label="Toggle Shops menu"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${shopsMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {user?.role === 'student' && shopsMenuOpen && (
                  <div className="absolute left-0 top-full z-50 w-48 pt-3">
                    <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
                      <NavLink
                        to="/favorites"
                        onClick={closeMenus}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                          }`
                        }
                      >
                        <Star size={16} />
                        My Favorites
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
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-2">
                <UserCircle size={19} className="text-orange-500" />
                <span className="max-w-28 truncate text-sm font-semibold text-gray-700">
                  {user.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl bg-orange-50 p-2.5 text-gray-700 transition hover:bg-orange-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              link.to === '/shops' ? (
                <div key={link.to}>
                  <div className="flex items-center justify-between">
                    <NavLink
                      to="/shops"
                      onClick={closeMenus}
                      className={linkStyle}
                    >
                      Shops
                    </NavLink>

                    {user?.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-orange-50"
                        aria-label="Toggle Shops menu"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${shopsMenuOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {user?.role === 'student' && shopsMenuOpen && (
                    <NavLink
                      to="/favorites"
                      onClick={closeMenus}
                      className="ml-5 mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Star size={16} />
                      My Favorites
                    </NavLink>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeMenus}
                  className={linkStyle}
                >
                  {link.label}
                </NavLink>
              )
            ))}

            <div className="mt-3 border-t border-gray-100 pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
                    <UserCircle size={21} className="text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
