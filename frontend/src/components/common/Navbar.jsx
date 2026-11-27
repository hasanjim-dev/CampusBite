
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  UtensilsCrossed,
  UserCircle,
  Home,
  Store,
  CalendarDays,
  MessageSquareWarning,
  Bell,
  UserRound,
  LayoutDashboard,
  Settings,
  Users,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const publicLinks = [
  { to: '/', label: 'Reviews', icon: Home },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/events', label: 'Events', icon: CalendarDays },
]

const roleLinks = {
  student: [
    { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Profile', icon: UserRound },
  ],
  shop_owner: [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/shop', label: 'Manage Shop', icon: Store },
    { to: '/owner/menu', label: 'Manage Menu', icon: Settings },
    { to: '/owner/complaints', label: 'Complaints', icon: MessageSquareWarning },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/shops', label: 'Manage Shops', icon: Store },
    { to: '/admin/complaints', label: 'Complaints', icon: ShieldCheck },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopsMenuOpen, setShopsMenuOpen] = useState(false)

  const links = [
    ...(user
      ? [{ to: '/announcements', label: 'Announcements', icon: Bell }]
      : []),
    ...publicLinks,
    ...(roleLinks[user?.role] || []),
  ]

  const closeMenus = () => {
    setMobileOpen(false)
    setShopsMenuOpen(false)
  }

  const onLogout = async () => {
    await logout()
    closeMenus()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-300 ${
      isActive
        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-orange-50 text-orange-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200/70 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-orange-300">
            <UtensilsCrossed size={23} strokeWidth={2.4} />

            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-300">
              <Sparkles size={8} className="text-orange-800" />
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[23px] font-black leading-none tracking-[-1.2px] text-gray-900 transition-colors duration-200 group-hover:text-orange-600 sm:text-[25px]">
              Campus<span className="text-orange-500">Bite</span>
            </span>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-[2px] w-4 rounded-full bg-orange-500" />
              <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[1.7px] text-gray-400 sm:text-[10px]">
                Campus Food Community
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 rounded-2xl border border-gray-100 bg-gray-50/70 p-1.5 xl:flex">
          {links.map((link) => {
            const Icon = link.icon

            if (link.to === '/shops') {
              return (
                <div key={link.to} className="group relative">
                  <div className="flex items-center">
                    <NavLink to="/shops" className={navLinkClass}>
                      <Icon size={15} strokeWidth={2.2} />
                      {link.label}
                    </NavLink>

                    {user?.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                        className="ml-0.5 rounded-lg p-2 text-gray-500 transition hover:bg-orange-100 hover:text-orange-600"
                        aria-label="Toggle Shops menu"
                        aria-expanded={shopsMenuOpen}
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-300 ${
                            shopsMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {user?.role === 'student' && shopsMenuOpen && (
                    <div className="absolute left-0 top-full z-50 w-56 pt-3">
                      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
                        <NavLink
                          to="/favorites"
                          onClick={closeMenus}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                              isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                            }`
                          }
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <Heart size={17} />
                          </span>

                          <span className="flex-1">
                            <span className="block">My Favorites</span>
                            <span className="mt-0.5 block text-xs font-normal text-gray-400">
                              Your saved shops
                            </span>
                          </span>

                          <ArrowRight size={15} />
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={navLinkClass}
              >
                <Icon size={15} strokeWidth={2.2} />
                {link.label}
              </NavLink>
            )
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {user ? (
            <>
              <div className="flex max-w-40 items-center gap-2.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <UserCircle size={19} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium capitalize text-gray-400">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300"
              >
                Get Started
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-gray-700 transition-all duration-200 hover:bg-orange-100 hover:text-orange-600 xl:hidden"
          onClick={() => {
            setMobileOpen(!mobileOpen)
            setShopsMenuOpen(false)
          }}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out xl:hidden ${
          mobileOpen
            ? 'grid-rows-[1fr] border-t border-gray-100 opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-white px-4 pb-5 pt-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-1.5">

              <div className="mb-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                    <UtensilsCrossed size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      Explore CampusBite
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Discover your campus food community
                    </p>
                  </div>
                </div>
              </div>

              {links.map((link) => {
                const Icon = link.icon

                if (link.to === '/shops') {
                  return (
                    <div key={link.to}>
                      <div className="flex items-center gap-2">
                        <NavLink
                          to="/shops"
                          end
                          onClick={closeMenus}
                          className={({ isActive }) =>
                            `flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                              isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                            }`
                          }
                        >
                          <Icon size={18} />
                          Shops
                        </NavLink>

                        {user?.role === 'student' && (
                          <button
                            type="button"
                            onClick={() => setShopsMenuOpen(!shopsMenuOpen)}
                            className="rounded-xl border border-gray-100 p-3 text-gray-500 transition hover:bg-orange-50 hover:text-orange-600"
                            aria-label="Toggle Shops submenu"
                            aria-expanded={shopsMenuOpen}
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-300 ${
                                shopsMenuOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {user?.role === 'student' && shopsMenuOpen && (
                        <NavLink
                          to="/favorites"
                          onClick={closeMenus}
                          className={({ isActive }) =>
                            `ml-5 mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                              isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-orange-600'
                            }`
                          }
                        >
                          <Heart size={17} />
                          My Favorites
                        </NavLink>
                      )}
                    </div>
                  )
                }

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={closeMenus}
                    className={mobileLinkClass}
                  >
                    <Icon size={18} />
                    {link.label}
                  </NavLink>
                )
              })}

              <div className="mt-3 border-t border-gray-100 pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <UserCircle size={23} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-800">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-gray-400">
                          {user.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-red-500"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenus}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:shadow-lg"
                    >
                      Get Started
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>

              <p className="pt-3 text-center text-[10px] font-medium tracking-wide text-gray-400">
                MADE FOR YOUR CAMPUS FOOD COMMUNITY
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

