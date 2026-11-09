
import { useState } from 'react'
import {
  Star,
  MessageSquare,
  Utensils,
  TrendingUp,
  Clock,
  ArrowRight,
  Store,
} from 'lucide-react'

export default function OwnerDashboard() {
  const [reviews] = useState([
    {
      id: 1,
      name: 'Nusrat Jahan',
      food: 'Chicken Burger',
      rating: 5,
      comment: 'Food quality was excellent. Really enjoyed it!',
      time: '2 hours ago',
    },
    {
      id: 2,
      name: 'Sakib Ahmed',
      food: 'Cold Coffee',
      rating: 4,
      comment: 'Good taste and reasonable price.',
      time: '5 hours ago',
    },
    {
      id: 3,
      name: 'Anonymous',
      food: 'Chicken Sandwich',
      rating: 3,
      comment: 'Taste was good, but service was a little slow.',
      time: 'Yesterday',
    },
  ])

  const stats = [
    {
      title: 'Total Reviews',
      value: '128',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      change: '+12 this month',
    },
    {
      title: 'Average Rating',
      value: '4.5',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
      change: 'Out of 5 stars',
    },
    {
      title: 'Menu Items',
      value: '24',
      icon: Utensils,
      color: 'bg-green-100 text-green-600',
      change: 'Available items',
    },
    {
      title: 'Monthly Growth',
      value: '+18%',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      change: 'Compared to last month',
    },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-orange-500 font-semibold mb-1">
            SHOP OWNER PANEL
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Welcome back! Here's what's happening with your shop.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-3 rounded-xl">
          <Store size={20} />
          <span className="font-semibold">Food Court</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </h2>
                </div>

                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                {stat.change}
              </p>
            </div>
          )
        })}
      </div>

      {/* Shop Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              My Shop
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your shop information at a glance
            </p>
          </div>

          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium w-fit">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div>
            <p className="text-sm text-gray-500">Shop Name</p>
            <p className="font-semibold text-gray-800 mt-1">
              Food Court
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold text-gray-800 mt-1">
              Campus Main Building
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Opening Hours</p>
            <p className="font-semibold text-gray-800 mt-1">
              9:00 AM - 8:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Recent Reviews
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest feedback from students
            </p>
          </div>

          <MessageSquare className="text-orange-500" size={22} />
        </div>

        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 hover:bg-gray-50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {review.name}
                  </h3>

                  <p className="text-sm text-orange-600 mt-1">
                    {review.food}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <Star
                      key={number}
                      size={16}
                      className={
                        number <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-sm mt-3">
                {review.comment}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                <Clock size={14} />
                {review.time}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            Showing demo reviews
          </p>
        </div>
      </div>

    </div>
  )
}
