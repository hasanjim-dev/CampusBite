
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  MessageSquare,
  Utensils,
  Store,
  Clock,
  MapPin,
  Plus,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react'
import api from '../api/axios'

function formatTime(date) {
  if (!date) return ''

  const value = new Date(date)

  if (Number.isNaN(value.getTime())) return ''

  const diff = Math.max(0, Date.now() - value.getTime())
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return value.toLocaleDateString()
}

export default function OwnerDashboard() {
  const navigate = useNavigate()

  const [shop, setShop] = useState(null)
  const [reviews, setReviews] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const shopResponse = await api.get('/shops/my-shop')
        const currentShop = shopResponse.data.shop

        setShop(currentShop)

        const [reviewResponse, foodResponse] = await Promise.all([
          api.get('/reviews', {
            params: {
              shop_id: currentShop.id,
              page: 1,
              limit: 50,
            },
          }),
          api.get('/food', {
            params: {
              shop_id: currentShop.id,
              page: 1,
              limit: 100,
            },
          }),
        ])

        setReviews(reviewResponse.data.reviews || [])
        setFoodItems(foodResponse.data.foodItems || [])
      } catch (err) {
        if (err.response?.status === 404) {
          setShop(null)
        } else {
          setError(
            err.response?.data?.message ||
            'Could not load dashboard information.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const averageRating = reviews.length
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : '0.0'

  const availableItems = foodItems.filter(
    (item) => Number(item.is_available) === 1
  ).length

  const stats = [
    {
      title: 'Total Reviews',
      value: reviews.length,
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      description: 'Reviews loaded from your shop',
    },
    {
      title: 'Average Rating',
      value: averageRating,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Based on loaded reviews',
    },
    {
      title: 'Menu Items',
      value: foodItems.length,
      icon: Utensils,
      color: 'bg-green-100 text-green-600',
      description: `${availableItems} currently available`,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-gray-500">
        <LoaderCircle className="animate-spin" />
        Loading dashboard...
      </div>
    )
  }

  if (!shop && !error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            SHOP OWNER PANEL
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        <div className="rounded-2xl border bg-white p-10 text-center">
          <Store size={45} className="mx-auto text-orange-400" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Welcome to CampusBite!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your shop to start managing food items and receiving reviews.
          </p>
          <button
            type="button"
            onClick={() => navigate('/owner/shop')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Create Your Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-orange-500">
            SHOP OWNER PANEL
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            Welcome back! Here's your shop overview.
          </p>
        </div>

        {shop && (
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-orange-600">
            <Store size={20} />
            <span className="font-semibold">{shop.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {shop && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {stat.title}
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-800">
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  My Shop
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your shop information
                </p>
              </div>

              <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                Number(shop.is_active) === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {Number(shop.is_active) === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            {shop.logo_url && (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="mt-5 h-40 w-full rounded-xl object-cover"
              />
            )}

            {shop.description && (
              <p className="mt-5 text-sm leading-6 text-gray-600">
                {shop.description}
              </p>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Shop Name</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {shop.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 flex items-center gap-1 font-semibold text-gray-800">
                  <MapPin size={15} />
                  {shop.location || 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Opening Hours</p>
                <p className="mt-1 flex items-center gap-1 font-semibold text-gray-800">
                  <Clock size={15} />
                  {shop.opening_hours || 'Not provided'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/owner/shop')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              Manage Shop
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Reviews
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest feedback from your shop
                </p>
              </div>

              <MessageSquare className="text-orange-500" size={22} />
            </div>

            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {reviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="p-6 transition hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {review.reviewer_name || 'Anonymous'}
                        </h3>
                        <p className="mt-1 text-sm text-orange-600">
                          {review.food_item_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((number) => (
                          <Star
                            key={number}
                            size={16}
                            className={
                              number <= Number(review.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      {review.body}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={14} />
                      {formatTime(review.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <MessageSquare size={35} className="mx-auto text-gray-300" />
                <p className="mt-3 font-semibold text-gray-700">
                  No reviews yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Student reviews will appear here.
                </p>
              </div>
            )}

            {reviews.length > 5 && (
              <div className="border-t border-gray-100 p-4 text-center text-xs text-gray-500">
                Showing the latest 5 of {reviews.length} loaded reviews
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
