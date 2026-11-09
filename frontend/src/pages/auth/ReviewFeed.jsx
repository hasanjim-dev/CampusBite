
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Star,
  Heart,
  MessageCircle,
  Clock3,
  Search,
  Plus,
  Utensils,
  MapPin,
  ArrowRight,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

// Demo Reviews
const initialReviews = [
  {
    id: 1,
    name: 'Nusrat Jahan',
    initials: 'NJ',
    shop: 'Food Court',
    food: 'Chicken Burger',
    category: 'Food',
    rating: 5,
    time: '2 hours ago',
    text: 'The burger was really delicious! The chicken was juicy and the price was reasonable. Definitely recommended.',
    likes: 24,
    comments: 8,
    color: 'bg-orange-100 text-orange-700',
    edited: false,
  },
  {
    id: 2,
    name: 'Anonymous',
    initials: 'A',
    shop: 'Campus Cafe',
    food: 'Cold Coffee',
    category: 'Drinks',
    rating: 4,
    time: '5 hours ago',
    text: 'Good coffee and a nice place to hang out with friends between classes. Could be a little less sweet.',
    likes: 16,
    comments: 4,
    color: 'bg-blue-100 text-blue-700',
    edited: true,
  },
  {
    id: 3,
    name: 'Sakib Ahmed',
    initials: 'SA',
    shop: 'Snack Corner',
    food: 'Chicken Sandwich',
    category: 'Snacks',
    rating: 4,
    time: 'Yesterday',
    text: 'Fresh and tasty sandwich. Service was quick too. A good option for a short break.',
    likes: 12,
    comments: 3,
    color: 'bg-green-100 text-green-700',
    edited: false,
  },
]

const categories = ['All Reviews', 'Food', 'Drinks', 'Snacks']

// Review Card Component
function ReviewCard({ review, liked, onLike }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">

      {/* Reviewer Information */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold ${review.color}`}
          >
            {review.initials}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {review.name}
            </h3>

            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Clock3 size={13} />
              {review.time}

              {review.edited && (
                <span className="ml-1">· Edited</span>
              )}
            </p>
          </div>

        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
          {review.category}
        </span>
      </div>

      {/* Food Information */}
      <div className="mt-5 rounded-xl bg-gray-50 p-4">

        <div className="flex flex-wrap items-center justify-between gap-2">

          <div>
            <p className="text-sm font-semibold text-gray-900">
              {review.food}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={13} />
              {review.shop}
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5">
            {[1, 2, 3, 4, 5].map((number) => (
              <Star
                key={number}
                size={15}
                className={
                  number <= review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }
              />
            ))}

            <span className="ml-1 text-sm font-semibold text-gray-700">
              {review.rating}.0
            </span>
          </div>

        </div>
      </div>

      {/* Review Text */}
      <p className="mt-4 text-sm leading-7 text-gray-600">
        {review.text}
      </p>

      {/* Like and Comment */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-2 text-sm font-medium transition ${
            liked
              ? 'text-rose-600'
              : 'text-gray-500 hover:text-rose-600'
          }`}
        >
          <Heart
            size={18}
            className={liked ? 'fill-current' : ''}
          />

          {review.likes + (liked ? 1 : 0)} Likes
        </button>

        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-orange-600"
        >
          <MessageCircle size={18} />
          {review.comments} Comments
        </button>

      </div>
    </article>
  )
}

// Main Review Feed Component
export default function ReviewFeed() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [reviews] = useState(initialReviews)
  const [likedReviews, setLikedReviews] = useState([])
  const [activeCategory, setActiveCategory] = useState('All Reviews')
  const [search, setSearch] = useState('')

  // Filter Reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesCategory =
      activeCategory === 'All Reviews' ||
      review.category === activeCategory

    const searchText = search.toLowerCase().trim()

    const matchesSearch =
      review.food.toLowerCase().includes(searchText) ||
      review.shop.toLowerCase().includes(searchText) ||
      review.text.toLowerCase().includes(searchText) ||
      review.name.toLowerCase().includes(searchText)

    return matchesCategory && matchesSearch
  })

  // Handle Like
  const handleLike = (reviewId) => {
    if (!user) {
      navigate('/login')
      return
    }

    setLikedReviews((previous) => {
      if (previous.includes(reviewId)) {
        return previous.filter((id) => id !== reviewId)
      }

      return [...previous, reviewId]
    })
  }

  // Handle Create Review
  const handleCreateReview = () => {
    if (!user) {
      navigate('/login')
      return
    }

    navigate('/reviews/new')
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-10 text-white sm:px-10 sm:py-14">

        <div className="relative z-10 max-w-2xl">

          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium">
            <Utensils size={14} />
            Your Campus Food Community
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            Discover food.
            <br />
            Share your experience.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-orange-50 sm:text-base">
            Explore honest food reviews from students and find the best
            places to eat around your campus.
          </p>

          <button
            type="button"
            onClick={handleCreateReview}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            <Plus size={18} />
            Write a Review
          </button>

        </div>

        <div className="pointer-events-none absolute -right-10 -top-12 hidden h-72 w-72 rounded-full border-[35px] border-white/10 sm:block" />

        <div className="pointer-events-none absolute -bottom-24 right-36 hidden h-56 w-56 rounded-full bg-white/10 sm:block" />

      </section>

      {/* Feed Heading and Search */}
      <section>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              CampusBite Community
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Latest Food Reviews
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              See what students are saying about campus food.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search food or shop..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

          </div>

        </div>

        {/* Category Filters */}
        <div className="mt-6 flex flex-wrap gap-2">

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {category}
            </button>
          ))}

        </div>
      </section>

      {/* Review List */}
      <section className="space-y-5">

        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              liked={likedReviews.includes(review.id)}
              onLike={() => handleLike(review.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">

            <Search
              size={30}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-3 font-semibold text-gray-800">
              No reviews found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try another search or category.
            </p>

          </div>
        )}

      </section>

      {/* Bottom Call to Action */}
      <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-6 text-center sm:flex-row sm:text-left">

        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Tried something delicious?
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Help other students discover great campus food.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateReview}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Share Your Review
          <ArrowRight size={17} />
        </button>

      </section>

    </div>
  )
}
