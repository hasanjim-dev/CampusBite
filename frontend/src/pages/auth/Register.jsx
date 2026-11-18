
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    if (form.password.length < (role === 'shop_owner' ? 8 : 6)) {
      return toast.error(
        role === 'shop_owner'
          ? 'Shop Owner password must be at least 8 characters'
          : 'Password must be at least 6 characters'
      )
    }

    if (
      role === 'shop_owner' &&
      new TextEncoder().encode(form.password).length > 72
    ) {
      return toast.error('Password cannot exceed 72 bytes')
    }

    setLoading(true)

    try {
      const endpoint =
        role === 'shop_owner'
          ? '/auth/register-shop-owner'
          : '/auth/register'

      await api.post(endpoint, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      toast.success(
        role === 'shop_owner'
          ? 'Shop Owner account created successfully!'
          : 'Student account created successfully!'
      )

      navigate('/login')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full border rounded-lg px-3 py-2'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Create account
        </h1>

        {/* Account type selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Register as
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 rounded-lg border ${
                role === 'student'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setRole('shop_owner')}
              className={`py-2 rounded-lg border ${
                role === 'shop_owner'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Shop Owner
            </button>
          </div>
        </div>

        <input
          type="text"
          required
          maxLength={100}
          placeholder="Full name"
          value={form.name}
          className={field}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          required
          maxLength={150}
          placeholder="Email"
          value={form.email}
          className={field}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          required
          minLength={role === 'shop_owner' ? 8 : 6}
          placeholder="Password"
          value={form.password}
          className={field}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <p className="text-xs text-gray-500">
          {role === 'shop_owner'
            ? 'Shop Owner password must contain at least 8 characters.'
            : 'Password must contain at least 6 characters.'}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading
            ? 'Creating...'
            : `Register as ${role === 'shop_owner' ? 'Shop Owner' : 'Student'}`}
        </button>

        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
