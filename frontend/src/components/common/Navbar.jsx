import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Reviews' },
    { to: '/shops', label: 'Shops' },
    { to: '/events', label: 'Events' },
  ]
  if (user?.role === 'student') links.push({ to: '/favorites', label: 'Favorites' })
  if (user?.role === 'shop_owner') links.push({ to: '/owner', label: 'My Shop' })
  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' })

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-orange-500">CampusBite</Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-orange-500">{l.label}</Link>
          ))}
          {user ? (
            <button onClick={onLogout} className="px-3 py-1 bg-gray-800 text-white rounded">Logout</button>
          ) : (
            <Link to="/login" className="px-3 py-1 bg-orange-500 text-white rounded">Login</Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {user ? <button onClick={onLogout} className="text-left">Logout</button>
                 : <Link to="/login" onClick={() => setOpen(false)}>Login</Link>}
        </div>
      )}
    </nav>
  )
}