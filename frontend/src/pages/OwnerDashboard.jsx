
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
   Star,
  MessageSquare,
  MessageCircle,
  Heart,
  Send,
  Utensils,
  Store,
  Clock,
  MapPin,
  Plus,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react'

import api from '../api/axios'
import ComplaintList from '../components/common/ComplaintList'

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
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedReviews, setLikedReviews] = useState({})
const [comments, setComments] = useState({})
const [loadedComments, setLoadedComments] = useState([])
const [commentTexts, setCommentTexts] = useState({})
const [expandedComments, setExpandedComments] = useState([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        let currentShop

        // First: Fetch owner's shop
        try {
          const shopResponse = await api.get('/shops/my-shop')
          currentShop = shopResponse.data.shop
        } catch (err) {
          // If shop does not exist, show Create Your Shop screen
          if (err.response?.status === 404) {
            setShop(null)
            return
          }

          throw err
        }

        setShop(currentShop)

        // Second: Fetch reviews and food items together
        const [reviewResponse, foodResponse] = await Promise.all([
          api.get('/reviews', {
            params: {
              shop_id: currentShop.id,
              page: 1,
              limit: 50,
            },
          }),

          api.get('/food-items', {
            params: {
              shop_id: currentShop.id,
              page: 1,
              limit: 100,
            },
          }),
        ])

        // Third: Save fetched data
        const loadedReviews = reviewResponse.data.reviews || []
        const loadedFoodItems = foodResponse.data.foodItems || []

        const reactionResults = await Promise.all(
  loadedReviews.map(async (review) => {
    try {
      const response = await api.get(`/reviews/${review.id}/reaction`)

      return {
        reviewId: review.id,
        isLiked: response.data.is_liked,
        likeCount: Number(response.data.like_count || 0),
      }
    } catch {
      return {
        reviewId: review.id,
        isLiked: false,
        likeCount: Number(review.like_count || 0),
      }
    }
  })
)

const reactionMap = Object.fromEntries(
  reactionResults.map((item) => [item.reviewId, item])
)

setLikedReviews(
  Object.fromEntries(
    reactionResults.map((item) => [item.reviewId, item.isLiked])
  )
)

setReviews(
  loadedReviews.map((review) => ({
    ...review,
    like_count: reactionMap[review.id]?.likeCount || 0,
  }))
)

        setTotalReviews(
          Number(
            reviewResponse.data.pagination?.total ?? loadedReviews.length
          )
        )

        setFoodItems(loadedFoodItems)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load dashboard information.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])
