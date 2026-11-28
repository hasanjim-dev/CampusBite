
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Share2,
  Store,
  Plus,
  Sparkles,
  CalendarCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Building2,
  ChevronRight,
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

function formatDate(date) {
  if (!date) return 'Date not specified'

  const [year, month, day] = String(date)
    .split('T')[0]
    .split('-')

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(time) {
  if (!time) return 'Not specified'

  const [hour, minute] = String(time).split(':')
  const date = new Date()

  date.setHours(Number(hour), Number(minute), 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white border border-gray-100 p-4">
      <span className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-orange-600" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-sm md:text-base font-bold text-gray-800 mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  )
}

function ShopCard({ shop }) {
  return (
    <div className="group bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4">
        {shop.logo_url ? (
          <img
            src={getImageUrl(shop.logo_url)}
            alt={shop.name}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
            <Store size={27} className="text-orange-600" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-gray-900 text-lg truncate group-hover:text-orange-600 transition-colors">
            {shop.name}
          </h3>

          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <MapPin size={14} className="text-orange-500 shrink-0" />
            <span className="truncate">
              {shop.location || 'Campus Shop'}
            </span>
          </p>
        </div>

        <span className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
          <ChevronRight size={18} className="text-gray-400" />
        </span>
      </div>

      {shop.description && (
        <p className="text-sm text-gray-500 leading-relaxed mt-5 pt-4 border-t border-gray-100 line-clamp-2">
          {shop.description}
        </p>
      )}

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-orange-600">
        <CheckCircle2 size={15} />
        Participating Shop
      </div>
    </div>
  )
}

function EventDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto pb-14 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-7" />
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
        <div className="h-64 md:h-96 bg-gray-200" />
        <div className="p-7 md:p-10 space-y-5">
          <div className="h-5 w-32 bg-gray-200 rounded-full" />
          <div className="h-9 w-2/3 bg-gray-200 rounded-lg" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-4/5 bg-gray-100 rounded" />
          <div className="grid sm:grid-cols-2 gap-4 pt-5">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="h-20 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [event, setEvent] = useState(null)
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingShop, setAddingShop] = useState(false)

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get(`/events/${id}`)

      if (response.data.success) {
        setEvent(response.data.data)
      } else {
        setError(response.data.message || 'Failed to load event.')
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load event details.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops')

      if (response.data.success) {
        setShops(response.data.shops || [])
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to load shops.'
      )
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [id])

  useEffect(() => {
    if (isAdmin) {
      fetchShops()
    }
  }, [isAdmin])

  const handleAddShop = async (e) => {
    e.preventDefault()

    if (!selectedShop) {
      alert('Please select a shop.')
      return
    }

    try {
      setAddingShop(true)

      const response = await api.post(`/events/${id}/shops`, {
        shop_id: Number(selectedShop),
      })

      if (response.data.success) {
        alert('Shop added to event successfully!')
        setSelectedShop('')
        await fetchEvent()
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to add shop to event.'
      )
    } finally {
      setAddingShop(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: event.description || '',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Event link copied!')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert('Unable to share event.')
      }
    }
  }

  if (loading) {
    return <EventDetailsSkeleton />
  }

  if (error || !event) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4">
        <div className="bg-white border border-gray-100 rounded-3xl px-6 py-16 text-center shadow-sm">
          <span className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={30} className="text-orange-600" />
          </span>

          <h2 className="text-2xl font-extrabold text-gray-900">
            {error || 'Event Not Found'}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            We couldn't find the event you're looking for.
          </p>

          <button
            onClick={() => navigate('/events')}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 px-6 py-3 text-sm font-bold text-white transition"
          >
            <ArrowLeft size={17} />
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const availableShops = shops.filter(
    shop => !event.shops?.some(
      eventShop => Number(eventShop.id) === Number(shop.id)
    )
  )

  return (
    <div className="max-w-6xl mx-auto pb-14 px-1">
      <button
        onClick={() => navigate('/events')}
        className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-7 transition-colors"
      >
        <span className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50 transition">
          <ArrowLeft size={17} />
        </span>
        Back to Events
      </button>

      <article className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="relative h-64 sm:h-80 md:h-[430px] bg-gradient-to-br from-orange-400 to-orange-700">
          {event.image_url ? (
            <img
              src={getImageUrl(event.image_url)}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <CalendarDays size={85} className="text-white/80" />
              <p className="text-white font-bold mt-4 text-lg">
                CampusBite Event
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          <div className="absolute top-5 left-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-orange-700 shadow">
              <Sparkles size={14} />
              Campus Event
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 md:left-10 md:bottom-10">
            <p className="text-sm font-bold text-orange-100 uppercase tracking-[0.2em] mb-3">
              CAMPUSBITE COMMUNITY
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
              {event.name}
            </h1>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-4">
                <CalendarCheck size={16} />
                Event Overview
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                About this event
              </h2>

              <p className="mt-4 text-gray-600 leading-8 whitespace-pre-line text-sm md:text-base">
                {event.description || 'No description available.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3 text-sm font-bold text-gray-700 transition"
              >
                <Share2 size={17} />
                Share Event
              </button>

              <button
                onClick={() => navigate('/events')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition"
              >
                Explore Events
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>

          <div className="mt-9">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <CalendarDays size={17} className="text-orange-600" />
              </span>
              <h3 className="font-extrabold text-gray-900">
                Event Information
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <DetailItem
                icon={CalendarDays}
                label="Event Date"
                value={formatDate(event.event_date)}
              />

              <DetailItem
                icon={Clock}
                label="Event Time"
                value={
                  event.start_time
                    ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`
                    : 'Not specified'
                }
              />

              <DetailItem
                icon={MapPin}
                label="Location"
                value={event.location || 'Not specified'}
              />

              <DetailItem
                icon={Users}
                label="Organizer"
                value={event.created_by_name || 'CampusBite Admin'}
              />
            </div>
          </div>
        </div>
      </article>

      <section className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 mb-2">
              Event Partners
            </p>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Participating Shops
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Discover the campus shops participating in this event.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 text-orange-700 px-4 py-2.5 text-sm font-bold w-fit">
            <Store size={17} />
            {event.shops?.length || 0} Shops
          </span>
        </div>

        {isAdmin && (
          <form
            onSubmit={handleAddShop}
            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 mb-7 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <Building2 size={21} className="text-orange-600" />
              </span>

              <div>
                <h3 className="font-extrabold text-gray-900">
                  Add a Participating Shop
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Select a shop to include in this event.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedShop}
                onChange={e => setSelectedShop(e.target.value)}
                className="flex-1 min-w-0 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              >
                <option value="">Select a shop</option>

                {availableShops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedShop || addingShop}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 text-sm font-bold transition"
              >
                {addingShop ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                {addingShop ? 'Adding...' : 'Add Shop'}
              </button>
            </div>

            {availableShops.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                No additional active shops available to add.
              </p>
            )}
          </form>
        )}

        {event.shops?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {event.shops.map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl py-16 px-6 text-center shadow-sm">
            <span className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <Store size={30} className="text-orange-500" />
            </span>

            <h3 className="text-xl font-extrabold text-gray-900">
              No participating shops yet
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Participating campus shops will appear here once they are added to this event.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
