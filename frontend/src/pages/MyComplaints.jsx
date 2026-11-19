
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ComplaintList from '../components/common/ComplaintList'

export default function MyComplaints() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Link
          to="/complaints"
          title="Back to All Complaints"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <ComplaintList
        endpoint="/complaints/my-complaints"
        subtitle="Track the complaints you have submitted and review any administrator notes."
        showAdminNote
      />
    </div>
  )
}
