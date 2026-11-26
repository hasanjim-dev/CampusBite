
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
  Star,
  Sparkles,
  Heart,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

function ShopCard({
  shop,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  canFavorite,
}) {
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-950/5">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50">
        {shop.logo_url && !imageFailed ? (
          <img
            src={getImageUrl(shop.logo_url)}
            alt={shop.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-orange-400 shadow-sm">
              <Store size={38} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-orange-700/60">
              CampusBite Shop
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm backdrop-blur-md">
            <Sparkles size={13} className="text-orange-500" />
            Campus Shop
          </span>
        </div>

        {canFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(shop.id)}
            disabled={favoriteLoading}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-lg backdrop-blur transition hover:scale-110 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {favoriteLoading ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Star
                size={19}
                className={
                  isFavorite
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-gray-500'
                }
              />
            )}
          </button>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="line-clamp-1 text-xl font-bold text-white drop-shadow-md">
            {shop.name}
          </h3>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="mb-5 min-h-[48px] text-sm leading-6 text-gray-500">
          {shop.description || 'Discover this campus shop on CampusBite.'}
        </p>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-start gap-3 text-sm text-gray-500">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <MapPin size={16} />
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-xs font-medium text-gray-400">Location</p>
              <p className="mt-0.5 line-clamp-1 font-medium text-gray-700">
                {shop.location || 'Location not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-gray-500">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-xs font-medium text-gray-400">Opening Hours</p>
              <p className="mt-0.5 line-clamp-1 font-medium text-gray-700">
                {shop.opening_hours || 'Opening hours not provided'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/shops/${shop.id}`)}
          className="mt-6 flex w-full items-center justify-between rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-orange-600"
        >
          <span className="flex items-center gap-2">
            Explore Shop
            <ArrowUpRight size={17} />
          </span>
          <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  )
}

function ShopSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <div className="h-56 animate-pulse bg-gray-100" />
      <div className="space-y-4 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-4/5 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  )
}

export default function Shops() {
  const { user } = useAuth()

  const [favoriteShopIds, setFavoriteShopIds] = useState(new Set())
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState(new Set())
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

  useEffect(() => {
    if (user?.role !== 'student') {
      setFavoriteShopIds(new Set())
      return
    }

    const fetchFavoriteShops = async () => {
      try {
        const response = await api.get('/favorites/shops')

        const favoriteIds = (response.data.data || []).map(
          (shop) => Number(shop.id)
        )

        setFavoriteShopIds(new Set(favoriteIds))
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          'Failed to load favorite shops.'
        )
      }
    }

    fetchFavoriteShops()
  }, [user?.role])

  const toggleFavorite = async (shopId) => {
    const id = Number(shopId)
    const isFavorite = favoriteShopIds.has(id)

    try {
      setFavoriteLoadingIds((current) =>
        new Set([...current, id])
      )

      if (isFavorite) {
        await api.delete(`/favorites/shops/${id}`)

        setFavoriteShopIds((current) => {
          const updated = new Set(current)
          updated.delete(id)
          return updated
        })

        toast.success('Shop removed from favorites.')
      } else {
        await api.post(`/favorites/shops/${id}`)

        setFavoriteShopIds((current) =>
          new Set([...current, id])
        )

        toast.success('Shop added to favorites.')
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Failed to update favorites.'
      )
    } finally {
      setFavoriteLoadingIds((current) => {
        const updated = new Set(current)
        updated.delete(id)
        return updated
      })
    }
  }

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
    <div className="space-y-10 pb-12">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-12 text-white shadow-xl shadow-orange-950/10 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950" />

        <div className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full border-[45px] border-orange-500/10" />
        <div className="absolute -bottom-40 right-1/4 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-10 top-10 -z-10 hidden h-20 w-20 rounded-full bg-amber-400/10 blur-xl sm:block" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-bold tracking-wider text-orange-300">
            <Sparkles size={15} />
            THE CAMPUS FOOD EXPERIENCE
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Find your next
            <span className="block text-orange-400">
              favorite food spot.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-300 sm:text-base sm:leading-8">
            From quick bites to delicious meals, discover campus shops,
            explore their food and find places loved by fellow students.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <Store size={16} className="text-orange-400" />
              Campus Shops
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <Heart size={16} className="text-rose-400" />
              Student Favorites
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <UtensilsCrossed size={16} className="text-amber-400" />
              Food Discovery
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 hidden h-64 w-64 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full border border-white/10 lg:flex">
          <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/10">
            <UtensilsCrossed size={76} strokeWidth={0.8} className="text-orange-400/40" />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Discover Something Delicious
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Explore Campus Shops
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Find your favorite places to eat, drink and enjoy.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5">
              <Store size={17} className="text-orange-600" />
              <span className="text-sm font-bold text-orange-700">
                {filteredShops.length} {filteredShops.length === 1 ? 'Shop' : 'Shops'}
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
            <Search size={20} className="text-gray-400" />
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by shop name, food or location..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-14 pr-14 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-orange-100 hover:text-orange-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      <section>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ShopSkeleton key={item} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <RefreshCw size={28} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Unable to load shops
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                isFavorite={favoriteShopIds.has(Number(shop.id))}
                onToggleFavorite={toggleFavorite}
                favoriteLoading={favoriteLoadingIds.has(Number(shop.id))}
                canFavorite={user?.role === 'student'}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
              {shops.length === 0 ? (
                <Store size={30} />
              ) : (
                <SlidersHorizontal size={30} />
              )}
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              {shops.length === 0 ? 'No shops available yet' : 'No shops found'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {shops.length === 0
                ? 'There are currently no active shops. Please check back later.'
                : 'We could not find any shops matching your search. Try a different keyword.'}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                <X size={16} />
                Clear Search
              </button>
            )}
          </div>
        )}
      </section>

      {!loading && !error && shops.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <UtensilsCrossed size={23} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Found your favorite spot?
                </h3>
                <p className="mt-1 max-w-lg text-sm leading-6 text-gray-600">
                  Explore a shop, check out its food and share your experience
                  with the CampusBite community.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Explore Shops
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl" />
        </section>
      )}
    </div>
  )
}
