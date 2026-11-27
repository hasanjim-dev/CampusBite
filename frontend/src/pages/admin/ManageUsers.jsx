
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Filter,
  Shield,
  X,
  SlidersHorizontal,
  Mail,
  CalendarDays,
  Activity,
  Sparkles,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  restricted: 'bg-orange-50 text-orange-700 border-orange-100',
  deactivated: 'bg-red-50 text-red-600 border-red-100',
}

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
  })

  const fetchUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      const response = await axios.get(
        `${API_URL}/admin/users?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUsers(response.data.users || [])
      setPagination(response.data.pagination || {
        totalUsers: 0,
        currentPage: 1,
        totalPages: 1,
      })
    } catch (err) {
      const message =
        err.response?.data?.message || 'Could not load users.'

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateStatus = async (user, nextStatus) => {
    const actionText = {
      active: 'activate',
      restricted: 'restrict',
      deactivated: 'deactivate',
    }

    if (!window.confirm(`Are you sure you want to ${actionText[nextStatus]} ${user.name}?`)) {
      return
    }

    setUpdatingId(user.id)

    try {
      const token = localStorage.getItem('token')

      const response = await axios.patch(
        `${API_URL}/admin/users/${user.id}/status`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUsers(currentUsers =>
        currentUsers.map(item =>
          item.id === user.id
            ? { ...item, status: nextStatus }
            : item
        )
      )

      toast.success(response.data.message || 'User status updated.')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not update user status.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.name} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesRole =
      roleFilter === 'All' || user.role === roleFilter

    const matchesStatus =
      statusFilter === 'All' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const activeCount = users.filter(user => user.status === 'active').length
  const restrictedCount = users.filter(user => user.status === 'restricted').length
  const deactivatedCount = users.filter(user => user.status === 'deactivated').length

  const formatStatus = status =>
    status.charAt(0).toUpperCase() + status.slice(1)

  const roleLabel = role =>
    role === 'shop_owner'
      ? 'Shop Owner'
      : role?.charAt(0).toUpperCase() + role?.slice(1)

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('All')
    setStatusFilter('All')
  }

  const hasFilters = search || roleFilter !== 'All' || statusFilter !== 'All'

  const statCards = [
    {
      label: 'Total Users',
      value: pagination.totalUsers,
      description: 'Registered accounts',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      glow: 'from-blue-500/10',
    },
    {
      label: 'Active Users',
      value: activeCount,
      description: 'Active loaded accounts',
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      glow: 'from-emerald-500/10',
    },
    {
      label: 'Restricted',
      value: restrictedCount,
      description: 'Restricted loaded accounts',
      icon: ShieldCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      glow: 'from-orange-500/10',
    },
    {
      label: 'Deactivated',
      value: deactivatedCount,
      description: 'Deactivated loaded accounts',
      icon: UserX,
      color: 'text-red-600',
      bg: 'bg-red-50',
      glow: 'from-red-500/10',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-10">
      <BackButton fallback="/admin" />

      <section className="relative overflow-hidden rounded-[28px] bg-[#20251f] text-white shadow-xl">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-[0.16em] text-orange-300">
              <ShieldCheck size={15} />
              ADMINISTRATION CENTER
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Manage <span className="text-orange-400">Users.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
              Manage accounts, monitor user activity and maintain a safe
              CampusBite community from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Users size={14} className="text-orange-300" />
                User directory
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Shield size={14} className="text-emerald-300" />
                Account protection
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh Users
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3">
              <p className="text-xs text-gray-400">Total registered</p>
              <p className="mt-1 text-xl font-black text-white">
                {loading ? '...' : pagination.totalUsers.toLocaleString()}
                <span className="ml-2 text-xs font-medium text-gray-400">users</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 bg-white/[0.04] px-7 py-3.5 text-xs text-gray-400 sm:px-9">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-orange-300" />
            CampusBite Admin Portal
          </span>
          <span>Account management</span>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Unable to load users</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      <section>
        <div className="mb-5">
          <p className="text-xs font-bold tracking-[0.18em] text-orange-600">
            ACCOUNT OVERVIEW
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
            User statistics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A quick overview of account statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(card => {
            const Icon = card.icon

            return (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${card.glow} to-transparent blur-2xl transition group-hover:scale-125`} />

                <div className="relative flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>
                    <Icon size={23} />
                  </div>
                  <Activity size={17} className="text-gray-300" />
                </div>

                <div className="relative mt-7">
                  <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                  <h3 className="mt-2 text-4xl font-black tracking-tight text-gray-900">
                    {loading ? (
                      <span className="inline-block h-10 w-16 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </h3>
                  <p className="mt-3 text-xs text-gray-400">{card.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Status counts reflect the first 100 loaded users. Total Users uses the API total.
        </p>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20251f] text-orange-400">
                  <SlidersHorizontal size={19} />
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  Find users
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Search and filter accounts by name, email, role or status.
              </p>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_210px_210px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="All">All Roles</option>
                <option value="student">Student</option>
                <option value="shop_owner">Shop Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="relative">
              <Activity
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="restricted">Restricted</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="font-black text-gray-900">User Directory</h3>
            <p className="mt-1 text-xs text-gray-500">
              {filteredUsers.length} users shown · {pagination.totalUsers} total users
            </p>
          </div>

          <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#f7f8f6] text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <RefreshCw size={24} className="mx-auto animate-spin text-orange-500" />
                    <p className="mt-3 text-sm font-semibold text-gray-500">
                      Loading user directory...
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="transition hover:bg-orange-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="h-11 w-11 rounded-2xl border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-base font-black text-orange-600">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {user.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500">
                            <Mail size={12} className="shrink-0" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : user.role === 'shop_owner'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role === 'admin' && <ShieldCheck size={14} />}
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                        <CalendarDays size={14} />
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[user.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {formatStatus(user.status || 'unknown')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user.role !== 'admin' ? (
                        <div className="flex items-center gap-2">
                          {user.status !== 'active' && (
                            <button
                              onClick={() => updateStatus(user, 'active')}
                              disabled={updatingId === user.id}
                              title="Activate user"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-40"
                            >
                              <UserCheck size={17} />
                            </button>
                          )}

                          {user.status !== 'restricted' && (
                            <button
                              onClick={() => updateStatus(user, 'restricted')}
                              disabled={updatingId === user.id}
                              title="Restrict user"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100 disabled:opacity-40"
                            >
                              <ShieldCheck size={17} />
                            </button>
                          )}

                          {user.status !== 'deactivated' && (
                            <button
                              onClick={() => updateStatus(user, 'deactivated')}
                              disabled={updatingId === user.id}
                              title="Deactivate user"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                            >
                              <UserX size={17} />
                            </button>
                          )}

                          {updatingId === user.id && (
                            <RefreshCw size={15} className="animate-spin text-orange-500" />
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-600">
                          <Shield size={13} />
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <Users size={25} />
                    </div>
                    <p className="mt-4 font-bold text-gray-700">
                      No users found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or filters.
                    </p>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          {pagination.totalUsers > 100 && (
            <span>Showing first 100 users</span>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white/80 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-600" />
          Secure administrator workspace
        </span>
        <span>Administrator accounts are protected from status changes.</span>
      </div>
    </div>
  )
}
