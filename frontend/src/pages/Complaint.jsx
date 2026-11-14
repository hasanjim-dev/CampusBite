
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  LoaderCircle,
  Send,
  Store,
} from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '')

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_FILES = 3

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export default function Complaint() {
  const navigate = useNavigate()

  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])

  const [shopId, setShopId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const [attachments, setAttachments] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [shopResponse, categoryResponse] = await Promise.all([
          axios.get(`${API_URL}/shops`),
          axios.get(`${API_URL}/complaints/categories`),
        ])

        if (!active) return

        setShops(shopResponse.data.shops || [])
        setCategories(categoryResponse.data.categories || [])
      } catch (error) {
        if (active) {
          toast.error(
            error.response?.data?.message ||
              'Failed to load shops and complaint categories.'
          )
        }
      } finally {
        if (active) setLoadingData(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''

    if (!selectedFiles.length) return

    if (attachments.length + selectedFiles.length > MAX_FILES) {
      toast.error('You can upload a maximum of 3 attachments.')
      return
    }

    const newAttachments = []

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Unsupported file type.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File must be 5 MB or smaller.`)
        continue
      }

      newAttachments.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null,
      })
    }

    setAttachments((previous) => [
      ...previous,
      ...newAttachments,
    ])
  }

  function removeAttachment(id) {
    setAttachments((previous) => {
      const selected = previous.find((item) => item.id === id)

      if (selected?.preview) {
        URL.revokeObjectURL(selected.preview)
      }

      return previous.filter((item) => item.id !== id)
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!shopId) {
      toast.error('Please select a shop.')
      return
    }

    if (!categoryId) {
      toast.error('Please select a complaint category.')
      return
    }

    if (!description.trim()) {
      toast.error('Please describe your complaint.')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Please login to submit a complaint.')
      navigate('/login')
      return
    }

    const formData = new FormData()

    formData.append('shop_id', shopId)
    formData.append('category_id', categoryId)
    formData.append('description', description.trim())
    formData.append('is_anonymous', isAnonymous ? '1' : '0')

    attachments.forEach((item) => {
      formData.append('attachments', item.file)
    })

    try {
      setSubmitting(true)

      const response = await axios.post(
        `${API_URL}/complaints`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success(
        response.data.message || 'Complaint submitted successfully!'
      )

      attachments.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })

      navigate('/profile')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to submit complaint. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>

      <div className="mb-8 rounded-3xl bg-gradient-to-r from-gray-950 to-orange-950 px-6 py-10 text-white sm:px-10">
        <span className="mb-4 inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-300">
          CAMPUSBITE SUPPORT
        </span>

        <h1 className="mb-3 text-3xl font-extrabold sm:text-4xl">
          Submit a Complaint
        </h1>

        <p className="max-w-xl text-sm leading-6 text-gray-300">
          Help us improve campus food services. Share your experience
          and let us know what needs attention.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-7">
          <h2 className="text-xl font-bold text-gray-900">
            Complaint Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Please provide accurate information about your experience.
          </p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading shops and categories...
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Shop <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Store
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={shopId}
                  onChange={(event) => setShopId(event.target.value)}
                  required
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Choose a campus shop</option>

                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              {shops.length === 0 && (
                <p className="mt-2 text-sm text-red-500">
                  No active shops are currently available.
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Complaint Category <span className="text-red-500">*</span>
              </label>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Choose a category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categories.length === 0 && (
                <p className="mt-2 text-sm text-red-500">
                  No complaint categories are currently available.
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Complaint Details <span className="text-red-500">*</span>
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={6}
                maxLength={65535}
                placeholder="Describe your complaint in detail..."
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {description.length} characters
              </p>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Attach Evidence
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload photos or PDF documents (Optional)
                  </p>
                </div>

                <Upload size={21} className="text-orange-500" />
              </div>

              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-center transition hover:border-orange-400 hover:bg-orange-50/40">
                <Upload size={28} className="mb-3 text-orange-500" />

                <span className="text-sm font-semibold text-gray-700">
                  Click to upload files
                </span>

                <span className="mt-2 text-xs text-gray-400">
                  JPG, PNG, WEBP or PDF · Max 5 MB each · Up to 3 files
                </span>

                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  disabled={attachments.length >= MAX_FILES}
                  className="hidden"
                />
              </label>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-3">
                  {attachments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      {item.preview ? (
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : item.file.type === 'application/pdf' ? (
                        <FileText
                          size={30}
                          className="shrink-0 text-red-500"
                        />
                      ) : (
                        <ImageIcon
                          size={30}
                          className="shrink-0 text-orange-500"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove attachment"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-right text-xs text-gray-400">
                {attachments.length}/{MAX_FILES} files selected
              </p>
            </div>

            <div className="mb-7 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Submit anonymously
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                    Your identity will be hidden from the public complaint
                    feed. CampusBite administrators can still see your identity.
                  </span>
                </span>
              </label>
            </div>
          </>
        )}

        <div className="mb-7 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-green-600"
          />
          <p className="text-xs leading-5 text-gray-500">
            Your complaint will be reviewed by the CampusBite team.
            Please provide genuine information and respectful feedback.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loadingData ||
              submitting ||
              shops.length === 0 ||
              categories.length === 0
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={17} />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
