import { useCallback, useEffect, useState } from 'react'
import {
  Bell,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  LoaderCircle,
  Megaphone,
  CalendarDays,
  Store,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
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
const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

function formatDate(date) {
  if (!date) return ''

  const value = new Date(date)

  if (Number.isNaN(value.getTime())) return ''

  return value.toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getInitials(name) {
  if (!name) return 'S'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Fetch protected attachments using Axios and JWT.
function AttachmentItem({ attachment }) {
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''

    const fetchAttachment = async () => {
      try {
        const response = await api.get(
          `/announcements/attachments/${attachment.id}`,
          { responseType: 'blob' }
        )

        objectUrl = URL.createObjectURL(response.data)

        if (active) {
          setFileUrl(objectUrl)
          setLoading(false)
        } else {
          URL.revokeObjectURL(objectUrl)
        }
      } catch (err) {
        let message = 'Unable to load this attachment.'

        if (err.response?.data instanceof Blob) {
          try {
            const errorText = await err.response.data.text()
            const errorData = JSON.parse(errorText)
            message = errorData.message || message
          } catch {
            // Keep the default error message.
          }
        } else {
          message = err.response?.data?.message || message
        }

        if (active) {
          setError(message)
          setLoading(false)
        }
      }
    }

    fetchAttachment()

    return () => {
      active = false

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [attachment.id])

  const isImage = attachment.mime_type?.startsWith('image/')
  const fileName = attachment.original_filename || 'Attachment'

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
        <LoaderCircle size={16} className="animate-spin" />
        Loading {fileName}...
      </div>
    )
  }

  if (error || !fileUrl) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
        {fileName}: {error || 'Attachment unavailable.'}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {isImage ? (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-72 w-full bg-gray-50 object-contain"
          />
        </a>
      ) : (
        <div className="flex items-center gap-3 bg-gray-50 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FileText size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">PDF document</p>
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-orange-600"
            title="Open PDF"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {isImage ? (
            <ImageIcon size={15} className="shrink-0 text-gray-400" />
          ) : (
            <FileText size={15} className="shrink-0 text-gray-400" />
          )}

          <span className="truncate text-xs text-gray-500">
            {fileName}
          </span>
        </div>

        <a
          href={fileUrl}
          download={fileName}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-orange-600 hover:bg-orange-50"
        >
          <Download size={14} />
          Download
        </a>
      </div>
    </div>
  )
}

export default function Announcements() {
  const { user } = useAuth()

  const isOwner = user?.role === 'shop_owner'
  const isAdmin = user?.role === 'admin'

  const [announcements, setAnnouncements] = useState([])
  const [shopName, setShopName] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    is_published: true,
  })

  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingAttachmentCount, setExistingAttachmentCount] = useState(0)

  const fetchAnnouncements = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      }


      const endpoint = isOwner
        ? '/announcements/my-announcements'
        : '/announcements'

      const response = await api.get(endpoint)
      setError('')

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to load announcements.'
        )
      }

      setAnnouncements(response.data.announcements || [])
      setShopName(response.data.shop?.name || '')
      setShopLogo(response.data.shop?.logo_url || '')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load announcements.'

      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isOwner])

  useEffect(() => {
    let active = true

    const loadAnnouncements = async () => {
      if (active) {
        await fetchAnnouncements()
      }
    }

    loadAnnouncements()

    return () => {
      active = false
    }
  }, [fetchAnnouncements])

  const openCreateForm = () => {
    setEditingId(null)

    setFormData({
      title: '',
      body: '',
      is_published: true,
    })

    setSelectedFiles([])
    setExistingAttachmentCount(0)
    setShowForm(true)
  }

  const openEditForm = (announcement) => {
    setEditingId(announcement.id)

    setFormData({
      title: announcement.title || '',
      body: announcement.body || '',
      is_published: Number(announcement.is_published) === 1,
    })

    setSelectedFiles([])
    setExistingAttachmentCount(announcement.attachments?.length || 0)
    setShowForm(true)
  }

  const closeForm = () => {
    if (submitting) return

    setShowForm(false)
    setEditingId(null)
    setSelectedFiles([])
    setExistingAttachmentCount(0)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])

    if (existingAttachmentCount + files.length > MAX_FILES) {
      const remaining = MAX_FILES - existingAttachmentCount

      toast.error(
        remaining <= 0
          ? 'This announcement already has the maximum of 3 attachments.'
          : `You can add only ${remaining} more attachment(s).`
      )

      event.target.value = ''
      return
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(
          `${file.name}: Only JPG, PNG, WEBP and PDF are allowed.`
        )
        event.target.value = ''
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Maximum file size is 5 MB.`)
        event.target.value = ''
        return
      }
    }

    setSelectedFiles(files)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Please provide both title and announcement body.')
      return
    }

    if (formData.title.trim().length > 150) {
      toast.error('Title cannot exceed 150 characters.')
      return
    }

    try {
      setSubmitting(true)

      const payload = new FormData()

      payload.append('title', formData.title.trim())
      payload.append('body', formData.body.trim())
      payload.append(
        'is_published',
        formData.is_published ? '1' : '0'
      )

      selectedFiles.forEach((file) => {
        payload.append('attachments', file)
      })

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload)
        toast.success('Announcement updated successfully.')
      } else {
        await api.post('/announcements', payload)
        toast.success('Announcement created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setSelectedFiles([])

      await fetchAnnouncements()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to save announcement.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (announcement) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${announcement.title}"?`
    )

    if (!confirmed) return

    try {
      await api.delete(`/announcements/${announcement.id}`)

      toast.success('Announcement deleted successfully.')

      setAnnouncements((previous) =>
        previous.filter((item) => item.id !== announcement.id)
      )
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to delete announcement.'
      )
    }
  }

  const filteredAnnouncements = announcements.filter((item) => {
    const term = search.toLowerCase().trim()

    const matchesSearch =
      !term ||
      item.title?.toLowerCase().includes(term) ||
      item.body?.toLowerCase().includes(term) ||
      item.shop_name?.toLowerCase().includes(term)

    const published = Number(item.is_published) === 1

    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && published) ||
      (filter === 'drafts' && !published)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-lg shadow-orange-200/50 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-100">
                <Bell size={17} />
                CAMPUSBITE COMMUNITY
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Announcements
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50 sm:text-base">
                Stay updated with the latest news, offers and updates
                from campus food shops.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/20 bg-white/15 sm:self-center">
              <Megaphone size={34} />
            </div>
          </div>
        </div>

        {/* Owner Shop Information */}
        {isOwner && shopName && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-100 text-orange-600">
              {shopLogo ? (
                <img
                  src={getImageUrl(shopLogo)}
                  alt={shopName}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store size={20} />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-orange-600">
                MANAGING ANNOUNCEMENTS FOR
              </p>
              <p className="font-bold text-gray-800">{shopName}</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchAnnouncements(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
            >
              <Plus size={18} />
              Create Announcement
            </button>
          )}
        </div>

        {/* Owner Filters */}
        {isOwner && (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'published', label: 'Published' },
              { value: 'drafts', label: 'Drafts' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === item.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20">
            <LoaderCircle
              size={34}
              className="animate-spin text-orange-500"
            />
            <p className="mt-3 text-sm font-medium text-gray-500">
              Loading announcements...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Bell size={22} />
            </div>

            <h3 className="mt-4 font-bold text-gray-800">
              Unable to load announcements
            </h3>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchAnnouncements()}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAnnouncements.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
              <Megaphone size={30} />
            </div>

            <h3 className="mt-5 text-lg font-black text-gray-800">
              {search
                ? 'No matching announcements'
                : isOwner
                  ? 'No announcements yet'
                  : 'No announcements available'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {isOwner
                ? 'Create your first announcement to share updates with campus students.'
                : 'Shop announcements will appear here when they are published.'}
            </p>

            {isOwner && !search && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <Plus size={17} />
                Create Announcement
              </button>
            )}
          </div>
        )}

        {/* Announcement Feed */}
        {!loading && !error && filteredAnnouncements.length > 0 && (
          <div className="space-y-5">
            {filteredAnnouncements.map((announcement) => {
              const published =
                Number(announcement.is_published) === 1

              const shopLabel =
                announcement.shop_name || shopName || 'Campus Shop'

              return (
                <article
                  key={announcement.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">

                    {/* Shop Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {announcement.shop_logo ? (
                          <img
                            src={getImageUrl(announcement.shop_logo)}
                            alt={shopLabel}
                            className="h-12 w-12 rounded-xl border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-black text-orange-600">
                            {getInitials(shopLabel)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-gray-800 sm:text-base">
                            {shopLabel}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <CalendarDays size={13} />
                            <span>
                              {formatDate(announcement.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(isOwner || isAdmin) && (
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                            published
                              ? 'bg-green-50 text-green-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {published ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </div>

                    {/* Announcement Content */}
                    <div className="mt-5">
                      <h2 className="text-xl font-black leading-snug text-gray-900 sm:text-2xl">
                        {announcement.title}
                      </h2>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                        {announcement.body}
                      </p>
                    </div>

                    {/* Attachments */}
                    {announcement.attachments?.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                          <Paperclip size={14} />
                          Attachments ({announcement.attachments.length})
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {announcement.attachments.map((attachment) => (
                            <AttachmentItem
                              key={attachment.id}
                              attachment={attachment}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Owner/Admin Actions */}
                    {(isOwner || isAdmin) && (
                      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => openEditForm(announcement)}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(announcement)}
                          className="flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredAnnouncements.length > 0 && (
          <p className="mt-6 text-center text-xs font-medium text-gray-400">
            Showing {filteredAnnouncements.length} announcement(s)
          </p>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && isOwner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingId ? 'Edit Announcement' : 'Create Announcement'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Share important updates with campus students.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Announcement Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={150}
                  required
                  placeholder="Enter announcement title"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {formData.title.length}/150
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Announcement Details *
                </label>

                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Write your announcement..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Attachment Input */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Attachments
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-orange-300 hover:bg-orange-50/50">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Paperclip size={21} />
                  </div>

                  <span className="mt-3 text-sm font-bold text-gray-700">
                    Choose files to upload
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    JPG, PNG, WEBP or PDF | Max 3 files | 5 MB each
                  </span>

                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
                      >
                        <FileText
                          size={18}
                          className="shrink-0 text-orange-500"
                        />

                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                          {file.name}
                        </span>

                        <span className="shrink-0 text-[10px] text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {editingId
                    ? 'New files will be added to the existing attachments.'
                    : 'Attachments are optional.'}
                </p>
              </div>

              {/* Publish Toggle */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      is_published: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-orange-500"
                />

                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    {formData.is_published ? (
                      <Eye size={16} className="text-green-600" />
                    ) : (
                      <EyeOff size={16} className="text-amber-600" />
                    )}

                    {formData.is_published
                      ? 'Publish immediately'
                      : 'Save as draft'}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {formData.is_published
                      ? 'Students and other authenticated users can see this announcement.'
                      : 'Only you can see this announcement in your management list.'}
                  </p>
                </div>
              </label>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <Pencil size={16} />
                      ) : (
                        <Plus size={17} />
                      )}

                      {editingId
                        ? 'Save Changes'
                        : 'Create Announcement'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



