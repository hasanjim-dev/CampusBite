
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
  Sparkles,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  ChevronRight,
} from 'lucide-react'
import api from '../api/axios'

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-7 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Icon size={21} />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  name,
  type = 'text',
  disabled = false,
  placeholder,
  helper,
  maxLength,
  autoComplete,
  minLength,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          minLength={minLength}
          className={`w-full rounded-xl border py-3.5 text-sm text-gray-800 outline-none transition-all ${
            Icon ? 'pl-11' : 'px-4'
          } ${
            disabled
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-500'
              : 'border-gray-200 bg-white hover:border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100/70'
          }`}
        />
      </div>

      {helper && (
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          {helper}
        </p>
      )}
    </div>
  )
}

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

  const formattedRole = profile.role
    ? profile.role
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'CampusBite User'

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
          <LoaderCircle
            size={30}
            className="animate-spin text-orange-500"
          />
        </div>
        <p className="mt-5 text-sm font-semibold text-gray-700">
          Loading your profile
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Please wait a moment...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <button
        onClick={() => navigate(-1)}
        className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
      >
        <ArrowLeft
          size={17}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back
      </button>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">
            <Sparkles size={13} />
            Account Settings
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            My Profile<span className="text-orange-500">.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Manage your personal information and keep your CampusBite
            account up to date.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 sm:flex">
          <CheckCircle2 size={17} />
          Account Settings
        </div>
      </div>

      <div className="relative mb-7 overflow-hidden rounded-3xl border border-orange-100/70 bg-white shadow-sm">
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 sm:h-48">
          <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full border-[30px] border-white/10" />
          <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-white/10 blur-xl" />

          <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:flex">
            <ShieldCheck size={15} />
            CampusBite Member
          </div>
        </div>

        <div className="px-5 pb-7 sm:px-9">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border-[5px] border-white bg-orange-50 shadow-lg sm:h-32 sm:w-32">
                <User size={52} className="text-orange-400" />

                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="absolute inset-0 h-full w-full rounded-[23px] object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border-[3px] border-white bg-green-500 text-white shadow-sm">
                <CheckCircle2 size={15} />
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-gray-900/10 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-200"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              {profile.name || 'CampusBite User'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {profile.email}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-orange-700">
                <ShieldCheck size={14} />
                {formattedRole}
              </span>

              {profile.status && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-bold capitalize text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {profile.status}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-600">
                <CalendarDays size={14} />
                Joined {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-7">
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <SectionTitle
            icon={User}
            title="Personal Information"
            description="Your basic account details and personal information."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full Name"
              icon={User}
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editing}
              maxLength={100}
              placeholder="Enter your full name"
            />

            <FormField
              label="Email Address"
              icon={Mail}
              value={profile.email}
              disabled
              helper="Your registered email address cannot be changed."
            />

            {editing && (
              <div className="sm:col-span-2">
                <FormField
                  label="Profile Image URL"
                  icon={Camera}
                  name="avatar_url"
                  type="url"
                  value={profile.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/profile.jpg"
                  helper="Enter a publicly accessible image URL."
                />
              </div>
            )}

            <FormField
              label="Account ID"
              icon={Fingerprint}
              value={String(profile.id)}
              disabled
            />

            <FormField
              label="Account Role"
              icon={ShieldCheck}
              value={formattedRole}
              disabled
            />
          </div>

          {editing && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                <Sparkles size={17} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Editing your profile
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Update your name or profile image URL. Your email
                  address and account role cannot be edited here.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SectionTitle
                icon={Lock}
                title="Password & Security"
                description="Protect your account with a strong password."
              />

              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 sm:flex">
                <ShieldCheck size={23} />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                  <KeyRound size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Account Password
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Change your password to keep your account secure.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowPasswordForm((current) => !current)
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
              >
                <Lock size={16} />
                {showPasswordForm ? 'Close Form' : 'Change Password'}
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    showPasswordForm ? 'rotate-90' : ''
                  }`}
                />
              </button>
            </div>

            {showPasswordForm && (
              <form
                onSubmit={handleChangePassword}
                className="mt-6 space-y-5 rounded-2xl border border-orange-100 bg-orange-50/30 p-4 sm:p-6"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Update Your Password
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your current password and choose a new one.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField
                      label="Current Password"
                      icon={Lock}
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                    />
                  </div>

                  <FormField
                    label="New Password"
                    icon={KeyRound}
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />

                  <FormField
                    label="Confirm New Password"
                    icon={ShieldCheck}
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}
                    {changingPassword
                      ? 'Updating...'
                      : 'Update Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                    }}
                    disabled={changingPassword}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-start gap-2 border-t border-orange-100 pt-4">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  <p className="text-xs leading-relaxed text-gray-500">
                    After changing your password, the backend asks you
                    to log in again.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} />
        Your account information is managed securely by CampusBite.
      </div>
    </div>
  )
}
