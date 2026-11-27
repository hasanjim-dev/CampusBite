
import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Store,
  Trash2,
  X,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/api\/?$/, '')

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getAttachmentUrl(url) {
  if (!url) return ''
  return new URL(url, `${API_ORIGIN}/`).href
}

function ComplaintCard({ complaint, adminMode, onDelete }) {
  const isAnonymous = Number(complaint.is_anonymous) === 1
  const [selectedImage, setSelectedImage] = useState(null)

  const imageAttachments = (complaint.attachments || []).filter(
    (attachment) => attachment.mime_type?.startsWith('image/')
  )

  const imageCount = imageAttachments.length

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 text-lg font-black text-orange-600">
            {(complaint.complainant_name || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-[#202923]">
              {complaint.complainant_name || 'Unknown User'}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Store size={12} className="text-orange-500" />
                {complaint.shop_name || 'Unknown Shop'}
              </span>
              <span className="text-gray-300">•</span>
              <span>{formatDate(complaint.created_at)}</span>
            </div>
          </div>
        </div>

        {adminMode && (
          <button
            type="button"
            onClick={() => onDelete(complaint.id)}
            title="Delete complaint"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 p-2.5 text-rose-600 transition hover:border-rose-200 hover:bg-rose-100"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
            {complaint.category_name || 'General Complaint'}
          </span>

          {complaint.food_item_name && (
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {complaint.food_item_name}
            </span>
          )}

          {isAnonymous && (
            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
              Anonymous
            </span>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {complaint.description}
        </p>
      </div>

      {imageCount > 0 && (
        <div className="border-t border-gray-100 bg-[#fafbf9] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <ImageIcon size={15} className="text-orange-500" />
            Evidence Attachments ({imageCount})
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-hidden sm:gap-3">
            {imageAttachments.slice(0, 4).map((attachment, index) => {
              const fileUrl = getAttachmentUrl(attachment.url)
              const remainingImages = imageCount - 4

              return (
                <button
                  key={attachment.id}
                  type="button"
                  onClick={() => setSelectedImage(fileUrl)}
                  className={`group/image relative overflow-hidden rounded-xl bg-gray-100 ${
                    imageCount === 1 ? 'col-span-2' : ''
                  }`}
                >
                  <img
                    src={fileUrl}
                    alt={attachment.original_filename || 'Complaint evidence'}
                    loading="lazy"
                    className={`w-full bg-gray-100 object-contain transition duration-300 group-hover/image:scale-[1.02] ${
                      imageCount === 1
                        ? 'max-h-[500px] min-h-56'
                        : 'h-44 sm:h-60'
                    }`}
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover/image:bg-black/20 group-hover/image:opacity-100">
                    <Eye size={25} className="text-white drop-shadow" />
                  </div>

                  {index === 3 && remainingImages > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                      <span className="text-3xl font-black text-white">
                        +{remainingImages}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {imageCount > 4 && (
            <p className="mt-3 text-xs text-gray-500">
              Showing 4 of {imageCount} evidence images
            </p>
          )}
        </div>
      )}

      {adminMode && (
        <div className="mx-5 mb-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:mx-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={17} className="text-orange-600" />
            <p className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
              Administrator Information
            </p>
          </div>

          <p className="text-sm text-gray-700">
            <strong>Submitted by:</strong>{' '}
            {complaint.complainant_name || 'Unknown'}
          </p>

          {complaint.complainant_email && (
            <p className="mt-2 break-all text-sm text-gray-700">
              <strong>Email:</strong> {complaint.complainant_email}
            </p>
          )}

          {isAnonymous && (
            <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs leading-5 text-orange-700">
              This complaint was submitted anonymously. Actual identity is
              visible to administrators only.
            </p>
          )}
        </div>
      )}

      {complaint.admin_note && (
        <div className="mx-5 mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:mx-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
            Admin Note
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
            {complaint.admin_note}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 sm:px-6">
        <p className="text-xs font-semibold text-gray-400">
          Complaint #{complaint.id}
        </p>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <Calendar size={13} />
          {formatDate(complaint.created_at)}
        </span>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111b14]/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <img
            src={selectedImage}
            alt="Complaint evidence preview"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </article>
  )
}

export default function ComplaintList({
  endpoint,
  title,
  subtitle,
  adminMode = false,
  showAdminNote = false,
}) {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get(endpoint, {
        params: { page },
      })

      setComplaints(response.data.complaints || [])

      setPagination(
        response.data.pagination || {
          page,
          total: 0,
          totalPages: 1,
        }
      )
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load complaints.'

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [endpoint, page])

  useEffect(() => {
    loadComplaints()
  }, [loadComplaints])

  async function handleDelete(id) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete complaint #${id}?`
    )

    if (!confirmed) return

    try {
      await api.delete(`/complaints/${id}`)
      toast.success('Complaint deleted successfully.')

      if (complaints.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        loadComplaints()
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete complaint.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#202923] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-orange-300">
              <Sparkles size={14} />
              CAMPUSBITE SUPPORT
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-base">
              {subtitle}
            </p>

            {!loading && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
                <MessageSquare size={16} className="text-orange-300" />
                {pagination.total} Total Complaints
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-gray-400">Current Page</p>
            <p className="mt-1 text-xl font-black">{page}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Pages</p>
            <p className="mt-1 text-xl font-black">
              {pagination.totalPages || 1}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gray-100" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-56 rounded bg-gray-100" />
                </div>
              </div>
              <div className="mt-7 h-4 w-32 rounded bg-gray-100" />
              <div className="mt-4 h-3 w-full rounded bg-gray-100" />
              <div className="mt-3 h-3 w-4/5 rounded bg-gray-100" />
              <div className="mt-7 h-32 rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={30} />
          </div>

          <h2 className="mt-5 text-xl font-extrabold text-[#202923]">
            Unable to load complaints
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadComplaints}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <MessageSquare size={30} />
          </div>

          <h2 className="mt-5 text-xl font-extrabold text-[#202923]">
            No complaints found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            There are no complaints to display right now.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              adminMode={adminMode}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm font-medium text-gray-500">
            Page <span className="font-extrabold text-[#202923]">{page}</span>{' '}
            of{' '}
            <span className="font-extrabold text-[#202923]">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25352b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#35483a] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
