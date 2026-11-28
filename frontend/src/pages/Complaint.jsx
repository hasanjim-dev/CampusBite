
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
  ShieldCheck,
  LoaderCircle,
  Send,
  Store,
  MessageSquare,
  ClipboardList,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
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

  useEffect(() => {
    return () => {
      attachments.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, [attachments])

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

    setAttachments((previous) => [...previous, ...newAttachments])
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

      setAttachments([])
      navigate('/complaints/my')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to submit complaint. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-gray-200/90 bg-gray-50/70 px-4 py-3.5 text-sm text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10'

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
      >
        <ArrowLeft size={17} />
        Go Back
      </button>

      <section className="relative mb-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#171b1b] via-[#242522] to-[#552b17] px-6 py-9 text-white shadow-xl sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-orange-300">
            <MessageSquare size={14} />
            CAMPUSBITE SUPPORT
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Your Voice Matters<span className="text-orange-400">.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            Help us make campus food services better. Tell us about your
            experience and our team will look into your concern.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-medium text-gray-200">
              <ShieldCheck size={15} className="text-lime-400" />
              Secure submission
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-medium text-gray-200">
              <LockKeyhole size={14} className="text-orange-300" />
              Anonymous option
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-10 hidden h-28 w-28 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.06] backdrop-blur-sm lg:flex">
          <ClipboardList size={58} strokeWidth={1.2} className="text-orange-300" />
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { number: '01', title: 'Choose a shop', icon: Store },
          { number: '02', title: 'Explain the issue', icon: MessageSquare },
          { number: '03', title: 'Submit securely', icon: ShieldCheck },
        ].map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-orange-500">
                  STEP {step.number}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_12px_50px_rgba(31,41,55,0.06)]"
      >
        <div className="border-b border-gray-100 px-6 py-6 sm:px-9">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <ClipboardList size={23} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Complaint Details
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Complete the information below to submit your complaint.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-7 px-6 py-7 sm:px-9 sm:py-9">
          {loadingData ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-gray-500">
              <LoaderCircle size={34} className="animate-spin text-orange-500" />
              <p className="text-sm font-medium">
                Loading shops and complaint categories...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Store size={16} className="text-orange-500" />
                    Select Shop <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={shopId}
                    onChange={(event) => setShopId(event.target.value)}
                    required
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Choose a campus shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>

                  {shops.length === 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={14} />
                      No active shops are currently available.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-sm font-bold text-gray-800">
                    <ClipboardList size={16} className="text-orange-500" />
                    Complaint Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {categories.length === 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={14} />
                      No complaint categories are currently available.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <MessageSquare size={16} className="text-orange-500" />
                    Describe Your Complaint <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-gray-400">
                    Required
                  </span>
                </div>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  rows={7}
                  maxLength={65535}
                  placeholder="Explain what happened, when it happened, and any details that can help us understand the issue..."
                  className={`${inputClass} min-h-44 resize-y leading-7`}
                />

                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Please provide clear and accurate information.</span>
                  <span className="font-semibold tabular-nums">
                    {description.length} characters
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/30 p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                        <Upload size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">
                          Attach Evidence
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Photos or PDF documents · Optional
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm">
                    {attachments.length}/{MAX_FILES}
                  </span>
                </div>

                <label
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-white/80 px-4 py-8 text-center transition ${
                    attachments.length >= MAX_FILES
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:border-orange-400 hover:bg-white'
                  }`}
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Upload size={25} />
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    Click to upload files
                  </span>
                  <span className="mt-2 text-xs text-gray-400">
                    JPG, PNG, WEBP or PDF · Max 5 MB each
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
                        className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm"
                      >
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={item.file.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : item.file.type === 'application/pdf' ? (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FileText size={27} />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <ImageIcon size={27} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-800">
                            {item.file.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(item.id)}
                          className="rounded-xl p-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="Remove attachment"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-center text-xs text-gray-400">
                  {MAX_FILES - attachments.length} upload slot(s) remaining
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5 sm:p-6">
                <label className="flex cursor-pointer items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <LockKeyhole size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-gray-900">
                      Submit anonymously
                    </span>
                    <span className="mt-1 block text-xs leading-6 text-gray-500">
                      Hide your identity from the public complaint feed.
                      CampusBite administrators can still see your identity.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-orange-500"
                  />
                </label>
              </div>
            </>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-lime-100 bg-lime-50/60 p-4">
            <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-lime-700" />
            <div>
              <p className="text-sm font-bold text-gray-800">
                Your feedback is important
              </p>
              <p className="mt-1 text-xs leading-6 text-gray-500">
                Your complaint will be reviewed by the CampusBite team.
                Please provide genuine information and respectful feedback.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="rounded-2xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </form>
    </div>
  )
}
