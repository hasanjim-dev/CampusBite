import {
  Users,
  Store,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const stats = [
  { label: 'Total Users', value: '1,248', change: '+12.5%', icon: Users, color: 'blue' },
  { label: 'Registered Shops', value: '48', change: '+8.2%', icon: Store, color: 'orange' },
  { label: 'Total Reviews', value: '3,562', change: '+18.4%', icon: MessageSquare, color: 'green' },
  { label: 'Active Events', value: '12', change: '+4.3%', icon: CalendarDays, color: 'purple' },
]

const activities = [
  { title: 'New student registered', detail: 'A new account joined CampusBite', time: '5 minutes ago', color: 'bg-blue-500' },
  { title: 'New shop added', detail: 'A shop submitted its registration', time: '25 minutes ago', color: 'bg-orange-500' },
  { title: 'New review posted', detail: 'A student published a food review', time: '1 hour ago', color: 'bg-green-500' },
  { title: 'New event created', detail: 'A campus event was announced', time: '3 hours ago', color: 'bg-purple-500' },
]

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <BackButton fallback="/" />

      <div>
        <p className="text-sm font-semibold text-orange-600">ADMINISTRATION</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">
          Monitor and manage your CampusBite platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  <Icon size={23} />
                </div>

                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} /> {stat.change}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-5">{stat.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </h2>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Platform Activity</h2>
              <p className="text-sm text-gray-500 mt-1">
                Recent activity across CampusBite
              </p>
            </div>

            <span className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-2 rounded-full">
              Live overview
            </span>
          </div>

          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${activity.color}`} />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {activity.detail}
                  </p>

                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock size={13} /> {activity.time}
                  </p>
                </div>

                <ArrowUpRight size={17} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-6">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <TrendingUp size={25} />
          </div>

          <h2 className="text-xl font-bold mt-6">CampusBite Insights</h2>

          <p className="text-sm text-gray-300 mt-2 leading-6">
            Your campus community is growing. Keep monitoring user activity,
            shop registrations and reviews.
          </p>

          <div className="border-t border-white/15 mt-7 pt-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Platform status</span>
              <span className="text-green-400 font-semibold">Operational</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Pending shop approvals</span>
              <span className="font-bold">4</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Pending reports</span>
              <span className="font-bold">7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}