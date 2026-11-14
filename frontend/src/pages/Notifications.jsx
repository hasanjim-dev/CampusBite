
import { useEffect, useState } from 'react'
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
  LoaderCircle,
  MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  shop: Store,
  event: CalendarDays,
  review: MessageSquare,
}

const notificationColors = {
  like: 'bg-red-100 text-red-500',
  comment: 'bg-blue-100 text-blue-500',
  shop: 'bg-orange-100 text-orange-500',
  event: 'bg-purple-100 text-purple-500',
  review: 'bg-green-100 text-green-500',
}

function formatTime(date) {
  if (!date) return ''

  const notificationDate = new Date(date)

  if (Number.isNaN(notificationDate.getTime())) return ''

  return notificationDate.toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      const [notificationsResponse, unreadResponse] = await Promise.all([
        api.get('/notifications?page=1&limit=100'),
        api.get('/notifications/unread-count'),
      ])

      const data = notificationsResponse.data.data || []

      setNotifications(
        data.map((item) => ({
          ...item,
          read: Boolean(item.is_read),
          title: getNotificationTitle(item.type),
          time: formatTime(item.created_at),
        }))
      )

      setUnreadCount(
        Number(unreadResponse.data.data?.unread_count || 0)
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTitle = (type) => {
    const titles = {
      like: 'New Like on Your Review',
      comment: 'New Comment',
      shop: 'Shop Update',
      event: 'Event Update',
      review: 'Review Update',
      announcement: 'New Announcement',
    }

    return titles[type] || 'CampusBite Notification'
  }

  const markAsRead = async (id) => {
    try {
      setProcessing(`read-${id}`)

      await api.patch(`/notifications/${id}/read`)

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      )

      setUnreadCount((current) => Math.max(0, current - 1))
      toast.success('Notification marked as read.')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update notification.'
      )
    } finally {
      setProcessing(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)

      await api.patch('/notifications/read-all')

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      )

      setUnreadCount(0)
      toast.success('All notifications marked as read.')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update notifications.'
      )
    } finally {
      setMarkingAll(false)
    }
  }

  const deleteNotification = async (id) => {
    const item = notifications.find(
      (notification) => notification.id === id
    )

    try {
      setProcessing(`delete-${id}`)

      await api.delete(`/notifications/${id}`)

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      )

      if (item && !item.read) {
        setUnreadCount((current) => Math.max(0, current - 1))
      }

      toast.success('Notification deleted.')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete notification.'
      )
    } finally {
      setProcessing(null)
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.read
    return true
  })

  const handleNotificationClick = async (item) => {
    if (!item.read) {
      await markAsRead(item.id)
    }

    if (item.related_type && item.related_id) {
      const routes = {
        shop: `/shops/${item.related_id}`,
        food: `/shops`,
        food_item: `/shops`,
        review: `/reviews`,
        event: `/events/${item.related_id}`,
        announcement: `/announcements`,
      }

      const route = routes[item.related_type]

      if (route) navigate(route)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
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
          disabled={unreadCount === 0 || markingAll}
          className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {markingAll ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <CheckCheck size={18} />
          )}
          Mark all as read
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <LoaderCircle
              size={38}
              className="animate-spin text-orange-500"
            />
            <p className="mt-4 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const Icon =
              notificationIcons[item.type] || Bell

            const color =
              notificationColors[item.type] ||
              'bg-gray-100 text-gray-500'

            return (
              <div
                key={item.id}
                className={`flex gap-4 border-b border-gray-100 p-5 transition last:border-b-0 ${
                  !item.read ? 'bg-orange-50/40' : 'bg-white'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleNotificationClick(item)}
                      className="flex items-center gap-2 text-left"
                    >
                      <h3 className="font-semibold text-gray-900 hover:text-orange-600">
                        {item.title}
                      </h3>

                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                      )}
                    </button>

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
                        disabled={processing === `read-${item.id}`}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      disabled={processing === `delete-${item.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      {processing === `delete-${item.id}` ? (
                        <LoaderCircle
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={13} />
                      )}
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
