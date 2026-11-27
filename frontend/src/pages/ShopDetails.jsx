
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
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Utensils,
  ImageOff,
  PencilLine,
  CheckCircle2,
  XCircle
} from 'lucide-react'
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

function formatPrice(price) {
  return `৳${Number(price || 0).toFixed(2)}`
}

function formatDate(date) {
  if (!date) return ''

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return ''

  return parsedDate.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function ShopDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-5 w-32 rounded bg-gray-200 mb-7" />

        <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100">
          <div className="h-64 md:h-80 bg-gray-200" />

          <div className="p-6 md:p-9 space-y-5">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-4 w-full max-w-xl rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />

            <div className="flex flex-wrap gap-3 pt-3">
              <div className="h-12 w-40 rounded-xl bg-gray-200" />
              <div className="h-12 w-40 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10 mb-7">
          <div className="h-12 w-36 rounded-xl bg-gray-200" />
          <div className="h-12 w-36 rounded-xl bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl overflow-hidden">
              <div className="h-52 bg-gray-200" />
              <div className="p-5 space-y-4">
                <div className="h-5 w-36 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-6 w-24 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] px-6 py-14 text-center shadow-sm">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-50 flex items-center justify-center mb-5">
        <Icon size={34} className="text-orange-400" />
      </div>

      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>

      <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  )
}

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
            api.get(`/food-items?shop_id=${id}&limit=100`),
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

  if (loading) {
    return <ShopDetailsSkeleton />
  }

  if (error || !shop) {
    return (
      <div className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 flex items-center justify-center mb-5">
            <AlertCircle size={38} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Shop Not Available
          </h2>

          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            {error || 'This shop could not be found.'}
          </p>

          <button
            onClick={() => navigate('/shops')}
            className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft size={17} />
            Back to Shops
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/shops')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-600 transition group"
          >
            <span className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50 transition">
              <ArrowLeft size={17} />
            </span>
            Back to Shops
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>CampusBite</span>
            <ChevronRight size={14} />
            <span>Shops</span>
            <ChevronRight size={14} />
            <span className="text-orange-600 font-semibold truncate max-w-36">
              {shop.name}
            </span>
          </div>
        </div>

        {/* Shop Hero */}
        <section className="relative bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm">

          <div className="relative h-60 sm:h-72 lg:h-[360px] bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 overflow-hidden">
            {shop.logo_url ? (
              <img
                src={getImageUrl(shop.logo_url)}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-[36px] bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Store size={66} className="text-white" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

            <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-orange-600 shadow-sm">
              <Sparkles size={14} />
              Campus Food Spot
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-orange-100 mb-2">
                Welcome to
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-sm">
                {shop.name}
              </h1>

              {shop.location && (
                <div className="flex items-center gap-2 mt-3 text-sm sm:text-base text-white/90">
                  <MapPin size={17} />
                  <span>{shop.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop Information */}
          <div className="p-6 sm:p-8 lg:p-9">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-7">

              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-wider">
                    About this shop
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Discover what&apos;s cooking
                </h2>

                <p className="text-gray-500 mt-3 leading-7 text-sm sm:text-base">
                  {shop.description || 'Explore the food menu and discover what this shop has to offer.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:min-w-[360px]">
                {shop.opening_hours && (
                  <div className="rounded-2xl bg-[#faf9f7] border border-gray-100 p-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                      <Clock size={18} className="text-orange-600" />
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Opening Hours
                    </p>

                    <p className="text-sm font-bold text-gray-800 mt-1 leading-relaxed">
                      {shop.opening_hours}
                    </p>
                  </div>
                )}

                {shop.location && (
                  <div className="rounded-2xl bg-[#faf9f7] border border-gray-100 p-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                      <MapPin size={18} className="text-orange-600" />
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Location
                    </p>

                    <p className="text-sm font-bold text-gray-800 mt-1 leading-relaxed">
                      {shop.location}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(shop.contact_phone || shop.contact_email) && (
              <div className="mt-7 pt-6 border-t border-gray-100 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-7">
                {shop.contact_phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Phone size={17} className="text-green-600" />
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Contact Number
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {shop.contact_phone}
                      </p>
                    </div>
                  </div>
                )}

                {shop.contact_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Mail size={17} className="text-blue-600" />
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">
                        {shop.contact_email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section Heading */}
        <section className="mt-12 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-[0.18em] mb-2">
                <Sparkles size={15} />
                Explore the shop
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                What are you looking for?
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Explore the menu or see what other students are saying.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Store size={15} />
              <span>{shop.name}</span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex gap-2 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'menu'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <UtensilsCrossed size={17} />
            Menu
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'menu'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {menu.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'reviews'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <MessageCircle size={17} />
            Reviews
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'reviews'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Menu */}
        {activeTab === 'menu' && (
          <section className="mt-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Our Menu
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {menu.length} food {menu.length === 1 ? 'item' : 'items'} available in this menu
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-2 rounded-full">
                <Utensils size={14} />
                Freshly listed
              </div>
            </div>

            {menu.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="No Menu Items Yet"
                description="This shop has not added any food items yet. Please check back later."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {menu.map((item) => {
                  const hasDiscount = Number(item.discount_percent) > 0
                  const isAvailable = Number(item.is_available) === 1

                  return (
                    <article
                      key={item.id}
                      className="group bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-52 sm:h-56 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed size={54} className="text-orange-300" />
                          </div>
                        )}

                        {hasDiscount && (
                          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-extrabold shadow-lg">
                            {item.discount_percent}% OFF
                          </div>
                        )}

                        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md ${
                          isAvailable
                            ? 'bg-green-500/90 text-white'
                            : 'bg-gray-900/70 text-white'
                        }`}>
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-extrabold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h3>

                          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-50 text-yellow-600">
                            <Star size={13} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-700">
                              {Number(item.avg_rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2 min-h-10">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                              Price
                            </p>

                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-xl font-extrabold text-orange-600">
                                {formatPrice(item.final_price)}
                              </span>

                              {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                              Ratings
                            </p>
                            <p className="text-xs font-semibold text-gray-600">
                              {item.rating_count || 0} reviews
                            </p>
                          </div>
                        </div>

                        <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${
                          isAvailable ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {isAvailable ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <XCircle size={15} />
                          )}
                          {isAvailable
                            ? 'Ready to explore'
                            : 'Currently unavailable'}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            <div className="mt-10 rounded-[24px] bg-gradient-to-r from-orange-500 to-orange-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-orange-500/15">
              <div>
                <div className="flex items-center gap-2 text-orange-100 text-xs font-bold uppercase tracking-wider mb-2">
                  <PencilLine size={14} />
                  Share your experience
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold">
                  Tried something from this shop?
                </h3>

                <p className="text-sm text-orange-50 mt-2">
                  Help other students discover great food with your review.
                </p>
              </div>

              <button
                onClick={() => navigate('/reviews/new')}
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3.5 rounded-xl text-sm font-extrabold hover:bg-orange-50 transition shadow-lg"
              >
                Write a Review
                <ChevronRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <section className="mt-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Student Reviews
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Real experiences shared by the campus community.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-2 rounded-full">
                <MessageCircle size={14} />
                Community feedback
              </div>
            </div>

            {reviews.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No Reviews Yet"
                description="Be the first to share your experience with this shop and help other students."
              />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const reviewImages =
                    review.image_urls ||
                    (review.image_url ? [review.image_url] : [])

                  return (
                    <article
                      key={review.id}
                      className="bg-white border border-gray-100 rounded-[24px] p-5 sm:p-7 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0">
                            {(review.reviewer_name || 'A')
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">
                              {review.reviewer_name || 'Anonymous'}
                            </h4>

                            {review.food_item_name && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                <Utensils size={12} className="text-orange-500" />
                                {review.food_item_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                          <Star size={15} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-extrabold text-gray-800">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      {review.body && (
                        <p className="text-gray-600 text-sm leading-7 mt-5 whitespace-pre-line">
                          {review.body}
                        </p>
                      )}

                      {reviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-5">
                          {reviewImages.map((imageUrl, index) => (
                            <img
                              key={`${review.id}-${index}`}
                              src={getImageUrl(imageUrl)}
                              alt={`Review image ${index + 1}`}
                              loading="lazy"
                              className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl object-cover border border-gray-100"
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-400 font-medium">
                          {formatDate(review.created_at)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <MessageCircle size={14} />
                          {review.like_count || 0} likes
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/reviews/new')}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
              >
                <PencilLine size={17} />
                Write a Review
              </button>
            </div>
          </section>
        )}

        {/* Bottom navigation */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center">
          <button
            onClick={() => navigate('/shops')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
          >
            <ArrowLeft size={16} />
            Explore More Shops
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShopDetails
