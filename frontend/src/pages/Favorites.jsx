
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
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

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

      const keyword = search.toLowerCase()

      const matchesSearch =
        item.name?.toLowerCase().includes(keyword) ||
        item.shop?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword)

      return matchesTab && matchesSearch
    })
  }, [favorites, activeTab, search])

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

  const tabs = [
    { id: 'all', label: 'All Favorites', icon: Heart },
    { id: 'shop', label: 'Shops', icon: Store },
    { id: 'food', label: 'Food Items', icon: Utensils },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-3">
            <Heart className="fill-red-500 text-red-500" size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Favorites
            </h1>
            <p className="mt-1 text-gray-500">
              Your favorite shops and food items in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your favorites..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="mb-7 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          Saved Items
        </h2>

        <span className="text-sm text-gray-500">
          {filteredFavorites.length} items
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20">
          <LoaderCircle className="animate-spin text-orange-500" size={38} />
          <p className="mt-4 text-gray-500">Loading your favorites...</p>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((item) => {
            const key = `${item.type}-${item.id}`

            return (
              <div
                key={key}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-orange-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-orange-300">
                      {item.type === 'shop' ? (
                        <Store size={55} />
                      ) : (
                        <Utensils size={55} />
                      )}
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                    {item.type === 'shop' ? 'Shop' : 'Food'}
                  </span>

                  <button
                    onClick={() => removeFavorite(item)}
                    disabled={removing === key}
                    title="Remove from favorites"
                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {removing === key ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>

                    {Number(item.rating) > 0 && (
                      <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-700">
                        <Star
                          size={15}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {Number(item.rating).toFixed(1)}
                      </div>
                    )}
                  </div>

                  {item.type === 'shop' ? (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin size={15} />
                      {item.location || 'Location not available'}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-orange-600">
                        From {item.shop}
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        ৳{Number(item.price || 0).toFixed(2)}
                      </p>
                      {!item.isAvailable && (
                        <span className="mt-1 inline-block text-xs font-medium text-red-500">
                          Currently unavailable
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">
                    {item.description || 'No description available.'}
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        item.type === 'shop'
                          ? `/shops/${item.id}`
                          : `/shops/${item.shopId}`
                      )
                    }
                    className="mt-5 w-full rounded-lg border border-orange-500 py-2.5 font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                  >
                    {item.type === 'shop' ? 'View Shop' : 'View Food Shop'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <ShoppingBag size={45} className="mx-auto text-gray-300" />

          <h3 className="mt-4 text-xl font-bold text-gray-800">
            No Favorites Found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            {search
              ? 'No items match your search. Try another keyword.'
              : 'You have not saved anything in this category yet.'}
          </p>

          <button
            onClick={() => {
              setSearch('')
              setActiveTab('all')
              navigate('/shops')
            }}
            className="mt-6 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Explore Shops
          </button>
        </div>
      )}
    </div>
  )
}
