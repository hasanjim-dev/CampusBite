
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Search,
  Store,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Power,
  X,
  Building2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

export default function ManageShops() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedShop, setSelectedShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const fetchShops = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      const response = await axios.get(`${API_URL}/admin/shops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setShops(response.data.shops || [])
    } catch (err) {
      const message = err.response?.data?.message || 'Could not load shops.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const updateShopStatus = async (shop) => {
    const isActive = Number(shop.is_active ?? 1) === 1
    const action = isActive ? 'deactivate' : 'activate'

    if (!window.confirm(`Are you sure you want to ${action} ${shop.name}?`)) {
      return
    }

    setUpdatingId(shop.id)

    try {
      const token = localStorage.getItem('token')

      const response = await axios.patch(
        `${API_URL}/admin/shops/${shop.id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success(response.data.message || `Shop ${action}d successfully.`)
      await fetchShops()

      if (selectedShop?.id === shop.id) {
        setSelectedShop(null)
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Could not ${action} shop.`
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredShops = shops.filter((shop) => {
    const searchText = [
      shop.name,
      shop.location,
      shop.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchText.includes(search.toLowerCase())
    const isActive = Number(shop.is_active ?? 1) === 1

    const matchesStatus =
      filter === 'All' ||
      (filter === 'Active' && isActive) ||
      (filter === 'Inactive' && !isActive)

    return matchesSearch && matchesStatus
  })

  const activeCount = shops.filter(
    (shop) => Number(shop.is_active ?? 1) === 1
  ).length

  const inactiveCount = shops.length - activeCount

  const stats = [
    {
      label: 'Total Shops',
      value: shops.length,
      icon: Store,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      accent: 'from-orange-500 to-amber-400',
      description: 'Registered on CampusBite',
    },
    {
      label: 'Active Shops',
      value: activeCount,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      accent: 'from-emerald-500 to-green-400',
      description: 'Currently available',
    },
    {
      label: 'Inactive Shops',
      value: inactiveCount,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      accent: 'from-rose-500 to-pink-400',
      description: 'Currently deactivated',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      <BackButton fallback="/admin" />

      <section className="relative overflow-hidden rounded-[2rem] bg-[#202923] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-orange-300">
              <Sparkles size={14} />
              ADMINISTRATION
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Manage Shops
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300 sm:text-base">
              Monitor registered food shops, review their information and
              manage their availability across CampusBite.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-gray-300">Total registered</p>
              <p className="mt-1 text-2xl font-black">{shops.length}</p>
            </div>

            <button
              onClick={fetchShops}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-gray-400">All shops</p>
            <p className="mt-1 text-xl font-bold">{shops.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Active</p>
            <p className="mt-1 text-xl font-bold text-emerald-300">
              {activeCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Inactive</p>
            <p className="mt-1 text-xl font-bold text-rose-300">
              {inactiveCount}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">Unable to load shops</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchShops}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold transition hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.accent}`}
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {stat.label}
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202923]">
                    {stat.value}
                  </h2>
                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>

                <div className={`rounded-2xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#202923]">
              <SlidersHorizontal size={19} className="text-orange-500" />
              Shop Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and filter all registered shops.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-72">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shop or location..."
                className="w-full rounded-xl border border-gray-200 bg-[#fafbf9] py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-[#fafbf9] px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            >
              <option value="All">All Shops</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-[#fafbf9] px-5 py-3 sm:px-6">
          <p className="text-xs font-medium text-gray-500">
            Showing{' '}
            <span className="font-bold text-gray-800">
              {filteredShops.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-gray-800">{shops.length}</span>{' '}
            shops
          </p>

          {(search || filter !== 'All') && (
            <button
              onClick={() => {
                setSearch('')
                setFilter('All')
              }}
              className="text-xs font-bold text-orange-600 transition hover:text-orange-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex justify-between">
                <div className="h-14 w-14 rounded-xl bg-gray-100" />
                <div className="h-6 w-20 rounded-full bg-gray-100" />
              </div>
              <div className="mt-6 h-5 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
              <div className="mt-7 h-10 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Store size={30} />
          </div>
          <h3 className="mt-5 text-xl font-extrabold text-[#202923]">
            No shops found
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            {search || filter !== 'All'
              ? 'Try changing your search keyword or selected status filter.'
              : 'There are no registered shops to display right now.'}
          </p>
          {(search || filter !== 'All') && (
            <button
              onClick={() => {
                setSearch('')
                setFilter('All')
              }}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredShops.map((shop) => {
            const isActive = Number(shop.is_active ?? 1) === 1

            return (
              <article
                key={shop.id}
                className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="relative flex h-32 items-center justify-between overflow-hidden bg-gradient-to-br from-[#25352b] via-[#35483a] to-[#202923] px-5">
                  <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-orange-400/15 blur-2xl" />
                  <div className="absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl" />

                  <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm">
                    {shop.logo_url ? (
                      <img
                        src={getImageUrl(shop.logo_url)}
                        alt={shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store size={32} />
                    )}
                  </div>

                  <span
                    className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-md ${
                      isActive
                        ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100'
                        : 'border-rose-300/30 bg-rose-400/15 text-rose-100'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? 'bg-emerald-300' : 'bg-rose-300'
                      }`}
                    />
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="min-h-[105px]">
                    <h3 className="line-clamp-1 text-lg font-extrabold text-[#202923] transition group-hover:text-orange-600">
                      {shop.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} className="shrink-0 text-orange-500" />
                      <span className="line-clamp-1">
                        {shop.location || 'Location not provided'}
                      </span>
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                      {shop.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setSelectedShop(shop)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Eye size={16} />
                      Details
                    </button>

                    <button
                      onClick={() => updateShopStatus(shop)}
                      disabled={updatingId === shop.id}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {updatingId === shop.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Power size={16} />
                      )}
                      {updatingId === shop.id
                        ? 'Updating...'
                        : isActive
                          ? 'Deactivate'
                          : 'Activate'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selectedShop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111b14]/65 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedShop(null)
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-[#25352b] px-6 py-7 text-white">
              <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-orange-300">
                    SHOP INFORMATION
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Shop Details</h2>
                  <p className="mt-1 text-sm text-gray-300">
                    Registered shop profile
                  </p>
                </div>

                <button
                  onClick={() => setSelectedShop(null)}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-orange-600">
                  {selectedShop.logo_url ? (
                    <img
                      src={getImageUrl(selectedShop.logo_url)}
                      alt={selectedShop.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 size={29} />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xl font-extrabold text-[#202923]">
                    {selectedShop.name}
                  </h3>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      Number(selectedShop.is_active ?? 1) === 1
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {Number(selectedShop.is_active ?? 1) === 1
                      ? 'Active Shop'
                      : 'Inactive Shop'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-[#f7f8f5] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Location
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <MapPin size={16} className="text-orange-500" />
                    {selectedShop.location || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f8f5] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {selectedShop.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  onClick={() => setSelectedShop(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  onClick={() => updateShopStatus(selectedShop)}
                  disabled={updatingId === selectedShop.id}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
                    Number(selectedShop.is_active ?? 1) === 1
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Power size={16} />
                  {Number(selectedShop.is_active ?? 1) === 1
                    ? 'Deactivate Shop'
                    : 'Activate Shop'}
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
