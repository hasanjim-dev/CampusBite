
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
  Sparkles,
  ArrowUpRight,
  Send,
  Clock3,
  ShieldCheck,
  FileImage,
  CircleCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

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
            // Keep default error message.
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
      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <LoaderCircle size={19} className="animate-spin" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-700">
            {fileName}
          </p>
          <p className="mt-1 text-xs text-gray-400">Loading attachment...</p>
        </div>
      </div>
    )
  }

  if (error || !fileUrl) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        <p className="font-bold">{fileName}</p>
        <p className="mt-1 text-xs">{error || 'Attachment unavailable.'}</p>
      </div>
    )
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-orange-200 hover:shadow-md">
      {isImage ? (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-72 w-full bg-gray-50 object-contain transition duration-500 group-hover:scale-[1.01]"
          />
        </a>
      ) : (
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FileText size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800">
              {fileName}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">
              PDF document
            </p>
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white p-2.5 text-gray-500 shadow-sm transition hover:text-orange-600"
            title="Open PDF"
          >
            <ExternalLink size={17} />
          </a>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {isImage ? (
            <ImageIcon size={15} className="shrink-0 text-emerald-500" />
          ) : (
            <FileText size={15} className="shrink-0 text-red-500" />
          )}
          <span className="truncate text-xs font-medium text-gray-500">
            {fileName}
          </span>
        </div>

        <a
          href={fileUrl}
          download={fileName}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
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

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to load announcements.'
        )
      }

      setError('')
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
    fetchAnnouncements()
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
      setExistingAttachmentCount(0)

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

  const publishedCount = announcements.filter(
    (item) => Number(item.is_published) === 1
  ).length

  const draftCount = announcements.length - publishedCount

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">

      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-800 via-orange-600 to-amber-500 px-6 py-9 text-white shadow-2xl shadow-orange-900/15 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold tracking-wider text-white backdrop-blur-sm">
              <Sparkles size={14} />
              CAMPUSBITE COMMUNITY
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Announcements
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-orange-50 sm:text-base">
              Stay connected with the latest news, important updates and
              announcements from your campus food community.
            </p>

            <div className="mt-7 flex flex-wrap gap-5 border-t border-white/20 pt-5 text-xs font-semibold text-orange-50">
              <span className="flex items-center gap-2">
                <Bell size={15} />
                Community updates
              </span>
              <span className="flex items-center gap-2">
                <Store size={15} />
                Campus shops
              </span>
              <span className="flex items-center gap-2">
                <Paperclip size={15} />
                Photos and documents
              </span>
            </div>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-md sm:h-28 sm:w-28 sm:self-center">
            <Megaphone size={49} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* OWNER SHOP INFORMATION */}
      {isOwner && shopName && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-orange-600">
              {shopLogo ? (
                <img
                  src={getImageUrl(shopLogo)}
                  alt={shopName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Store size={22} />
              )}
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600">
                Managing announcements for
              </p>
              <p className="mt-1 font-black text-gray-900">{shopName}</p>
            </div>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <ShieldCheck size={15} />
            Owner workspace
          </span>
        </section>
      )}

      {/* OWNER STATS */}
      {isOwner && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Total</span>
              <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
                <Megaphone size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black tabular-nums text-gray-900">
              {announcements.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">Announcements</p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Published</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CircleCheck size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black tabular-nums text-gray-900">
              {publishedCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">Visible to students</p>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Drafts</span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <EyeOff size={18} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black tabular-nums text-gray-900">
              {draftCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">Not published</p>
          </div>
        </section>
      )}

      {/* TOOLBAR */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-600" />
              Stay Informed
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
              Latest Updates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Explore what's happening around campus.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchAnnouncements(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition hover:-translate-y-0.5 hover:bg-orange-700"
              >
                <Plus size={18} />
                Create Announcement
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search announcements, shops..."
              className="w-full rounded-xl border border-gray-100 bg-gray-50/80 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'published', label: 'Published' },
                { value: 'drafts', label: 'Drafts' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-xl px-4 py-3 text-xs font-bold transition ${
                    filter === item.value
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/80 py-20 shadow-sm">
          <div className="rounded-2xl bg-orange-50 p-4">
            <LoaderCircle
              size={34}
              className="animate-spin text-orange-600"
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-600">
            Loading announcements...
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Getting the latest campus updates
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Bell size={29} />
          </div>

          <h3 className="mt-5 text-xl font-black text-gray-900">
            Unable to load announcements
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchAnnouncements()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredAnnouncements.length === 0 && (
        <div className="rounded-3xl border border-white/80 bg-white/80 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100 text-orange-500">
            {search ? <Search size={36} /> : <Megaphone size={36} />}
          </div>

          <h3 className="mt-5 text-xl font-black text-gray-900">
            {search
              ? 'No matching announcements'
              : filter === 'drafts'
                ? 'No draft announcements'
                : isOwner
                  ? 'No announcements yet'
                  : 'No announcements available'}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-500">
            {search
              ? 'Try another keyword to find what you are looking for.'
              : isOwner
                ? 'Create your first announcement and share important updates with campus students.'
                : 'Shop announcements will appear here when they are published.'}
          </p>

          {isOwner && !search && filter === 'all' && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <Plus size={17} />
              Create Announcement
            </button>
          )}
        </div>
      )}

      {/* ANNOUNCEMENT FEED */}
      {!loading && !error && filteredAnnouncements.length > 0 && (
        <div className="space-y-5">
          {filteredAnnouncements.map((announcement) => {
            const published = Number(announcement.is_published) === 1
            const shopLabel =
              announcement.shop_name || shopName || 'Campus Shop'

            return (
              <article
                key={announcement.id}
                className="group overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5"
              >
                <div className="p-5 sm:p-7">

                  {/* SHOP HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {announcement.shop_logo ? (
                        <img
                          src={getImageUrl(announcement.shop_logo)}
                          alt={shopLabel}
                          className="h-12 w-12 shrink-0 rounded-2xl border border-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-black text-orange-700">
                          {getInitials(shopLabel)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-gray-900 sm:text-base">
                          {shopLabel}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            {formatDate(announcement.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(isOwner || isAdmin) && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                          published
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {published ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {published ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      Campus Update
                    </div>

                    <h2 className="text-xl font-black leading-snug tracking-tight text-gray-900 transition group-hover:text-orange-800 sm:text-2xl">
                      {announcement.title}
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                      {announcement.body}
                    </p>
                  </div>

                  {/* ATTACHMENTS */}
                  {announcement.attachments?.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                        <Paperclip size={15} className="text-orange-500" />
                        Attachments
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">
                          {announcement.attachments.length}
                        </span>
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

                  {/* ACTIONS */}
                  {(isOwner || isAdmin) && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <span className="text-xs font-medium text-gray-400">
                        {isOwner ? 'Announcement management' : 'Admin controls'}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => openEditForm(announcement)}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(announcement)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* RESULTS */}
      {!loading && !error && filteredAnnouncements.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe5d2] pt-5">
          <p className="text-xs font-medium text-gray-500">
            Showing {filteredAnnouncements.length} announcement(s)
          </p>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck size={14} />
            CampusBite community updates
          </span>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && isOwner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-700 to-amber-500 px-5 py-6 text-white sm:px-7">
              <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border-[22px] border-white/10" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider">
                    <Megaphone size={13} />
                    CAMPUSBITE ANNOUNCEMENTS
                  </span>

                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    {editingId ? 'Edit Announcement' : 'Create Announcement'}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-orange-50 sm:text-sm">
                    Share important updates with campus students.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-xl bg-white/15 p-2.5 text-white transition hover:bg-white/25 disabled:opacity-50"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-7"
            >
              <div>
                <label className="mb-2 block text-sm font-extrabold text-gray-800">
                  Announcement Title <span className="text-orange-600">*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={150}
                  required
                  placeholder="e.g. Special lunch offer this week"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                />

                <p className="mt-1.5 text-right text-xs font-medium text-gray-400">
                  {formData.title.length}/150 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-gray-800">
                  Announcement Details <span className="text-orange-600">*</span>
                </label>

                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Write your announcement details here..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                />
              </div>

              {/* FILE UPLOAD */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-sm font-extrabold text-gray-800">
                    Attachments
                  </label>
                  <span className="text-xs font-semibold text-gray-400">
                    {existingAttachmentCount + selectedFiles.length}/{MAX_FILES} files
                  </span>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 px-4 py-7 text-center transition hover:border-orange-300 hover:bg-orange-50/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Paperclip size={22} />
                  </div>

                  <span className="mt-3 text-sm font-extrabold text-gray-800">
                    Choose files to upload
                  </span>

                  <span className="mt-1 text-xs leading-5 text-gray-400">
                    JPG, PNG, WEBP or PDF
                  </span>
                  <span className="text-xs text-gray-400">
                    Maximum 3 files · 5 MB each
                  </span>

                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    disabled={existingAttachmentCount >= MAX_FILES}
                    className="hidden"
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <FileImage size={18} />
                        </div>

                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-gray-700">
                          {file.name}
                        </span>

                        <span className="shrink-0 text-[10px] font-medium text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  {editingId
                    ? 'New files will be added to the existing attachments.'
                    : 'Attachments are optional. You can upload images or PDF documents.'}
                </p>
              </div>

              {/* PUBLISH OPTION */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-orange-50/40 p-4">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      is_published: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-orange-600"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-gray-800">
                    {formData.is_published ? (
                      <Eye size={16} className="text-emerald-600" />
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
                      : 'This announcement will remain unpublished.'}
                  </p>
                </div>
              </label>

              {/* FORM BUTTONS */}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId ? <Pencil size={16} /> : <Send size={16} />}
                      {editingId ? 'Save Changes' : 'Create Announcement'}
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
