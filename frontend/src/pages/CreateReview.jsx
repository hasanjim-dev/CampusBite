
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Star,
  Send,
  LoaderCircle,
  MessageCircle
} from 'lucide-react'
import api from '../api/axios'

export default function CreateReview() {
  const navigate = useNavigate()

  const [shops, setShops] = useState([])
  const [foods, setFoods] = useState([])
  const [shop, setShop] = useState('')
  const [food, setFood] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [loadingShops, setLoadingShops] = useState(true)
  const [loadingFoods, setLoadingFoods] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadShops = async () => {
      try {
        const response = await api.get('/shops')
        setShops(response.data.shops || [])
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load shops')
      } finally {
        setLoadingShops(false)
      }
    }

    loadShops()
  }, [])

  useEffect(() => {
    if (!shop) {
      setFoods([])
      return
    }

    let cancelled = false

    const loadFoods = async () => {
      setLoadingFoods(true)
      setFood('')

      try {
        const response = await api.get(
          `/food?shop_id=${shop}&limit=100`
        )

        if (!cancelled) {
          setFoods(response.data.foodItems || [])
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || 'Unable to load food items')
        }
      } finally {
        if (!cancelled) {
          setLoadingFoods(false)
        }
      }
    }

    loadFoods()

    return () => {
      cancelled = true
    }
  }, [shop])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!shop) {
      toast.error('Please select a shop')
      return
    }

    if (!food) {
      toast.error('Please select a food item')
      return
    }

    if (!rating) {
      toast.error('Please give a star rating')
      return
    }

    if (!review.trim()) {
      toast.error('Please write your review')
      return
    }

    if (imageUrl.trim()) {
      try {
        new URL(imageUrl.trim())
      } catch {
        toast.error('Please enter a valid image URL')
        return
      }
    }

    setSubmitting(true)

    try {
      await api.post('/reviews', {
        food_item_id: Number(food),
        rating,
        body: review.trim(),
        image_url: imageUrl.trim() || null,
        is_anonymous: anonymous
      })

      toast.success('Review submitted successfully!')
      navigate(`/shops/${shop}`)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to submit review'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 font-medium text-gray-600 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Write a Review
          </h1>
          <p className="mt-2 text-gray-500">
            Share your food experience with the CampusBite community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Select Shop <span className="text-red-500">*</span>
            </label>

            <select
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              disabled={loadingShops}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100"
            >
              <option value="">
                {loadingShops ? 'Loading shops...' : 'Choose a shop'}
              </option>

              {shops.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {!loadingShops && shops.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No shops are currently available.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Select Food <span className="text-red-500">*</span>
            </label>

            <select
              value={food}
              onChange={(e) => setFood(e.target.value)}
              disabled={!shop || loadingFoods}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {!shop
                  ? 'Select a shop first'
                  : loadingFoods
                    ? 'Loading food items...'
                    : 'Choose a food item'}
              </option>

              {foods.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  disabled={Number(item.is_available) !== 1}
                >
                  {item.name}
                  {Number(item.is_available) !== 1 ? ' (Unavailable)' : ''}
                </option>
              ))}
            </select>

            {shop && !loadingFoods && foods.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                This shop has no food items yet.
              </p>
            )}
          </div>

          <div>
            <label className="mb-3 block font-semibold text-gray-800">
              Your Rating <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  className="transition hover:scale-110"
                >
                  <Star
                    size={34}
                    className={
                      value <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}

              <span className="ml-2 text-sm font-medium text-gray-600">
                {rating ? `${rating} out of 5` : 'Select rating'}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Write Your Review <span className="text-red-500">*</span>
            </label>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="How was the food? Share your experience..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {review.length}/1000 characters
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Food Image URL <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/food-image.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 h-4 w-4 accent-orange-500"
            />

            <div>
              <p className="font-semibold text-gray-800">
                Post anonymously
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Your name and profile photo will not be shown with this review.
              </p>
            </div>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingShops || loadingFoods}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Review
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}
