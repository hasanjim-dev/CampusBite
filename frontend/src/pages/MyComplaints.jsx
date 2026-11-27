
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ClipboardList,
  Plus,
} from 'lucide-react'
import ComplaintList from '../components/common/ComplaintList'

export default function MyComplaints() {
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
        >
          <ArrowLeft size={17} />
          Back to Complaints
        </Link>

        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/15 transition hover:bg-orange-600"
        >
          <Plus size={17} />
          New Complaint
        </Link>
      </div>

      <section className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#19201e] via-[#29332b] to-[#75401f] px-6 py-9 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-4 py-2 text-xs font-bold tracking-wider text-orange-300">
            <ClipboardList size={14} />
            STUDENT DASHBOARD
          </span>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            My Complaints<span className="text-orange-400">.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            Keep track of the concerns you have reported. Review complaint
            updates, check administrator feedback, and stay informed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-semibold text-gray-200">
              <MessageSquare size={15} className="text-orange-300" />
              Your submitted reports
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-semibold text-gray-200">
              <ShieldCheck size={15} className="text-lime-400" />
              Administrator updates
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 right-9 hidden h-24 w-24 items-center justify-center rounded-[26px] border border-white/10 bg-white/[0.06] backdrop-blur-sm lg:flex">
          <ClipboardList
            size={48}
            strokeWidth={1.3}
            className="text-orange-300"
          />
        </div>
      </section>

      <ComplaintList
        endpoint="/complaints/my-complaints"
        subtitle="Track the complaints you have submitted and review any administrator notes."
        showAdminNote
      />
    </div>
  )
}
