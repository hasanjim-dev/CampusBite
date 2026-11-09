
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Search,
  MapPin,
  Star,
  Store,
  Utensils,
  Trash2,
} from 'lucide-react'

const initialFavorites = [
  {
    id: 1,
    type: 'shop',
    name: 'Food Court',
    description: 'Delicious meals and snacks for students.',
    location: 'University Campus',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  },
  {
    id: 2,
    type: 'shop',
    name: 'Campus Cafe',
    description: 'Coffee, drinks and fresh snacks.',
    location: 'Central Campus',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
  },
  {
    id: 3,
    type: 'food',
    name: 'Chicken Burger',
    shop: 'Food Court',
    description: 'Crispy chicken burger with fresh vegetables.',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  },
  {
    id: 4,
    type: 'food',
    name: 'Cold Coffee',
    shop: 'Campus Cafe',
    description: 'Refreshing chilled coffee.',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  },
]

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(initialFavorites)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const matchesTab =
        activeTab === 'all' || item.type === activeTab

      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.shop || '').toLowerCase().includes(search.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [favorites, activeTab, search])

  const removeFavorite = (id) => {
    setFavorites((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
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

      {/* Search */}
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

      {/* Tabs */}
      <div className="mb-7 flex flex-wrap gap-3">
        {[
          { id: 'all', label: 'All Favorites', icon: Heart },
          { id: 'shop', label: 'Shops', icon: Store },
          { id: 'food', label: 'Food Items', icon: Utensils },
        ].map((tab) => {
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

      {/* Count */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          Saved Items
        </h2>

        <span className="text-sm text-gray-500">
          {filteredFavorites.length} items
        </span>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                  {item.type === 'shop' ? 'Shop' : 'Food'}
                </span>

                <button
                  onClick={() => removeFavorite(item.id)}
                  title="Remove from favorites"
                  className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-500 shadow-sm transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.name}
                  </h3>

                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-700">
                    <Star
                      size={15}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    {item.rating}
                  </div>
                </div>

                {item.type === 'shop' ? (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={15} />
                    {item.location}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-orange-600">
                    From {item.shop}
                  </p>
                )}

                <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">
                  {item.description}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      item.type === 'shop'
                        ? `/shops/${item.id}`
                        : `/shops`
                    )
                  }
                  className="mt-5 w-full rounded-lg border border-orange-500 py-2.5 font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  {item.type === 'shop' ? 'View Shop' : 'Explore Shops'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <Heart size={45} className="mx-auto text-gray-300" />

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
