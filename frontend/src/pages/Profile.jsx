
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Camera,
  Pencil,
  Save,
  X,
  ArrowLeft,
  LoaderCircle,
  Lock,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react'
import api from '../api/axios'

export default function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    status: '',
    avatar_url: '',
    created_at: '',
  })

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)

      const response = await api.get('/users/me')

      const user = response.data.user

      setProfile({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || '',
        avatar_url: user.avatar_url || '',
        created_at: user.created_at || '',
      })
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Name is required.')
      return
    }

    try {
      setSaving(true)

      const response = await api.put('/users/me', {
        name: profile.name.trim(),
        avatar_url: profile.avatar_url.trim() || null,
      })

      const user = response.data.user

      setProfile((current) => ({
        ...current,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url || '',
      }))

      setEditing(false)
      toast.success('Profile updated successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    fetchProfile()
    setEditing(false)
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error('Please fill in all password fields.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }

    try {
      setChangingPassword(true)

      const response = await api.put(
        '/users/change-password',
        passwordForm
      )

      toast.success(
        response.data.message || 'Password changed successfully.'
      )

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setShowPasswordForm(false)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to change password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return 'Not available'

    return parsedDate.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center">
        <LoaderCircle
          size={40}
          className="animate-spin text-orange-500"
        />
        <p className="mt-4 text-gray-500">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="mt-2 text-gray-500">
          View and manage your CampusBite account information.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-orange-400 to-orange-600 sm:h-44" />

        <div className="px-6 pb-8 sm:px-9">
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-5">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow-sm">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <User size={55} className="text-orange-400" />
              )}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-gray-500">
              {profile.role
                ? profile.role.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
                : 'CampusBite User'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-600">
                <ShieldCheck size={15} />
                {profile.status}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-600">
                <CalendarDays size={15} />
                Joined {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <h2 className="text-xl font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your account information.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                maxLength={100}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-default"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed.
            </p>
          </div>

          {editing && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Profile Image URL
              </label>

              <div className="relative">
                <Camera
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  name="avatar_url"
                  value={profile.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/profile.jpg"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Enter a publicly accessible image URL.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Account ID
            </label>

            <input
              type="text"
              value={profile.id}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Account Role
            </label>

            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Keep your account secure with a strong password.
            </p>
          </div>

          <button
            onClick={() => setShowPasswordForm((current) => !current)}
            className="flex items-center gap-2 rounded-lg border border-orange-500 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            <Lock size={17} />
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {changingPassword && (
                <LoaderCircle size={17} className="animate-spin" />
              )}
              Update Password
            </button>

            <p className="text-xs text-gray-500">
              After changing your password, the backend asks you to log in again.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
