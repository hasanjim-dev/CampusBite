
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Heart,
  MessageCircle,
  Store,
  CalendarDays,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Clock,
} from 'lucide-react'

const initialNotifications = [
  {
    id: 1,
    type: 'like',
    title: 'New Like on Your Review',
    message: 'Sakib Ahmed liked your review of Chicken Burger.',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    title: 'New Comment',
    message: 'Nusrat Jahan commented on your food review.',
    time: '30 minutes ago',
    read: false,
  },
  {
    id: 3,
    type: 'shop',
    title: 'Shop Update',
    message: 'Food Court has updated its menu.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 4,
    type: 'event',
    title: 'Upcoming Event',
    message: 'Campus Food Festival is coming soon!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'like',
    title: 'Review Appreciation',
    message: 'Someone liked your review of Cold Coffee.',
    time: '2 days ago',
    read: true,
  },
]

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  shop: Store,
  event: CalendarDays,
}

const notificationColors = {
  like: 'bg-red-100 text-red-500',
  comment: 'bg-blue-100 text-blue-500',
  shop: 'bg-orange-100 text-orange-500',
  event: 'bg-purple-100 text-purple-500',
}

export default function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(
    initialNotifications
  )
  const [activeTab, setActiveTab] = useState('all')

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.read
    return true
  })

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-3">
            <Bell className="text-orange-500" size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>
            <p className="mt-1 text-gray-500">
              Stay updated with your CampusBite activities.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-orange-50 px-4 py-2">
          <p className="text-sm font-semibold text-orange-600">
            {unreadCount} Unread
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab === 'unread'
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={18} />
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const Icon = notificationIcons[item.type]

            return (
              <div
                key={item.id}
                className={`flex gap-4 border-b border-gray-100 p-5 transition last:border-b-0 ${
                  !item.read ? 'bg-orange-50/40' : 'bg-white'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    notificationColors[item.type]
                  }`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={13} />
                      {item.time}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {item.message}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4">
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-5 py-16 text-center">
            <Bell size={45} className="mx-auto text-gray-300" />

            <h3 className="mt-4 text-xl font-bold text-gray-800">
              No Notifications
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              You're all caught up! There are no notifications here.
            </p>

            {activeTab === 'unread' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-5 font-semibold text-orange-600 hover:text-orange-700"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft size={17} />
        Back to Reviews
      </button>
    </div>
  )
}
