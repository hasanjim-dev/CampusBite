import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Share2,
} from 'lucide-react'

const events = [
  {
    id: '1',
    title: 'Campus Food Festival',
    category: 'Festival',
    date: 'November 20, 2026',
    time: '10:00 AM - 5:00 PM',
    location: 'University Campus',
    organizer: 'CampusBite Team',
    description:
      'Join us for an exciting campus food festival! Explore delicious food from different campus shops, enjoy amazing flavors, and spend a wonderful day with friends.',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
  },
  {
    id: '2',
    title: 'Food Photography Contest',
    category: 'Competition',
    date: 'November 25, 2026',
    time: '11:00 AM - 3:00 PM',
    location: 'University Auditorium',
    organizer: 'Photography Club',
    description:
      'Show your creativity and photography skills in our food photography competition. Capture beautiful food moments and share your talent with everyone.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200',
  },
  {
    id: '3',
    title: 'Student Food Meetup',
    category: 'Meetup',
    date: 'December 5, 2026',
    time: '2:00 PM - 5:00 PM',
    location: 'Central Campus',
    organizer: 'Student Community',
    description:
      'Meet new people, connect with fellow students, and share your favorite campus food experiences in a friendly environment.',
    image:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  },
  {
    id: '4',
    title: 'Street Food Day',
    category: 'Festival',
    date: 'December 12, 2026',
    time: '12:00 PM - 6:00 PM',
    location: 'Campus Open Ground',
    organizer: 'CampusBite Team',
    description:
      'Experience different street food flavors in one place. Bring your friends and enjoy a fun-filled food day on campus.',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
  },
]

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const event = events.find((item) => item.id === id)

  if (!event) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Event Not Found
        </h2>

        <button
          onClick={() => navigate('/events')}
          className="mt-5 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate('/events')}
        className="mb-6 flex items-center gap-2 font-medium text-gray-600 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back to Events
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <img
          src={event.image}
          alt={event.title}
          className="h-64 w-full object-cover sm:h-96"
        />

        <div className="p-6 sm:p-9">
          <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-600">
            {event.category}
          </span>

          <h1 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            {event.title}
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            {event.description}
          </p>

          <div className="mt-8 grid gap-5 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">{event.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold text-gray-800">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-800">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 text-orange-500" size={21} />
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="font-semibold text-gray-800">
                  {event.organizer}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/events')}
              className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Explore More Events
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Event link copied!')
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Share2 size={18} />
              Share Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}