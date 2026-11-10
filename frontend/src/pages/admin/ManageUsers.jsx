import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Search,
  Users,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const initialUsers = [
  { id: 1, name: 'Rahim Ahmed', email: 'rahim@example.com', role: 'student', status: 'Active' },
  { id: 2, name: 'Nusrat Jahan', email: 'nusrat@example.com', role: 'student', status: 'Active' },
  { id: 3, name: 'Karim Hasan', email: 'karim@example.com', role: 'shop_owner', status: 'Active' },
  { id: 4, name: 'Sadia Islam', email: 'sadia@example.com', role: 'student', status: 'Blocked' },
  { id: 5, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'Active' },
]

export default function ManageUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.name} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id !== id) return user

      const nextStatus = user.status === 'Active' ? 'Blocked' : 'Active'

      toast.success(`User ${nextStatus.toLowerCase()} successfully`)

      return { ...user, status: nextStatus }
    }))
  }

  const deleteUser = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    setUsers(users.filter(user => user.id !== id))
    toast.success('User removed from demo list')
  }

  const activeCount = users.filter(user => user.status === 'Active').length
  const blockedCount = users.filter(user => user.status === 'Blocked').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton fallback="/admin" />

      <div>
        <p className="text-sm font-semibold text-orange-600">ADMINISTRATION</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Users</h1>
        <p className="text-gray-500 mt-2">
          View and manage CampusBite user accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <Users className="text-blue-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Total Users</p>
          <h2 className="text-3xl font-bold mt-1">{users.length}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <UserCheck className="text-green-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Active Users</p>
          <h2 className="text-3xl font-bold mt-1">{activeCount}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <UserX className="text-red-500" size={23} />
          <p className="text-sm text-gray-500 mt-3">Blocked Users</p>
          <h2 className="text-3xl font-bold mt-1">{blockedCount}</h2>
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
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-gray-900">User Directory</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredUsers.length} users found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      {user.role === 'admin' && <ShieldCheck size={15} />}

                      {user.role === 'shop_owner'
                        ? 'Shop Owner'
                        : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        user.status === 'Active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => toggleStatus(user.id)}
                            title={user.status === 'Active' ? 'Block user' : 'Activate user'}
                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
                          >
                            {user.status === 'Active'
                              ? <UserX size={17} />
                              : <UserCheck size={17} />}
                          </button>

                          <button
                            onClick={() => deleteUser(user.id)}
                            title="Delete user"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}