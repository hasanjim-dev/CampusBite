
import { useState } from 'react'
import { CalendarDays, MapPin, Clock, Search, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const events = [
  {
    id: '1',
    title: 'Campus Food Festival',
    category: 'Festival',
    date: 'November 20, 2026',
    time: '10:00 AM - 5:00 PM',
    location: 'Daffodil Smart City',
    description: 'Enjoy delicious food, exciting activities and amazing campus experiences.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900'
  },
  {
    id: '2',
    title: 'Food Photography Contest',
    category: 'Competition',
    date: 'November 25, 2026',
    time: '11:00 AM - 3:00 PM',
    location: 'University Campus',
    description: 'Show your creativity and capture the beauty of food photography.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900'
  },
  {
    id: '3',
    title: 'Student Meetup',
    category: 'Meetup',
    date: 'December 5, 2026',
    time: '2:00 PM - 5:00 PM',
    location: 'Daffodil Smart City',
    description: 'Meet fellow students and enjoy an amazing afternoon together.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900'
  },
  {
    id: '4',
    title: 'Street Food Day',
    category: 'Festival',
    date: 'December 12, 2026',
    time: '12:00 PM - 6:00 PM',
    location: 'University Campus',
    description: 'Discover popular street foods and enjoy different flavors.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900'
  }
]

const categories = ['All', 'Festival', 'Competition', 'Meetup']

export default function Events() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const navigate = useNavigate()

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || event.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto pb-12">

      <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white mb-10">
        <p className="font-semibold text-orange-100 mb-3">CAMPUSBITE COMMUNITY</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Campus Events
        </h1>
        <p className="text-orange-50 max-w-xl">
          Discover campus food festivals, competitions and exciting student events.
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-4 justify-between mb-7">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={19} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(item => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                category === item
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 border hover:border-orange-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        <span className="text-sm text-gray-500">
          {filteredEvents.length} events found
        </span>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  {event.category}
                </span>

                <h3 className="text-xl font-bold mt-4 mb-3">
                  {event.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex gap-2 items-center">
                    <CalendarDays size={17} className="text-orange-500" />
                    {event.date}
                  </p>
                  <p className="flex gap-2 items-center">
                    <Clock size={17} className="text-orange-500" />
                    {event.time}
                  </p>
                  <p className="flex gap-2 items-center">
                    <MapPin size={17} className="text-orange-500" />
                    {event.location}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="w-full mt-5 flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
                >
                  View Details <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-lg">No events found</h3>
          <p className="text-gray-500 mt-1">Try another search or category.</p>
        </div>
      )}
    </div>
  )
}
