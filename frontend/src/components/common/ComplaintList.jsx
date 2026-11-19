
import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Store,
  Trash2,
  X,
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
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

}

function ComplaintCard({ complaint, adminMode, onDelete }) {
  const isAnonymous = Number(complaint.is_anonymous) === 1
  const [selectedImage, setSelectedImage] = useState(null)

  const imageAttachments = (complaint.attachments || []).filter(
    (attachment) => attachment.mime_type?.startsWith('image/')
  )

  const imageCount = imageAttachments.length

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

      {/* Post Header */}
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
            {(complaint.complainant_name || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-gray-900">
              {complaint.complainant_name || 'Unknown User'}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{complaint.shop_name || 'Unknown Shop'}</span>
              <span>·</span>
              <span>{formatDate(complaint.created_at)}</span>
            </div>
          </div>
        </div>

        {adminMode && (
          <button
            type="button"
            onClick={() => onDelete(complaint.id)}
            title="Delete complaint"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {/* Complaint Content */}
      <div className="px-5 pb-4 sm:px-6">

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            {complaint.category_name || 'General Complaint'}
          </span>

          {complaint.food_item_name && (
            <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {complaint.food_item_name}
            </span>
          )}

          {isAnonymous && (
            <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Anonymous
            </span>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {complaint.description}
        </p>

      </div>

      {/* Evidence Images */}
      {imageCount > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">

          <div className="grid grid-cols-2 gap-1 overflow-hidden sm:gap-1.5">

            {imageAttachments.slice(0, 4).map((attachment, index) => {
              const fileUrl = new URL(
  attachment.url,
  `${API_ORIGIN}/`
).href
              const remainingImages = imageCount - 4

              return (
                <button
                  key={attachment.id}
                  type="button"
                  onClick={() => setSelectedImage(fileUrl)}
                  className={`group relative overflow-hidden bg-gray-100 ${
                    imageCount === 1
                      ? 'col-span-2'
                      : ''
                  }`}
                >
                  <img
                    src={fileUrl}
                    alt={attachment.original_filename || 'Complaint evidence'}
                    loading="lazy"
                    className={`w-full object-contain bg-gray-100 transition duration-300 ${
                      imageCount === 1
                        ? 'max-h-[500px] min-h-56'
                        : 'h-48 sm:h-64'
                    }`}
                  />

                  {index === 3 && remainingImages > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-3xl font-bold text-white">
                        +{remainingImages}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}

          </div>

          {imageCount > 4 && (
            <p className="px-5 pt-2 text-xs text-gray-500">
              Showing 4 of {imageCount} evidence images
            </p>
          )}

        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <X size={25} />
          </button>

          <img
            src={selectedImage}
            alt="Complaint evidence preview"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      {/* Submitted By - Admin Only Identity Details */}
      {adminMode && (
        <div className="mx-5 mb-4 rounded-xl bg-gray-50 p-4 sm:mx-6">
          <p className="text-sm text-gray-600">
            <strong>Submitted by:</strong>{' '}
            {complaint.complainant_name || 'Unknown'}
          </p>

          {complaint.complainant_email && (
            <p className="mt-1 text-sm text-gray-600">
              <strong>Email:</strong> {complaint.complainant_email}
            </p>
          )}

          {isAnonymous && (
            <p className="mt-2 text-xs text-orange-600">
              This complaint was submitted anonymously. Actual identity is visible to administrators only.
            </p>
          )}
        </div>
      )}

      {/* Admin Note */}
      {complaint.admin_note && (
        <div className="mx-5 mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:mx-6">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            Admin Note
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
            {complaint.admin_note}
          </p>
        </div>
      )}

      {/* Complaint ID */}
      <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
        <p className="text-xs text-gray-400">
          Complaint #{complaint.id}
        </p>
      </div>

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

      loadComplaints()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete complaint.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-orange-600">
            CAMPUSBITE SUPPORT
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {subtitle}
          </p>

          {!loading && (
            <p className="mt-2 text-sm font-medium text-gray-600">
              Total complaints: {pagination.total}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={loadComplaints}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-3 text-gray-500">
          <LoaderCircle size={24} className="animate-spin" />
          Loading complaints...
        </div>

      ) : error ? (

        /* Error */
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle size={30} className="mx-auto text-red-500" />

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadComplaints}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>

      ) : complaints.length === 0 ? (

        /* Empty State */
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center">
          <MessageSquare size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            No complaints found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no complaints to display right now.
          </p>
        </div>

      ) : (

        /* Complaint Feed */
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

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}

    </div>
  )
}
