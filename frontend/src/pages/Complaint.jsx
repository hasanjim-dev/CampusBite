
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Send,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react'

const shops = [
  'Food Court',
  'Campus Cafe',
  'Snack Corner',
]

const categories = [
  'Food Quality',
  'Hygiene & Cleanliness',
  'Staff Behavior',
  'Pricing Issue',
  'Service Problem',
  'Other',
]

export default function Complaint() {
  const navigate = useNavigate()

  const [shop, setShop] = useState('')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!shop || !category || !subject.trim() || !description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.success('Complaint submitted successfully! (Demo)')
    navigate('/profile')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 font-medium text-gray-600 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-7 flex items-center gap-3">
        <div className="rounded-xl bg-orange-100 p-3">
          <AlertCircle size={27} className="text-orange-500" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Submit a Complaint
          </h1>
          <p className="mt-1 text-gray-500">
            Tell us about an issue you experienced at a campus shop.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Select Shop <span className="text-red-500">*</span>
            </label>

            <select
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Choose a shop</option>
              {shops.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Complaint Category <span className="text-red-500">*</span>
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Choose a category</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Subject <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              placeholder="Briefly describe the problem"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Complaint Details <span className="text-red-500">*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1500}
              placeholder="Explain what happened in detail..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {description.length}/1500 characters
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Attach Evidence <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            {!preview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-5 py-8 hover:border-orange-400 hover:bg-orange-50">
                <Upload size={28} className="mb-2 text-gray-400" />
                <span className="font-medium text-gray-700">
                  Click to upload an image
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  JPG, PNG or WEBP · Maximum 5MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-fit">
                <img
                  src={preview}
                  alt="Complaint evidence"
                  className="h-48 w-48 rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-orange-50 p-4 text-sm leading-6 text-orange-800">
            Please provide accurate information. Your complaint will be
            reviewed by the CampusBite administration.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              <Send size={18} />
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
