
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  Plus,
  X,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  CalendarCheck,
  RefreshCw,
  AlertCircle,
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

const initialFormData = {
  name: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  description: '',
  image_url: '',
}

function formatDate(date) {
  if (!date) return 'Date not specified'

  const [year, month, day] = String(date).split('T')[0].split('-')

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
  if (!time) return 'Time not specified'

  const [hour, minute] = String(time).split(':')
  const date = new Date()

  date.setHours(Number(hour), Number(minute), 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-gray-500 mt-2">
          {description}
        </p>
      )}
    </div>
  )
}

function EventCard({ event, isAdmin, onEdit, onDelete, onView }) {
  return (
    <article className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-56 overflow-hidden bg-orange-50">
        {event.image_url ? (
          <img
            src={getImageUrl(event.image_url)}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100">
            <CalendarDays size={55} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-500 mt-3">
              Campus Event
            </span>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
            <Sparkles size={13} />
            Campus Event
          </span>
        </div>

        <div className="absolute bottom-4 left-4 rounded-2xl bg-white shadow-lg px-3 py-2 text-center min-w-[62px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
            {event.event_date
              ? new Date(`${String(event.event_date).split('T')[0]}T00:00:00`).toLocaleDateString('en-US', { month: 'short' })
              : 'DATE'}
          </p>
          <p className="text-xl font-extrabold text-gray-900 leading-tight">
            {event.event_date
              ? new Date(`${String(event.event_date).split('T')[0]}T00:00:00`).getDate()
              : '--'}
          </p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <h3 className="text-xl font-extrabold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {event.name}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mt-3 mb-5 line-clamp-2 min-h-10">
          {event.description || 'Join us for this exciting campus event.'}
        </p>

        <div className="space-y-3 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <CalendarDays size={17} className="text-orange-600" />
            </span>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                Event date
              </p>
              <p className="font-semibold text-gray-800">
                {formatDate(event.event_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Clock size={17} className="text-orange-600" />
            </span>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                Event time
              </p>
              <p className="font-semibold text-gray-800">
                {event.start_time
                  ? `${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`
                  : 'Time not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin size={17} className="text-orange-600" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                Location
              </p>
              <p className="font-semibold text-gray-800 truncate">
                {event.location || 'Location not specified'}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => onEdit(event)}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 py-3 text-sm font-bold hover:bg-blue-100 transition-colors"
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              onClick={() => onDelete(event)}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-red-600 py-3 text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        )}

        <button
          onClick={() => onView(event)}
          className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-orange-600 text-white py-3.5 font-bold text-sm transition-all duration-200"
        >
          Explore Event
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  )
}

function EventSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(item => (
        <div
          key={item}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="h-56 bg-gray-100" />
          <div className="p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded-lg w-full" />
            <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
            <div className="h-12 bg-gray-100 rounded-xl mt-6" />
          </div>
        </div>
      ))}
    </div>
  )
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

  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile)
      setImagePreview(previewUrl)

      return () => URL.revokeObjectURL(previewUrl)
    }

    setImagePreview(
      formData.image_url ? getImageUrl(formData.image_url) : ''
    )
  }, [imageFile, formData.image_url])

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

  const resetForm = () => {
    setFormData(initialFormData)
    setImageFile(null)
    setEditingEventId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, PNG and WEBP images are allowed.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size cannot exceed 5 MB.')
      e.target.value = ''
      return
    }

    setImageFile(file)
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)

      const payload = new FormData()
      payload.append('name', formData.name.trim())
      payload.append('event_date', formData.event_date)
      payload.append('location', formData.location.trim())
      payload.append('description', formData.description.trim())

      if (formData.start_time) {
        payload.append('start_time', formData.start_time)
      }

      if (formData.end_time) {
        payload.append('end_time', formData.end_time)
      }

      if (imageFile) {
        payload.append('image', imageFile)
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

        resetForm()
        setShowForm(false)
        await fetchEvents()
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to save event.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEvent = (event) => {
    setImageFile(null)
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
      image_url: event.image_url || '',
    })

    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
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

  const filteredEvents = events.filter(event => {
    const searchText = search.toLowerCase().trim()

    return (
      event.name?.toLowerCase().includes(searchText) ||
      event.location?.toLowerCase().includes(searchText) ||
      event.description?.toLowerCase().includes(searchText)
    )
  })

  return (
    <div className="max-w-7xl mx-auto pb-14 px-1">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-7 py-10 md:px-12 md:py-14 mb-10 shadow-xl shadow-orange-600/10">
        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border-[35px] border-white/10" />
        <div className="absolute right-24 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-xs font-bold tracking-wider text-orange-50 mb-6">
            <Sparkles size={14} />
            CAMPUSBITE COMMUNITY
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Campus Events
            <span className="block text-orange-100">
              Make memories together.
            </span>
          </h1>

          <p className="text-orange-50/90 text-sm md:text-base leading-relaxed mt-5 max-w-xl">
            Discover food festivals, competitions and exciting events happening around your campus. Find your next campus experience.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/20 px-4 py-3 text-white text-sm font-semibold">
              <CalendarCheck size={18} />
              {events.length} Events
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/20 px-4 py-3 text-white text-sm font-semibold">
              <MapPin size={18} />
              Campus Community
            </div>
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              if (showForm) {
                resetForm()
              }
              setShowForm(!showForm)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-3.5 font-bold shadow-lg shadow-orange-600/15 transition-all"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Close Form' : 'Create Event'}
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 mb-10 shadow-xl shadow-gray-900/5"
        >
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
                Event Management
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {editingEventId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {editingEventId
                  ? 'Update the event information below.'
                  : 'Share an exciting new event with your campus community.'}
              </p>
            </div>

            <span className="hidden sm:flex w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center">
              <CalendarDays size={23} className="text-orange-600" />
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                min={formData.start_time || undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                maxLength={255}
                placeholder="Enter event location"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the event and what participants can expect..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none resize-y focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Event Image
              </label>

              <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 px-5 py-8 text-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition">
                <span className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <Upload size={22} className="text-orange-600" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-gray-800">
                    Click to upload event image
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    JPG, JPEG, PNG or WEBP · Maximum 5 MB
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative mt-4 max-w-lg overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-56 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 shadow">
                    Image Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-7 py-3.5 font-bold shadow-lg shadow-orange-600/15 transition"
            >
              {submitting ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <CalendarCheck size={17} />
              )}
              {submitting
                ? 'Saving...'
                : editingEventId
                  ? 'Update Event'
                  : 'Create Event'}
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <SectionHeading
          eyebrow="Explore & Discover"
          title="Upcoming Events"
          description="Find something exciting happening in your campus community."
        />

        <div className="relative w-full md:w-80 md:mb-7">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{filteredEvents.length}</span> events
        </p>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-sm font-bold text-orange-600 hover:text-orange-700"
          >
            Clear search
          </button>
        )}
      </div>

      {loading ? (
        <EventSkeleton />
      ) : error ? (
        <div className="bg-white border border-red-100 rounded-3xl px-6 py-16 text-center shadow-sm">
          <span className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={27} className="text-red-500" />
          </span>
          <h3 className="text-lg font-extrabold text-gray-900">
            Unable to load events
          </h3>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-6 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onView={event => navigate(`/events/${event.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl px-6 py-20 text-center shadow-sm">
          <span className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            {search ? (
              <Search size={29} className="text-orange-500" />
            ) : (
              <ImageIcon size={29} className="text-orange-500" />
            )}
          </span>
          <h3 className="text-xl font-extrabold text-gray-900">
            {search ? 'No matching events' : 'No events available yet'}
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            {search
              ? 'Try searching with another event name, location or keyword.'
              : 'There are no events to show right now. Check back later for exciting campus activities.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-6 text-sm font-bold text-orange-600 hover:text-orange-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
