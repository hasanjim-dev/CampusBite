import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Account created. Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full border rounded-lg px-3 py-2'
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <input required placeholder="Full name" value={form.name} className={field}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" required placeholder="Email" value={form.email} className={field}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required placeholder="Password" value={form.password} className={field}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="w-full bg-orange-500 text-white py-2 rounded-lg disabled:opacity-60">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="text-sm text-center">
          Already have an account? <Link to="/login" className="text-orange-500">Login</Link>
        </p>
      </form>
    </div>
  )
}