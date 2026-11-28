
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
  ShieldCheck,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: null,
    shops: null,
    reviews: null,
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

      const [usersResponse, shopsResponse, reviewsResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/users?page=1&limit=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/shops`),
        axios.get(`${API_URL}/reviews?page=1&limit=1`),
      ])

      setStats({
        users: usersResponse.data.pagination?.totalUsers ?? 0,
        shops: shopsResponse.data.total ?? shopsResponse.data.shops?.length ?? 0,
        reviews: reviewsResponse.data.pagination?.total ?? 0,
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
      description: 'Registered platform members',
      icon: Users,
      theme: 'blue',
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      glow: 'from-blue-500/10',
    },
    {
      label: 'Registered Shops',
      value: stats.shops,
      description: 'Food shops on CampusBite',
      icon: Store,
      theme: 'orange',
      bg: 'bg-orange-50',
      color: 'text-orange-600',
      glow: 'from-orange-500/10',
    },
    {
      label: 'Total Reviews',
      value: stats.reviews,
      description: 'Community feedback received',
      icon: MessageSquare,
      theme: 'green',
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      glow: 'from-emerald-500/10',
    },
    {
      label: 'Active Events',
      value: '—',
      description: 'Event statistics unavailable',
      icon: CalendarDays,
      theme: 'purple',
      bg: 'bg-purple-50',
      color: 'text-purple-600',
      glow: 'from-purple-500/10',
      unavailable: true,
    },
  ]

  const monitoring = [
    { label: 'User Management API', connected: true, detail: 'User records accessible' },
    { label: 'Shop Management API', connected: true, detail: 'Shop directory accessible' },
    { label: 'Review Statistics API', connected: false, detail: 'Statistics integration pending' },
    { label: 'Event Statistics API', connected: false, detail: 'Statistics integration pending' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-10">
      <BackButton fallback="/" />

      <section className="relative overflow-hidden rounded-[28px] bg-[#20251f] text-white shadow-xl">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-7 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-[0.16em] text-orange-300">
              <ShieldCheck size={15} />
              ADMINISTRATION CENTER
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Dashboard <span className="text-orange-400">Overview.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
              Manage your CampusBite community, monitor platform activity and
              keep everything running smoothly from one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Admin workspace
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Activity size={14} className="text-orange-300" />
                Platform insights
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh Dashboard
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3">
              <p className="text-xs text-gray-400">Dashboard status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {loading ? 'Updating data...' : error ? 'Needs attention' : 'Ready to monitor'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 bg-white/[0.04] px-7 py-3.5 text-xs text-gray-400 sm:px-9">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-orange-300" />
            CampusBite Admin Portal
          </span>
          <span>Platform overview</span>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Unable to load dashboard data</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-orange-600">
              PLATFORM STATISTICS
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
              At a glance
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Key numbers from your CampusBite platform.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500">
            <Clock size={14} />
            Live API data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.label}
                className={`group relative overflow-hidden rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${card.glow} to-transparent blur-2xl transition group-hover:scale-125`} />

                <div className="relative flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>
                    <Icon size={23} />
                  </div>

                  {card.unavailable ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1.5 text-[10px] font-bold text-gray-500">
                      NOT CONNECTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                      <TrendingUp size={12} />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="relative mt-7">
                  <p className="text-sm font-semibold text-gray-500">
                    {card.label}
                  </p>

                  <h3 className="mt-2 text-4xl font-black tracking-tight text-gray-900">
                    {loading && !card.unavailable ? (
                      <span className="inline-block h-10 w-20 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                      card.value
                    )}
                  </h3>

                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    {card.description}
                  </p>
                </div>

                <div className={`absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r ${card.glow} to-transparent transition-transform duration-300 group-hover:scale-x-100`} />
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20251f] text-orange-400">
                <Activity size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Platform Monitoring
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Service integration overview
                </p>
              </div>
            </div>

            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
              {monitoring.filter((item) => item.connected).length}/4 APIs
            </span>
          </div>

          <div className="mt-7 space-y-1">
            {monitoring.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-2xl px-3 py-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {item.connected ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${item.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.connected ? 'Available' : 'Not connected'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 p-7 text-white shadow-lg shadow-orange-500/15 lg:col-span-2">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[25px] border-white/10" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <ShieldCheck size={24} />
            </div>

            <p className="mt-7 text-xs font-bold tracking-[0.18em] text-orange-100">
              ADMIN CONTROL
            </p>

            <h2 className="mt-2 text-2xl font-black leading-tight">
              Keep your campus food community thriving.
            </h2>

            <p className="mt-4 text-sm leading-7 text-orange-50">
              Stay informed about users, shops and reviews. Use the management
              tools to keep your platform organized and reliable.
            </p>

            <div className="mt-7 flex items-center gap-2 border-t border-white/20 pt-5 text-sm font-bold">
              <span>CampusBite Administration</span>
              <ArrowUpRight size={17} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white/80 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-600" />
          Secure administrator workspace
        </span>
        <span>Some statistics are not yet connected to the backend.</span>
      </div>
    </div>
  )
}
