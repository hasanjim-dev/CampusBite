
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  Plus,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
export default function Events() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    image_url: ''
  })

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/events')

      if (response.data.success) {
        setEvents(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to load events.')
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load events.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)

      const payload = {
        ...formData,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        location: formData.location.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim()
      }

      const response = editingEventId
  ? await api.put(`/events/${editingEventId}`, payload)
  : await api.post('/events', payload)

      if (response.data.success) {
  alert(
    editingEventId
      ? 'Event updated successfully!'
      : 'Event created successfully!'
  )

  setFormData({
    name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    image_url: ''
  })

  setEditingEventId(null)
  setShowForm(false)
  await fetchEvents()
}
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to create event.'
      )
    } finally {
      setSubmitting(false)
    }
  }
const handleEditEvent = (event) => {
  setEditingEventId(event.id)

  setFormData({
    name: event.name || '',
    event_date: event.event_date
      ? String(event.event_date).split('T')[0]
      : '',
    start_time: event.start_time
      ? String(event.start_time).slice(0, 5)
      : '',
    end_time: event.end_time
      ? String(event.end_time).slice(0, 5)
      : '',
    location: event.location || '',
    description: event.description || '',
    image_url: event.image_url || ''
  })

  setShowForm(true)

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleDeleteEvent = async (event) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${event.name}"? This action cannot be undone.`
  )

  if (!confirmed) return

  try {
    const response = await api.delete(`/events/${event.id}`)

    if (response.data.success) {
      alert('Event deleted successfully!')

      setEvents(prev =>
        prev.filter(item => item.id !== event.id)
      )
    }
  } catch (err) {
    alert(
      err.response?.data?.message || 'Failed to delete event.'
    )
  }
}
  const formatDate = (date) => {
    if (!date) return 'Date not specified'

    const [year, month, day] = String(date).split('T')[0].split('-')

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
    if (!time) return 'Time not specified'

    const [hour, minute] = String(time).split(':')
    const date = new Date()

    date.setHours(Number(hour), Number(minute), 0, 0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const filteredEvents = events.filter(event => {
    const searchText = search.toLowerCase()

    return (
      event.name?.toLowerCase().includes(searchText) ||
      event.location?.toLowerCase().includes(searchText)
    )
  })

  return (
    <div className="max-w-6xl mx-auto pb-12">

      <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white mb-10">
        <p className="font-semibold text-orange-100 mb-3">
          CAMPUSBITE COMMUNITY
        </p>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Campus Events
        </h1>

        <p className="text-orange-50 max-w-xl">
          Discover campus food festivals, competitions and exciting student events.
        </p>
      </section>

      {isAdmin && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Close Form' : 'Create Event'}
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">
  {editingEventId ? 'Edit Event' : 'Create New Event'}
</h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={150}
                required
                placeholder="Enter event name"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                min={formData.start_time || undefined}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                maxLength={255}
                placeholder="Enter event location"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the event..."
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Event Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                maxLength={500}
                placeholder="https://example.com/event-image.jpg"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

          </div>

         <div className="mt-5 flex flex-wrap gap-3">
  <button
    type="submit"
    disabled={submitting}
    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-semibold"
  >
    {submitting
      ? 'Saving...'
      : editingEventId
        ? 'Update Event'
        : 'Create Event'}
  </button>

  {editingEventId && (
    <button
      type="button"
      onClick={() => {
        setEditingEventId(null)
        setShowForm(false)

        setFormData({
          name: '',
          event_date: '',
          start_time: '',
          end_time: '',
          location: '',
          description: '',
          image_url: ''
        })
      }}
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
    >
      Cancel Edit
    </button>
  )}
</div>
        </form>
      )}

      <div className="mb-7">
        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={19}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Upcoming Events
        </h2>

        <span className="text-sm text-gray-500">
          {filteredEvents.length} events found
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">
          Loading events...
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 text-orange-600 font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition"
            >
              {event.image_url ? (
                <img
                  src={getImageUrl(event.image_url)}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <CalendarDays size={55} className="text-white opacity-80" />
                </div>
              )}

              <div className="p-5">

                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  Campus Event
                </span>

                <h3 className="text-xl font-bold mt-4 mb-3">
                  {event.name}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {event.description || 'Join us for this campus event.'}
                </p>

                <div className="space-y-2 text-sm text-gray-600">

                  <p className="flex gap-2 items-center">
                    <CalendarDays size={17} className="text-orange-500" />
                    {formatDate(event.event_date)}
                  </p>

                  <p className="flex gap-2 items-center">
                    <Clock size={17} className="text-orange-500" />
                    {event.start_time
                      ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`
                      : 'Time not specified'}
                  </p>

                  <p className="flex gap-2 items-center">
                    <MapPin size={17} className="text-orange-500" />
                    {event.location || 'Location not specified'}
                  </p>

                </div>
{isAdmin && (
  <div className="grid grid-cols-2 gap-3 mt-5">
    <button
      onClick={() => handleEditEvent(event)}
      className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold"
    >
      Edit Event
    </button>

    <button
      onClick={() => handleDeleteEvent(event)}
      className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold"
    >
      Delete Event
    </button>
  </div>
)}
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="w-full mt-5 flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
                >
                  View Details <ArrowRight size={17} />
                </button>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-lg">No events found</h3>
          <p className="text-gray-500 mt-1">
            {search
              ? 'Try another search.'
              : 'No events have been created yet.'}
          </p>
        </div>
      )}

    </div>
  )
}
