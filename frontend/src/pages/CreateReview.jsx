
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Star,
  Upload,
  X,
  Send,
} from 'lucide-react'

const shops = [
  {
    id: '1',
    name: 'Food Court',
    foods: ['Chicken Burger', 'Beef Burger', 'French Fries', 'Pizza'],
  },
  {
    id: '2',
    name: 'Campus Cafe',
    foods: ['Cold Coffee', 'Hot Coffee', 'Sandwich', 'Pasta'],
  },
  {
    id: '3',
    name: 'Snack Corner',
    foods: ['Chicken Sandwich', 'Samosa', 'Spring Roll', 'Noodles'],
  },
]

export default function CreateReview() {
  const navigate = useNavigate()

  const [shop, setShop] = useState('')
  const [food, setFood] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const selectedShop = shops.find((item) => item.id === shop)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
  }

  const handleSubmit = (e) => {
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

    toast.success('Review submitted successfully! (Demo)')
    navigate('/')
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
          {/* Shop Selection */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Select Shop <span className="text-red-500">*</span>
            </label>

            <select
              value={shop}
              onChange={(e) => {
                setShop(e.target.value)
                setFood('')
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Choose a shop</option>
              {shops.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Food Selection */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Select Food <span className="text-red-500">*</span>
            </label>

            <select
              value={food}
              onChange={(e) => setFood(e.target.value)}
              disabled={!selectedShop}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {selectedShop ? 'Choose a food item' : 'Select a shop first'}
              </option>

              {selectedShop?.foods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
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

          {/* Review Text */}
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

          {/* Image Upload */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Add Food Photo <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            {!imagePreview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-5 py-8 transition hover:border-orange-400 hover:bg-orange-50">
                <Upload size={30} className="mb-2 text-gray-400" />
                <span className="font-medium text-gray-700">
                  Click to upload an image
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  JPG, PNG or WEBP · Maximum 5MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Review preview"
                  className="h-48 w-48 rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Anonymous */}
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

          {/* Submit */}
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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              <Send size={18} />
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
