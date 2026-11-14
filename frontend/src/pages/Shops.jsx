
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  ArrowUpRight,
  SlidersHorizontal,
  UtensilsCrossed,
  Clock,
  X,
  Store,
  RefreshCw,
} from 'lucide-react'
import api from '../api/axios'

function ShopCard({ shop }) {
  const navigate = useNavigate()

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        {shop.logo_url ? (
          <img
            src={shop.logo_url}
            alt={shop.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Store size={64} className="text-orange-300" />
        )}

        <span className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow">
          Campus Shop
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {shop.name}
        </h3>

        <p className="mb-4 min-h-10 text-sm leading-5 text-gray-500">
          {shop.description || 'Discover this campus shop on CampusBite.'}
        </p>

        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <MapPin size={14} className="shrink-0" />
          <span>{shop.location || 'Location not provided'}</span>
        </div>

        <div className="mb-5 flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} className="shrink-0" />
          <span>{shop.opening_hours || 'Opening hours not provided'}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/shops/${shop.id}`)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
        >
          View Details
          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  )
}

export default function Shops() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/shops')

        if (response.data.success) {
          setShops(response.data.shops || [])
        } else {
          setError(response.data.message || 'Failed to load shops.')
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load shops. Please check your connection.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  const filteredShops = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    return shops.filter((shop) => {
      return (
        shop.name?.toLowerCase().includes(keyword) ||
        shop.description?.toLowerCase().includes(keyword) ||
        shop.location?.toLowerCase().includes(keyword)
      )
    })
  }, [shops, search])

  return (
    <div className="pb-12">
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gray-900 px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/95 to-orange-950/70" />

        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-300">
            EXPLORE CAMPUSBITE
          </span>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            Discover the Best
            <span className="text-orange-400"> Campus Shops</span>
          </h1>

          <p className="mb-7 max-w-lg text-sm leading-6 text-gray-300 sm:text-base">
            Find your favorite campus food spots, explore shops and discover
            places recommended by students.
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={17} className="text-orange-400" />
            Explore shops around your campus
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops or locations..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Explore Shops
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Discover places to eat, drink and enjoy.
            </p>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
              {filteredShops.length} Shops
            </span>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-orange-500" />
            <p className="text-sm text-gray-500">Loading shops...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 font-semibold text-orange-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <SlidersHorizontal size={36} className="mx-auto mb-3 text-gray-300" />

            <h3 className="text-lg font-bold text-gray-800">
              {shops.length === 0 ? 'No shops available' : 'No shops found'}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {shops.length === 0
                ? 'There are currently no active shops.'
                : 'Try another search keyword.'}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 font-semibold text-orange-600 hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
