
import { useMemo, useState } from 'react'
import {
  Search,
  MapPin,
  Star,
  ArrowUpRight,
  SlidersHorizontal,
  UtensilsCrossed,
  Coffee,
  Pizza,
  IceCream,
  X,
} from 'lucide-react'

const shops = [
  {
    id: 1,
    name: 'Campus Food Court',
    category: 'Food',
    description: 'Delicious meals and fresh food for campus students.',
    location: 'Main Campus',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    featured: true,
  },
  {
    id: 2,
    name: 'Campus Cafe',
    category: 'Drinks',
    description: 'Enjoy coffee, cold drinks and a relaxing atmosphere.',
    location: 'Academic Building',
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    featured: false,
  },
  {
    id: 3,
    name: 'Snack Corner',
    category: 'Snacks',
    description: 'Tasty snacks, sandwiches and quick bites.',
    location: 'University Gate',
    rating: 4.5,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
    featured: false,
  },
  {
    id: 4,
    name: 'Pizza Station',
    category: 'Food',
    description: 'Freshly baked pizza with delicious toppings.',
    location: 'Food Zone',
    rating: 4.7,
    reviews: 102,
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800',
    featured: true,
  },
  {
    id: 5,
    name: 'Sweet Treats',
    category: 'Desserts',
    description: 'Cakes, ice cream and sweet treats for everyone.',
    location: 'Main Campus',
    rating: 4.4,
    reviews: 53,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
    featured: false,
  },
  {
    id: 6,
    name: 'Coffee House',
    category: 'Drinks',
    description: 'Premium coffee and refreshing beverages.',
    location: 'Library Road',
    rating: 4.9,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    featured: true,
  },
]

const categories = [
  { name: 'All', icon: SlidersHorizontal },
  { name: 'Food', icon: UtensilsCrossed },
  { name: 'Drinks', icon: Coffee },
  { name: 'Snacks', icon: Pizza },
  { name: 'Desserts', icon: IceCream },
]

function ShopCard({ shop }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {shop.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}

        <span className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow">
          {shop.category}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">
            {shop.name}
          </h3>

          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-800">
            <Star size={15} className="fill-yellow-400 text-yellow-400" />
            {shop.rating}
          </div>
        </div>

        <p className="mb-4 min-h-10 text-sm leading-5 text-gray-500">
          {shop.description}
        </p>

        <div className="mb-5 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {shop.location}
          </span>

          <span>{shop.reviews} reviews</span>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = `/shops/${shop.id}`}
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
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesCategory =
        activeCategory === 'All' || shop.category === activeCategory

      const matchesSearch =
        shop.name.toLowerCase().includes(search.toLowerCase()) ||
        shop.description.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="pb-12">
      {/* Hero Section */}
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
            Find your favorite campus food spots, explore menus and discover
            places recommended by students.
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={17} className="text-orange-400" />
            Explore shops around your campus
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="mb-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops or food places..."
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
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            const active = activeCategory === category.name

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Shop List */}
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

          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
            {filteredShops.length} Shops
          </span>
        </div>

        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <Search size={36} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-800">
              No shops found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('All')
              }}
              className="mt-4 font-semibold text-orange-600 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
