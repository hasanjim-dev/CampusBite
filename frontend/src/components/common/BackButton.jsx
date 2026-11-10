
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition mb-4"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  )
}
