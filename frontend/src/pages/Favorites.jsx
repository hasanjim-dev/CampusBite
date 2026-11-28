
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Search,
  MapPin,
  Star,
  Store,
  Utensils,
  Trash2,
  LoaderCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  X,
  Bookmark,
  Package,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

function FavoriteImage({ item }) {
  const [imageFailed, setImageFailed] = useState(false)

  const imageUrl = getImageUrl(item.image)
  const Icon = item.type === 'shop' ? Store : Utensils

  return (
    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={item.name}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-white/80 text-orange-400 shadow-sm">
            <Icon size={43} strokeWidth={1.5} />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-700 shadow-sm backdrop-blur">
        {item.type === 'shop' ? (
          <Store size={12} />
        ) : (
          <Utensils size={12} />
        )}
        {item.type === 'shop' ? 'Shop' : 'Food'}
      </span>

      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-500 shadow-sm">
        <Heart size={13} className="fill-red-500" />
        Saved
      </div>
    </div>
  )
}

function FavoriteCard({ item, removing, onRemove, onView }) {
  const key = `${item.type}-${item.id}`

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-100/40">
      <div className="relative">
        <FavoriteImage item={item} />

        <button
          onClick={() => onRemove(item)}
          disabled={removing === key}
          title="Remove from favorites"
          aria-label={`Remove ${item.name} from favorites`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/95 text-red-500 shadow-sm transition hover:scale-105 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing === key ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Trash2 size={17} />
          )}
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold tracking-tight text-gray-900 transition group-hover:text-orange-600">
              {item.name}
            </h3>

            {item.type === 'shop' ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={14} className="shrink-0 text-orange-500" />
                <span className="truncate">
                  {item.location || 'Location not available'}
                </span>
              </p>
            ) : (
              <p className="mt-2 truncate text-xs font-medium text-gray-500">
                From <span className="text-orange-600">{item.shop}</span>
              </p>
            )}
          </div>

          {Number(item.rating) > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-gray-800">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400"
              />
              {Number(item.rating).toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-4 min-h-[42px] text-sm leading-relaxed text-gray-500">
          {item.description || 'No description available.'}
        </p>

        {item.type === 'food' && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Price
              </p>
              <p className="mt-1 text-xl font-black text-gray-900">
                ৳{Number(item.price || 0).toFixed(2)}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                item.isAvailable
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        )}

        {item.type === 'shop' && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-400">
              Saved to your favorite shops
            </p>
          </div>
        )}

        <button
          onClick={() => onView(item)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-orange-500"
        >
          {item.type === 'shop' ? 'View Shop' : 'View Food Shop'}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </article>
  )
}

function FavoriteSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white"
        >
          <div className="h-52 animate-pulse bg-gray-100" />
          <div className="space-y-4 p-6">
            <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-11 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyFavorites({ search, onExplore, onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-orange-50 text-orange-400">
        {search ? (
          <Search size={34} />
        ) : (
          <ShoppingBag size={34} />
        )}
      </div>

      <h3 className="mt-6 text-xl font-extrabold tracking-tight text-gray-900">
        {search ? 'No matching favorites' : 'Your favorites are waiting'}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
        {search
          ? 'We could not find anything matching your search. Try another keyword.'
          : 'Save your favorite shops and delicious food items to find them easily whenever you need.'}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {search && (
          <button
            onClick={onReset}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Clear Search
          </button>
        )}

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600"
        >
          Explore Shops
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default function Favorites() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)

      const [shopsResponse, foodResponse] = await Promise.all([
        api.get('/favorites/shops'),
        api.get('/favorites/food-items'),
      ])

      const shops = (shopsResponse.data.data || []).map((shop) => ({
        id: shop.id,
        type: 'shop',
        name: shop.name,
        description: shop.description,
        location: shop.location,
        rating: shop.overall_rating,
        image: shop.logo_url,
      }))

      const foods = (foodResponse.data.data || []).map((food) => ({
        id: food.id,
        type: 'food',
        name: food.name,
        shop: food.shop_name,
        shopId: food.shop_id,
        description: food.description,
        rating: food.avg_rating,
        image: food.image_url,
        price: food.final_price ?? food.price,
        isAvailable: Boolean(food.is_available),
      }))

      setFavorites([...shops, ...foods])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load favorites.'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const matchesTab =
        activeTab === 'all' || item.type === activeTab

      const keyword = search.trim().toLowerCase()

      const matchesSearch =
        item.name?.toLowerCase().includes(keyword) ||
        item.shop?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)

      return matchesTab && matchesSearch
    })
  }, [favorites, activeTab, search])

  const counts = useMemo(
    () => ({
      all: favorites.length,
      shop: favorites.filter((item) => item.type === 'shop').length,
      food: favorites.filter((item) => item.type === 'food').length,
    }),
    [favorites]
  )

  const removeFavorite = async (item) => {
    const key = `${item.type}-${item.id}`

    try {
      setRemoving(key)

      if (item.type === 'shop') {
        await api.delete(`/favorites/shops/${item.id}`)
      } else {
        await api.delete(`/favorites/food-items/${item.id}`)
      }

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            !(favorite.type === item.type && favorite.id === item.id)
        )
      )

      toast.success('Removed from favorites.')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to remove favorite.'
      )
    } finally {
      setRemoving(null)
    }
  }

  const handleView = (item) => {
    navigate(
      item.type === 'shop'
        ? `/shops/${item.id}`
        : `/shops/${item.shopId}`
    )
  }

  const tabs = [
    { id: 'all', label: 'All Favorites', icon: Heart },
    { id: 'shop', label: 'Shops', icon: Store },
    { id: 'food', label: 'Food Items', icon: Utensils },
  ]

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 px-6 py-9 shadow-xl shadow-gray-900/10 sm:px-9 sm:py-11">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />
        <div className="absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-200">
              <Sparkles size={13} />
              Your Personal Collection
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              My Favorites<span className="text-orange-400">.</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
              All the shops and delicious food you love, saved in one
              place. Find your next favorite anytime.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2">
                <Heart size={15} className="fill-orange-400 text-orange-400" />
                {counts.all} Saved Items
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2">
                <Store size={15} />
                {counts.shop} Shops
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2">
                <Utensils size={15} />
                {counts.food} Food Items
              </span>
            </div>
          </div>

          <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[36px] border border-white/10 bg-white/[0.07] text-orange-300 shadow-2xl backdrop-blur sm:flex">
            <Heart size={68} strokeWidth={1.3} className="fill-orange-400/20" />
          </div>
        </div>
      </section>

      <section className="mb-7 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops, food items, locations..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100/70"
          />

          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  selected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon
                  size={16}
                  className={selected && tab.id === 'all' ? 'fill-white' : ''}
                />
                {tab.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                    selected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
            {activeTab === 'all'
              ? 'Your Saved Collection'
              : activeTab === 'shop'
                ? 'Favorite Shops'
                : 'Favorite Food Items'}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {loading
              ? 'Getting your saved items...'
              : `${filteredFavorites.length} ${
                  filteredFavorites.length === 1 ? 'item' : 'items'
                } found`}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Bookmark size={15} />
          Saved by you
        </div>
      </div>

      {loading ? (
        <FavoriteSkeleton />
      ) : filteredFavorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((item) => {
            const key = `${item.type}-${item.id}`

            return (
              <FavoriteCard
                key={key}
                item={item}
                removing={removing}
                onRemove={removeFavorite}
                onView={handleView}
              />
            )
          })}
        </div>
      ) : (
        <EmptyFavorites
          search={search}
          onExplore={() => navigate('/shops')}
          onReset={() => {
            setSearch('')
            setActiveTab('all')
          }}
        />
      )}

      {!loading && favorites.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
              <Package size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                Looking for something new?
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Discover more shops and food around your campus.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/shops')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 transition hover:text-orange-700"
          >
            Explore Shops
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  )
}
