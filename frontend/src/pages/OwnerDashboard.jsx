
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
  TrendingUp,
  Package,
  CalendarDays,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

import api from '../api/axios'
import ComplaintList from '../components/common/ComplaintList'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

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

function getInitials(name) {
  return (name || 'Shop')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function StatCard({ title, value, description, icon: Icon, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${accent.bg} opacity-60 transition duration-300 group-hover:scale-125`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            {value}
          </h3>
        </div>

        <div className={`rounded-2xl p-3 ${accent.icon}`}>
          <Icon size={23} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <TrendingUp size={13} />
        </span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-7 pb-12">
      <div className="h-52 rounded-3xl bg-gray-200" />
      <div className="grid gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-3xl bg-gray-200" />
        ))}
      </div>
      <div className="h-72 rounded-3xl bg-gray-200" />
      <div className="h-96 rounded-3xl bg-gray-200" />
    </div>
  )
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
  const [commentLoading, setCommentLoading] = useState({})
  const [submittingComments, setSubmittingComments] = useState({})

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        let currentShop

        try {
          const shopResponse = await api.get('/shops/my-shop')
          currentShop = shopResponse.data.shop
        } catch (err) {
          if (err.response?.status === 404) {
            setShop(null)
            return
          }

          throw err
        }

        setShop(currentShop)

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

        const loadedReviews = reviewResponse.data.reviews || []
        const loadedFoodItems = foodResponse.data.foodItems || []

        const reactionResults = await Promise.all(
          loadedReviews.map(async (review) => {
            try {
              const response = await api.get(
                `/reviews/${review.id}/reaction`
              )

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
            reactionResults.map((item) => [
              item.reviewId,
              item.isLiked,
            ])
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
            reviewResponse.data.pagination?.total ??
              loadedReviews.length
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
      const response = await api.post(
        `/reviews/${reviewId}/reaction`
      )

      setLikedReviews((previous) => ({
        ...previous,
        [reviewId]: response.data.is_liked,
      }))

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                like_count: response.data.like_count,
              }
            : review
        )
      )
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not update like.'
      )
    }
  }

  const loadComments = async (reviewId) => {
    try {
      setCommentLoading((previous) => ({
        ...previous,
        [reviewId]: true,
      }))

      const response = await api.get(
        `/comments/review/${reviewId}`
      )

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
      toast.error(
        err.response?.data?.message || 'Could not load comments.'
      )
    } finally {
      setCommentLoading((previous) => ({
        ...previous,
        [reviewId]: false,
      }))
    }
  }

  const handleAddComment = async (reviewId) => {
    const body = (commentTexts[reviewId] || '').trim()

    if (!body || submittingComments[reviewId]) return

    try {
      setSubmittingComments((previous) => ({
        ...previous,
        [reviewId]: true,
      }))

      await api.post('/comments', {
        review_id: reviewId,
        body,
      })

      setCommentTexts((previous) => ({
        ...previous,
        [reviewId]: '',
      }))

      await loadComments(reviewId)

      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                comment_count: Number(review.comment_count || 0) + 1,
              }
            : review
        )
      )

      toast.success('Comment added successfully.')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not add comment.'
      )
    } finally {
      setSubmittingComments((previous) => ({
        ...previous,
        [reviewId]: false,
      }))
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
      description: 'Customer feedback received',
      accent: {
        bg: 'bg-orange-100',
        icon: 'bg-orange-50 text-orange-600',
      },
    },
    {
      title: 'Average Rating',
      value: averageRating,
      icon: Star,
      description: `${totalFoodRatings} food ratings submitted`,
      accent: {
        bg: 'bg-amber-100',
        icon: 'bg-amber-50 text-amber-600',
      },
    },
    {
      title: 'Menu Items',
      value: foodItems.length,
      icon: Utensils,
      description: `${availableItems} currently available`,
      accent: {
        bg: 'bg-emerald-100',
        icon: 'bg-emerald-50 text-emerald-600',
      },
    },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!shop && !error) {
    return (
      <div className="mx-auto max-w-6xl space-y-7 pb-12">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-900 via-orange-700 to-amber-500 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
          <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-amber-300/20 blur-2xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-orange-50">
              <Sparkles size={14} />
              CAMPUSBITE OWNER PANEL
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Your shop journey
              <span className="block text-amber-200">
                starts here.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-orange-50/90 sm:text-base">
              Create your shop profile, add your menu and start
              connecting with students on campus.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-orange-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600">
            <Store size={36} />
          </div>

          <h2 className="mt-6 text-2xl font-black text-gray-900">
            Welcome to CampusBite!
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
            You haven't created your shop yet. Set up your shop
            information to start managing food items and receiving
            student reviews.
          </p>

          <button
            type="button"
            onClick={() => navigate('/owner/shop')}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus size={18} />
            Create Your Shop
            <ArrowRight size={17} />
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-950 via-orange-800 to-amber-500 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[42px] border-white/10" />
        <div className="absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-orange-400/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-orange-50">
              <Sparkles size={14} />
              SHOP OWNER PANEL
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Dashboard
              <span className="mt-1 block text-amber-200">
                Overview
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-orange-50/90 sm:text-base">
              Welcome back! Keep track of your shop performance,
              customer feedback and menu activity in one place.
            </p>
          </div>

          {shop && (
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 pr-5 shadow-lg backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white text-lg font-black text-orange-700">
                {shop.logo_url ? (
                  <img
                    src={getImageUrl(shop.logo_url)}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(shop.name)
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100">
                  Your shop
                </p>
                <p className="mt-1 max-w-40 truncate font-bold text-white">
                  {shop.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center">
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 font-bold text-red-700 hover:text-red-900"
          >
            <RefreshCw size={15} />
            Reload page
          </button>
        </div>
      )}

      {shop && (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  At a glance
                </p>
                <h2 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">
                  Your shop performance
                </h2>
              </div>
              <span className="hidden rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 sm:inline-flex">
                Overview statistics
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Store size={19} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Shop management
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-black text-gray-900 sm:text-2xl">
                  My Shop
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your shop information and current status
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${
                  Number(shop.is_active) === 1
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    Number(shop.is_active) === 1
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                />
                {Number(shop.is_active) === 1 ? 'Active Shop' : 'Inactive Shop'}
              </span>
            </div>

            <div className="p-5 sm:p-7">
              {shop.logo_url ? (
                <div className="relative h-48 overflow-hidden rounded-2xl bg-gray-100 sm:h-60">
                  <img
                    src={getImageUrl(shop.logo_url)}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                      CampusBite shop
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      {shop.name}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-50 p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-black text-orange-600 shadow-sm">
                    {getInitials(shop.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                      Your shop
                    </p>
                    <h3 className="mt-1 text-xl font-black text-gray-900">
                      {shop.name}
                    </h3>
                  </div>
                </div>
              )}

              {shop.description && (
                <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600">
                  {shop.description}
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Store size={17} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Shop name
                    </span>
                  </div>
                  <p className="mt-3 break-words text-sm font-bold text-gray-800">
                    {shop.name}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <MapPin size={17} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Location
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-gray-800">
                    {shop.location || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock size={17} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Opening hours
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-gray-800">
                    {shop.opening_hours || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-500">
                  Keep your shop information up to date.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/owner/shop')}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                >
                  Manage Shop
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <div className="flex items-center gap-2 text-orange-600">
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Customer feedback
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-black text-gray-900 sm:text-2xl">
                  Recent Reviews
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest feedback and conversations from your customers
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5">
                <MessageSquare size={17} className="text-orange-600" />
                <span className="text-sm font-bold text-orange-700">
                  {totalReviews} Reviews
                </span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {reviews.slice(0, 5).map((review) => (
                  <article
                    key={review.id}
                    className="p-5 transition-colors hover:bg-orange-50/20 sm:p-7"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-black text-orange-700">
                        {getInitials(review.reviewer_name || 'Anonymous')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {review.reviewer_name || 'Anonymous'}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                              <Utensils size={13} />
                              {review.food_item_name || 'Food item'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5">
                            {[1, 2, 3, 4, 5].map((number) => (
                              <Star
                                key={number}
                                size={14}
                                className={
                                  number <= Number(review.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                            <span className="ml-1 text-xs font-bold text-amber-700">
                              {Number(review.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                          {review.body}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays size={14} />
                          {formatTime(review.created_at)}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4">
                          <button
                            type="button"
                            onClick={() => handleLike(review.id)}
                            className={`inline-flex items-center gap-2 text-sm font-bold transition ${
                              likedReviews[review.id]
                                ? 'text-rose-600'
                                : 'text-gray-500 hover:text-rose-600'
                            }`}
                          >
                            <Heart
                              size={17}
                              className={
                                likedReviews[review.id] ? 'fill-current' : ''
                              }
                            />
                            {Number(review.like_count || 0)} Likes
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleComments(review.id)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-orange-600"
                          >
                            <MessageCircle size={17} />
                            {expandedComments.includes(review.id)
                              ? 'Hide Comments'
                              : `${Number(review.comment_count || 0)} Comments`}
                          </button>
                        </div>

                        {expandedComments.includes(review.id) && (
                          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
                            <h4 className="mb-4 text-sm font-bold text-gray-800">
                              Discussion
                            </h4>

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
                                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                              />

                              <button
                                type="submit"
                                disabled={
                                  !(commentTexts[review.id] || '').trim() ||
                                  submittingComments[review.id]
                                }
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Send comment"
                              >
                                {submittingComments[review.id] ? (
                                  <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Send size={17} />
                                )}
                              </button>
                            </form>

                            {commentLoading[review.id] ? (
                              <div className="flex items-center justify-center gap-2 py-7 text-sm text-gray-500">
                                <LoaderCircle
                                  size={17}
                                  className="animate-spin"
                                />
                                Loading comments...
                              </div>
                            ) : (
                              <div className="mt-4 space-y-3">
                                {(comments[review.id] || []).length > 0 ? (
                                  comments[review.id].map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="rounded-xl border border-gray-100 bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-bold text-gray-800">
                                          {comment.user_name}
                                        </p>

                                        {comment.is_shop_owner && (
                                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                                            Shop Owner
                                          </span>
                                        )}
                                      </div>

                                      <p
                                        className={`mt-2 text-sm leading-6 text-gray-600 ${
                                          comment.is_shop_owner
                                            ? 'font-semibold'
                                            : ''
                                        }`}
                                      >
                                        {comment.body}
                                      </p>

                                      {(comment.replies || []).map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="ml-3 mt-4 border-l-2 border-orange-200 pl-4 sm:ml-5"
                                        >
                                          <p className="text-xs font-bold text-gray-800">
                                            {reply.user_name}
                                          </p>
                                          <p
                                            className={`mt-1 text-sm leading-6 text-gray-600 ${
                                              reply.is_shop_owner
                                                ? 'font-semibold'
                                                : ''
                                            }`}
                                          >
                                            {reply.body}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-5 text-center">
                                    <MessageCircle
                                      size={25}
                                      className="mx-auto text-gray-300"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                      No comments yet. Start the conversation!
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
                  <MessageSquare size={30} />
                </div>
                <h3 className="mt-4 font-bold text-gray-800">
                  No reviews yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Student reviews will appear here when customers share
                  their experiences.
                </p>
              </div>
            )}

            {totalReviews > 5 && (
              <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Showing the latest 5 of {totalReviews} reviews
                </p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-rose-50/70 to-white p-5 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <MessageCircle size={21} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Shop Complaints
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review complaints submitted about your shop
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <ComplaintList
                endpoint="/complaints/my-shop"
                title="Complaints Against My Shop"
                subtitle="View complaints submitted about your shop. Anonymous complainant identities remain private."
              />
            </div>
          </section>

          <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm sm:flex">
                <Package size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Want to update your menu?
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Manage your food items and availability.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/owner/menu')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-orange-700 shadow-sm transition hover:bg-orange-100 sm:px-4 sm:text-sm"
            >
              Manage Menu
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
