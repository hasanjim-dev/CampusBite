
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Users,
  Store,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: null,
    shops: null,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Admin authentication token not found.')
      }

      const [usersResponse, shopsResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/users?page=1&limit=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/shops`),
      ])

      setStats({
        users: usersResponse.data.pagination?.totalUsers ?? 0,
        shops: shopsResponse.data.total ?? shopsResponse.data.shops?.length ?? 0,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not load dashboard data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const cards = [
    {
      label: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Registered Shops',
      value: stats.shops,
      icon: Store,
      color: 'orange',
    },
    {
      label: 'Total Reviews',
      value: '—',
      icon: MessageSquare,
      color: 'green',
      unavailable: true,
    },
    {
      label: 'Active Events',
      value: '—',
      icon: CalendarDays,
      color: 'purple',
      unavailable: true,
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <BackButton fallback="/" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            ADMINISTRATION
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor and manage your CampusBite platform.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className={`p-3 rounded-xl ${colorClasses[card.color]}`}>
                  <Icon size={23} />
                </div>

                {card.unavailable ? (
                  <span className="text-xs text-gray-400 font-medium">
                    Not connected
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Live data
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-5">{card.label}</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {loading && !card.unavailable ? (
                  <span className="inline-block w-12 h-8 bg-gray-100 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </h2>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Clock size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Platform Monitoring
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Current platform data availability
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {[
              { label: 'User Management API', connected: true },
              { label: 'Shop Management API', connected: true },
              { label: 'Review Statistics API', connected: false },
              { label: 'Event Statistics API', connected: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center gap-3"
              >
                <span className="text-sm text-gray-700">{item.label}</span>

                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    item.connected
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.connected ? 'Available' : 'Not connected'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-6">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <TrendingUp size={25} />
          </div>

          <h2 className="text-xl font-bold mt-6">
            CampusBite Insights
          </h2>

          <p className="text-sm text-gray-300 mt-2 leading-6">
            Manage students, monitor shop registrations and maintain a healthy
            campus food community.
          </p>

          <div className="border-t border-white/15 mt-7 pt-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Dashboard status</span>
              <span className="text-green-400 font-semibold">
                {error ? 'Connection issue' : loading ? 'Loading' : 'Ready'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Live data sources</span>
              <span className="font-bold">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
