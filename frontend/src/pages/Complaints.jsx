
import { Link } from 'react-router-dom'
import {
  MessageSquareWarning,
  Plus,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import ComplaintList from '../components/common/ComplaintList'

export default function Complaints({ showActions = true }) {
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">

      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#243b35] via-[#315348] to-[#647d50] px-6 py-9 text-white shadow-2xl shadow-emerald-950/15 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-lime-300/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wider text-lime-100 backdrop-blur-sm">
            <Sparkles size={14} />
            CAMPUS COMMUNITY VOICE
          </span>

          <div className="mt-5 flex items-center gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
              <MessageSquareWarning size={30} className="text-lime-200" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Campus Complaints
              </h1>
              <p className="mt-1 text-sm font-medium text-emerald-50">
                Speak up. Share feedback. Make campus better.
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
            A better campus food experience starts with listening. Explore
            public complaints, share your concerns, and help improve the
            quality of campus shops.
          </p>

          <div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-emerald-50">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-lime-200" />
              Community feedback
            </span>
            <span className="flex items-center gap-2">
              <ClipboardList size={16} className="text-lime-200" />
              Public complaints
            </span>
          </div>
        </div>
      </section>

      {/* STUDENT ACTIONS */}
      {showActions && (
        <section className="grid gap-4 sm:grid-cols-2">

          <Link
            to="/complaints/new"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 p-6 text-white shadow-lg shadow-orange-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border-[20px] border-white/10 transition duration-500 group-hover:scale-125" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="mb-5 inline-flex rounded-xl bg-white/20 p-3">
                  <Plus size={25} />
                </div>

                <h2 className="text-xl font-black">
                  Submit a Complaint
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-orange-50">
                  Report a problem or share your concerns about a campus shop.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                  Submit now
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/complaints/my"
            className="group relative overflow-hidden rounded-2xl border border-[#dce4d3] bg-white/85 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-emerald-50 transition duration-500 group-hover:scale-125" />

            <div className="relative z-10">
              <div className="mb-5 inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <ClipboardList size={25} />
              </div>

              <h2 className="text-xl font-black text-gray-900">
                My Complaints
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                Track your submitted complaints and check their latest updates.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                View my complaints
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

        </section>
      )}

      {/* PUBLIC COMPLAINTS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-600" />
              Community Feedback
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Public Complaints
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-7 text-gray-500">
              Explore concerns shared by students and stay informed about
              campus shop experiences.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/55 p-2 shadow-sm sm:p-4">
          <ComplaintList
            endpoint="/complaints"
            title="All Complaints"
            subtitle="View public complaints submitted by students across campus shops."
          />
        </div>
      </section>

    </div>
  )
}
