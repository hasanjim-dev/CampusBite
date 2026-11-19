
import { Link } from 'react-router-dom'
import ComplaintList from '../components/common/ComplaintList'

export default function Complaints({ showActions = true }) {
  return (
    <div>
      {/* Complaint Actions - Student only */}
      {showActions && (
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              to="/complaints/new"
              className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              + Submit Complaint
            </Link>

            <Link
              to="/complaints/my"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              My Complaints
            </Link>
          </div>
        </div>
      )}

      {/* All Public Complaints */}
      <ComplaintList
        endpoint="/complaints"
        title="All Complaints"
        subtitle="View public complaints submitted by students across campus shops."
      />
    </div>
  )
}
