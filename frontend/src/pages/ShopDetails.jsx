
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  MessageCircle,
  UtensilsCrossed,
  Store,
  LoaderCircle,
  AlertCircle
} from 'lucide-react'
import api from '../api/axios'

function ShopDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [shop, setShop] = useState(null)
  const [menu, setMenu] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('menu')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadShopDetails = async () => {
      setLoading(true)
      setError('')

      try {
        const [shopResponse, menuResponse, reviewResponse] =
          await Promise.all([
            api.get(`/shops/${id}`),
            api.get(`/food?shop_id=${id}&limit=100`),
            api.get(`/reviews?shop_id=${id}&limit=50`)
          ])

        if (cancelled) return

        setShop(shopResponse.data.shop)
        setMenu(menuResponse.data.foodItems || [])
        setReviews(reviewResponse.data.reviews || [])
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            'Unable to load shop details. Please try again.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadShopDetails()

    return () => {
      cancelled = true
    }
  }, [id])

  const formatPrice = (price) => {
    return `৳${Number(price || 0).toFixed(2)}`
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="w-9 h-9 animate-spin text-orange-500" />
        <p className="text-gray-500">Loading shop details...</p>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-800">
          Shop Not Available
        </h2>
        <p className="text-gray-500 mt-2">
          {error || 'This shop could not be found.'}
        </p>
        <button
          onClick={() => navigate('/shops')}
          className="mt-5 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Back to Shops
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <button
        onClick={() => navigate('/shops')}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6"
      >
        <ArrowLeft size={18} />
        Back to Shops
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="w-20 h-20 text-white" />
          )}
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {shop.name}
          </h1>

          {shop.description && (
            <p className="text-gray-600 mt-3 leading-relaxed">
              {shop.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-5 text-gray-600">

            {shop.location && (
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" />
                <span>{shop.location}</span>
              </div>
            )}

            {shop.opening_hours && (
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                <span>{shop.opening_hours}</span>
              </div>
            )}

          </div>

          {(shop.contact_phone || shop.contact_email) && (
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              {shop.contact_phone && (
                <p>Phone: {shop.contact_phone}</p>
              )}
              {shop.contact_email && (
                <p>Email: {shop.contact_email}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-b border-gray-200 flex gap-8">

        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 font-semibold ${
            activeTab === 'menu'
              ? 'text-orange-600 border-b-2 border-orange-500'
              : 'text-gray-500'
          }`}
        >
          Menu ({menu.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 font-semibold ${
            activeTab === 'reviews'
              ? 'text-orange-600 border-b-2 border-orange-500'
              : 'text-gray-500'
          }`}
        >
          Reviews ({reviews.length})
        </button>

      </div>

      {activeTab === 'menu' && (
        <div className="mt-6">

          {menu.length === 0 ? (
            <div className="bg-white rounded-xl border p-10 text-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">
                No Menu Items Yet
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                This shop has not added any food items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-48 bg-orange-50 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="w-14 h-14 text-orange-300" />
                    )}
                  </div>

                  <div className="p-5">

                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {item.name}
                      </h3>

                      {Number(item.discount_percent) > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                          {item.discount_percent}% OFF
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">

                      <div>
                        <span className="text-orange-600 font-bold text-lg">
                          {formatPrice(item.final_price)}
                        </span>

                        {Number(item.discount_percent) > 0 && (
                          <span className="text-gray-400 line-through text-sm ml-2">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star size={15} className="text-yellow-500 fill-yellow-500" />
                        {Number(item.avg_rating || 0).toFixed(1)}
                        <span>({item.rating_count || 0})</span>
                      </div>

                    </div>

                    <p className={`text-xs mt-3 font-medium ${
                      Number(item.is_available) === 1
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}>
                      {Number(item.is_available) === 1
                        ? 'Available'
                        : 'Currently Unavailable'}
                    </p>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="mt-6 space-y-4">

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl border p-10 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">
                No Reviews Yet
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                Be the first to share your experience.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >

                <div className="flex justify-between items-start gap-3">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.reviewer_name || 'Anonymous'}
                    </h3>

                    {review.food_item_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        {review.food_item_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} className="fill-yellow-500" />
                    <span className="font-semibold text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>

                </div>

                <p className="text-gray-600 mt-3 leading-relaxed">
                  {review.body}
                </p>

                {review.image_url && (
                  <img
                    src={review.image_url}
                    alt="Review"
                    className="mt-4 w-40 h-32 rounded-lg object-cover"
                  />
                )}

                <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                  <span>{formatDate(review.created_at)}</span>
                  <span>{review.like_count || 0} likes</span>
                </div>

              </div>
            ))
          )}

        </div>
      )}

      {activeTab === 'menu' && (
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/reviews/new')}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Write a Review
          </button>
        </div>
      )}

    </div>
  )
}

export default ShopDetails
