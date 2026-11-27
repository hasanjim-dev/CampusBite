
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
  Sparkles,
  BellRing,
  Inbox,
  ArrowUpRight,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  shop: Store,
  event: CalendarDays,
  review: MessageSquare,
  announcement: BellRing,
}

const notificationStyles = {
  like: 'bg-rose-50 text-rose-600 ring-rose-100',
  comment: 'bg-blue-50 text-blue-600 ring-blue-100',
  shop: 'bg-orange-50 text-orange-600 ring-orange-100',
  event: 'bg-violet-50 text-violet-600 ring-violet-100',
  review: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  announcement: 'bg-amber-50 text-amber-700 ring-amber-100',
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

      setUnreadCount(Number(unreadResponse.data.data?.unread_count || 0))
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
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
        food: '/shops',
        food_item: '/shops',
        review: '/reviews',
        event: `/events/${item.related_id}`,
        announcement: '/announcements',
      }

      const route = routes[item.related_type]

      if (route) navigate(route)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">

      {/* HEADER */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-800 via-orange-600 to-amber-500 px-6 py-9 text-white shadow-2xl shadow-orange-900/15 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold tracking-wider text-white backdrop-blur-sm">
              <Sparkles size={14} />
              CAMPUSBITE UPDATES
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Your Notifications
            </h1>

            <p className="mt-3 max-w-md text-sm leading-7 text-orange-50 sm:text-base">
              Stay connected with everything happening around your campus food community.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-md sm:self-auto">
            <div className="rounded-xl bg-white/20 p-3">
              <BellRing size={27} />
            </div>
            <div>
              <p className="text-3xl font-black tabular-nums">
                {unreadCount}
              </p>
              <p className="text-xs font-semibold text-orange-50">
                Unread messages
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap gap-5 border-t border-white/20 pt-5 text-xs font-medium text-orange-50">
          <span className="flex items-center gap-2">
            <CheckCheck size={15} />
            Stay informed
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle size={15} />
            Community updates
          </span>
          <span className="flex items-center gap-2">
            <Bell size={15} />
            Important alerts
          </span>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-600" />
            Your Activity
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
            Recent Updates
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            All your important updates in one place.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || markingAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {markingAll ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <CheckCheck size={17} />
          )}
          Mark all as read
        </button>
      </section>

      {/* TABS */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm backdrop-blur-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            All Notifications
            <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              activeTab === 'unread'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            Unread
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
              activeTab === 'unread'
                ? 'bg-white/20'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {unreadCount}
            </span>
          </button>
        </div>

        <span className="px-3 text-xs font-semibold text-gray-500">
          {filteredNotifications.length} results
        </span>
      </section>

      {/* NOTIFICATION LIST */}
      <section className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/80 py-20 shadow-sm">
            <div className="rounded-2xl bg-orange-50 p-4">
              <LoaderCircle size={34} className="animate-spin text-orange-600" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-600">
              Loading your notifications...
            </p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const Icon = notificationIcons[item.type] || Bell
            const color =
              notificationStyles[item.type] ||
              'bg-gray-100 text-gray-500 ring-gray-200'

            return (
              <article
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 sm:p-6 ${
                  !item.read
                    ? 'border-orange-200 bg-white shadow-md shadow-orange-900/5'
                    : 'border-white/80 bg-white/75 shadow-sm hover:border-orange-100 hover:bg-white hover:shadow-lg'
                }`}
              >
                {!item.read && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-orange-500 to-amber-400" />
                )}

                <div className="flex gap-4 sm:gap-5">
                  <button
                    onClick={() => handleNotificationClick(item)}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105 sm:h-14 sm:w-14 ${color}`}
                    aria-label="Open notification"
                  >
                    <Icon size={23} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <button
                          onClick={() => handleNotificationClick(item)}
                          className="flex flex-wrap items-center gap-2 text-left"
                        >
                          <h3 className="text-sm font-extrabold text-gray-900 transition group-hover:text-orange-700 sm:text-base">
                            {item.title}
                          </h3>

                          {!item.read && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                              New
                            </span>
                          )}
                        </button>

                        <p className="mt-2 text-sm leading-7 text-gray-600">
                          {item.message}
                        </p>
                      </div>

                      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray-400">
                        <Clock size={13} />
                        {item.time}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div className="flex flex-wrap gap-3">
                        {!item.read && (
                          <button
                            onClick={() => markAsRead(item.id)}
                            disabled={processing === `read-${item.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                          >
                            {processing === `read-${item.id}` ? (
                              <LoaderCircle size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Mark as read
                          </button>
                        )}

                        {item.related_type && item.related_id && (
                          <button
                            onClick={() => handleNotificationClick(item)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                          >
                            View details
                            <ArrowUpRight size={13} />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => deleteNotification(item.id)}
                        disabled={processing === `delete-${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {processing === `delete-${item.id}` ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-3xl border border-white/80 bg-white/80 px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100 text-orange-500">
              {activeTab === 'unread' ? (
                <CheckCheck size={38} />
              ) : (
                <Inbox size={38} />
              )}
            </div>

            <h3 className="mt-5 text-xl font-black text-gray-900">
              {activeTab === 'unread'
                ? "You're all caught up!"
                : 'No Notifications Yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-500">
              {activeTab === 'unread'
                ? 'You have no unread notifications. Enjoy exploring your campus food community.'
                : "When something happens in your CampusBite community, you'll see it here."}
            </p>

            {activeTab === 'unread' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-6 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe5d2] pt-5">
        <p className="text-xs font-medium text-gray-500">
          Keeping you connected to your campus community.
        </p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-white hover:text-orange-700"
        >
          <ArrowLeft size={17} />
          Back to Reviews
        </button>
      </div>
    </div>
  )
}
