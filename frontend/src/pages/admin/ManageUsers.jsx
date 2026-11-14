
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
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const statusStyles = {
  active: 'bg-green-50 text-green-700',
  restricted: 'bg-orange-50 text-orange-700',
  deactivated: 'bg-red-50 text-red-600',
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton fallback="/admin" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-600">ADMINISTRATION</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Users</h1>
          <p className="text-gray-500 mt-2">
            View and manage CampusBite user accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <Users className="text-blue-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Total Users</p>
          <h2 className="text-3xl font-bold mt-1">{pagination.totalUsers}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <UserCheck className="text-green-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Active Users (loaded)</p>
          <h2 className="text-3xl font-bold mt-1">{activeCount}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <ShieldCheck className="text-orange-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Restricted (loaded)</p>
          <h2 className="text-3xl font-bold mt-1">{restrictedCount}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <UserX className="text-red-500" size={23} />
          <p className="text-sm text-gray-500 mt-3">Deactivated (loaded)</p>
          <h2 className="text-3xl font-bold mt-1">{deactivatedCount}</h2>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none"
        >
          <option value="All">All Roles</option>
          <option value="student">Student</option>
          <option value="shop_owner">Shop Owner</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-gray-900">User Directory</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredUsers.length} users shown · {pagination.totalUsers} total users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      {user.role === 'admin' && <ShieldCheck size={15} />}
                      {user.role === 'shop_owner'
                        ? 'Shop Owner'
                        : user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyles[user.status] || 'bg-gray-100 text-gray-600'}`}>
                      {formatStatus(user.status || 'unknown')}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {user.role !== 'admin' ? (
                      <div className="flex flex-wrap gap-2">
                        {user.status !== 'active' && (
                          <button
                            onClick={() => updateStatus(user, 'active')}
                            disabled={updatingId === user.id}
                            title="Activate user"
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}

                        {user.status !== 'restricted' && (
                          <button
                            onClick={() => updateStatus(user, 'restricted')}
                            disabled={updatingId === user.id}
                            title="Restrict user"
                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                          >
                            <ShieldCheck size={17} />
                          </button>
                        )}

                        {user.status !== 'deactivated' && (
                          <button
                            onClick={() => updateStatus(user, 'deactivated')}
                            disabled={updatingId === user.id}
                            title="Deactivate user"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            <UserX size={17} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Protected</span>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t text-sm text-gray-500">
          Page {pagination.currentPage} of {pagination.totalPages}
          {pagination.totalUsers > 100 && (
            <span> · Showing first 100 users</span>
          )}
        </div>
      </div>
    </div>
  )
}
