
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
  Plus
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

  const formatDate = (date) => {
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
      day: 'numeric'
    })
  }

  const formatTime = (time) => {
    if (!time) return 'Not specified'

    const [hour, minute] = String(time).split(':')
    const date = new Date()

    date.setHours(Number(hour), Number(minute), 0, 0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleAddShop = async (e) => {
    e.preventDefault()

    if (!selectedShop) {
      alert('Please select a shop.')
      return
    }

    try {
      setAddingShop(true)

      const response = await api.post(`/events/${id}/shops`, {
        shop_id: Number(selectedShop)
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
          url: window.location.href
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
    return (
      <div className="py-20 text-center text-gray-500">
        Loading event details...
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {error || 'Event Not Found'}
        </h2>

        <button
          onClick={() => navigate('/events')}
          className="mt-5 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Back to Events
        </button>
      </div>
    )
  }

  const availableShops = shops.filter(
    shop => !event.shops?.some(
      eventShop => Number(eventShop.id) === Number(shop.id)
    )
  )

  return (
    <div className="mx-auto max-w-5xl pb-12">

      <button
        onClick={() => navigate('/events')}
        className="mb-6 flex items-center gap-2 font-medium text-gray-600 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back to Events
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {event.image_url ? (
          <img
          src={getImageUrl(event.image_url)}
            alt={event.name}
            className="h-64 w-full object-cover sm:h-96"
          />
        ) : (
          <div className="h-64 w-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center sm:h-96">
            <CalendarDays size={80} className="text-white opacity-80" />
          </div>
        )}

        <div className="p-6 sm:p-9">

          <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-600">
            Campus Event
          </span>

          <h1 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            {event.name}
          </h1>

          <p className="mt-4 leading-7 text-gray-600 whitespace-pre-line">
            {event.description || 'No description available.'}
          </p>

          <div className="mt-8 grid gap-5 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(event.event_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold text-gray-800">
                  {event.start_time
                    ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`
                    : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-800">
                  {event.location || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="font-semibold text-gray-800">
                  {event.created_by_name || 'CampusBite Admin'}
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              onClick={() => navigate('/events')}
              className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Explore More Events
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Share2 size={18} />
              Share Event
            </button>

          </div>
        </div>
      </div>

      {/* Participating Shops */}

      <section className="mt-10">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Participating Shops
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Shops participating in this event
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {event.shops?.length || 0} shops
          </span>
        </div>

        {isAdmin && (
          <form
            onSubmit={handleAddShop}
            className="bg-white border border-gray-200 rounded-xl p-5 mb-6"
          >
            <h3 className="font-bold text-gray-900 mb-3">
              Add Shop to Event
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">

              <select
                value={selectedShop}
                onChange={e => setSelectedShop(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
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
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold"
              >
                <Plus size={18} />
                {addingShop ? 'Adding...' : 'Add Shop'}
              </button>

            </div>

            {availableShops.length === 0 && (
              <p className="text-sm text-gray-500 mt-3">
                No additional active shops available to add.
              </p>
            )}
          </form>
        )}

        {event.shops?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {event.shops.map(shop => (
              <div
                key={shop.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">

                  {shop.logo_url ? (
                    <img
                      src={getImageUrl(shop.logo_url)}
                      alt={shop.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                      <Store size={25} className="text-orange-600" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {shop.location || 'Campus Shop'}
                    </p>
                  </div>

                </div>

                {shop.description && (
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                    {shop.description}
                  </p>
                )}

              </div>
            ))}

          </div>
        ) : (
          <div className="bg-white border rounded-xl py-12 text-center">
            <Store size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-800">
              No shops added yet
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Participating shops will appear here.
            </p>
          </div>
        )}

      </section>

    </div>
  )
}