const handleLike = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/reaction`)

    setLikedReviews((previous) => ({
      ...previous,
      [reviewId]: response.data.is_liked,
    }))

    setReviews((previous) =>
      previous.map((review) =>
        review.id === reviewId
          ? { ...review, like_count: response.data.like_count }
          : review
      )
    )
  } catch (err) {
    window.alert(
      err.response?.data?.message || 'Could not update like.'
    )
  }
}

const loadComments = async (reviewId) => {
  try {
    const response = await api.get(`/comments/review/${reviewId}`)

    setComments((previous) => ({
      ...previous,
      [reviewId]: response.data.comments || [],
    }))

    setLoadedComments((previous) =>
      previous.includes(reviewId)
        ? previous
        : [...previous, reviewId]
    )
  } catch (err) {
    window.alert(
      err.response?.data?.message || 'Could not load comments.'
    )
  }
}

const handleAddComment = async (reviewId) => {
  const body = (commentTexts[reviewId] || '').trim()

  if (!body) return

  try {
    await api.post('/comments', {
      review_id: reviewId,
      body,
    })
    await api.post('/comments', {
  review_id: reviewId,
  body,
})

    setCommentTexts((previous) => ({
      ...previous,
      [reviewId]: '',
    }))

    await loadComments(reviewId)
  } catch (err) {
    window.alert(
      err.response?.data?.message || 'Could not add comment.'
    )
  }
}
const toggleComments = (reviewId) => {
  const isExpanded = expandedComments.includes(reviewId)

  setExpandedComments((previous) =>
    isExpanded
      ? previous.filter((id) => id !== reviewId)
      : [...previous, reviewId]
  )

  if (!isExpanded && !loadedComments.includes(reviewId)) {
    loadComments(reviewId)
  }
}
  const totalFoodRatings = foodItems.reduce(
    (total, item) => total + Number(item.rating_count || 0),
    0
  )

  const averageRating =
    totalFoodRatings > 0
      ? (
          foodItems.reduce(
            (total, item) =>
              total +
              Number(item.avg_rating || 0) *
                Number(item.rating_count || 0),
            0
          ) / totalFoodRatings
        ).toFixed(1)
      : '0.0'

  const availableItems = foodItems.filter(
    (item) => Number(item.is_available) === 1
  ).length

  const stats = [
    {
      title: 'Total Reviews',
      value: totalReviews,
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      description: 'All published reviews',
    },
    {
      title: 'Average Rating',
      value: averageRating,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Weighted average of food ratings',
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
          {/* Dashboard Statistics */}
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

          {/* My Shop Information */}
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

              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                  Number(shop.is_active) === 1
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
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

          {/* Recent Reviews */}
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
                    {/* Like and Comment Actions */}
<div className="mt-4 flex items-center gap-4">
  <button
    type="button"
    onClick={() => handleLike(review.id)}
    className={`flex items-center gap-2 text-sm font-medium transition ${
      likedReviews[review.id]
        ? 'text-rose-600'
        : 'text-gray-500 hover:text-rose-600'
    }`}
  >
    <Heart
      size={17}
      className={likedReviews[review.id] ? 'fill-current' : ''}
    />
    {Number(review.like_count || 0)} Likes
  </button>

  <button
    type="button"
    onClick={() => toggleComments(review.id)}
    className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
  >
    <MessageCircle size={17} />
   {expandedComments.includes(review.id)
  ? 'Hide Comments'
  : `${Number(review.comment_count || 0)} Comments`}
  </button>
</div>
{/* Comments Section */}
{expandedComments.includes(review.id) && (
  <div className="mt-4 border-t border-gray-100 pt-4">
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleAddComment(review.id)
      }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        value={commentTexts[review.id] || ''}
        onChange={(e) =>
          setCommentTexts((previous) => ({
            ...previous,
            [review.id]: e.target.value,
          }))
        }
        placeholder="Write a comment..."
        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
      />

      <button
        type="submit"
        disabled={!(commentTexts[review.id] || '').trim()}
        className="rounded-lg bg-orange-500 p-2 text-white hover:bg-orange-600 disabled:opacity-50"
      >
        <Send size={17} />
      </button>
    </form>

    <div className="mt-4 space-y-3">
      {(comments[review.id] || []).map((comment) => (
        <div key={comment.id} className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">
              {comment.user_name}
            </p>

            {comment.is_shop_owner && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                Shop Owner
              </span>
            )}
          </div>

          <p className={`mt-1 text-sm text-gray-600 ${comment.is_shop_owner ? 'font-bold' : ''}`}>
            {comment.body}
          </p>

          {(comment.replies || []).map((reply) => (
            <div key={reply.id} className="ml-5 mt-3 border-l-2 border-gray-200 pl-3">
              <p className="text-sm font-semibold text-gray-800">
                {reply.user_name}
              </p>
              <p className={`mt-1 text-sm text-gray-600 ${reply.is_shop_owner ? 'font-bold' : ''}`}>
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <MessageSquare
                  size={35}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-semibold text-gray-700">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Student reviews will appear here.
                </p>
              </div>
            )}

            {totalReviews > 5 && (
              <div className="border-t border-gray-100 p-4 text-center text-xs text-gray-500">
                Showing the latest 5 of {totalReviews} reviews
              </div>
            )}
          </div>

          {/* Complaints Against My Shop */}
          <div className="mt-8">
            <ComplaintList
              endpoint="/complaints/my-shop"
              title="Complaints Against My Shop"
              subtitle="View complaints submitted about your shop. Anonymous complainant identities remain private."
            />
          </div>
        </>
      )}
    </div>
  )
}
