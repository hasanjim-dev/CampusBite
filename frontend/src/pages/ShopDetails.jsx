
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  MessageCircle,
  UtensilsCrossed
} from 'lucide-react'

const shops = [
  {
    id: '1',
    name: 'Food Court',
    category: 'Food',
    location: 'Daffodil Smart City',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
    description: 'Enjoy delicious and freshly prepared meals at affordable prices.',
    hours: '9:00 AM - 9:00 PM',
    menu: [
      { name: 'Chicken Burger', price: '৳150', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
      { name: 'Pizza', price: '৳250', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
      { name: 'French Fries', price: '৳80', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' }
    ]
  },
  {
    id: '2',
    name: 'Campus Cafe',
    category: 'Drinks',
    location: 'Daffodil Smart City',
    rating: 4.5,
    reviews: 86,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000',
    description: 'A cozy place for coffee, snacks and spending time with friends.',
    hours: '8:00 AM - 8:00 PM',
    menu: [
      { name: 'Cold Coffee', price: '৳120', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500' },
      { name: 'Cappuccino', price: '৳100', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500' }
    ]
  },
  {
    id: '3',
    name: 'Snack Corner',
    category: 'Snacks',
    location: 'Daffodil Smart City',
    rating: 4.3,
    reviews: 65,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000',
    description: 'Tasty snacks and quick bites for students.',
    hours: '10:00 AM - 8:00 PM',
    menu: [
      { name: 'Chicken Sandwich', price: '৳100', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' },
      { name: 'Chicken Roll', price: '৳70', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' }
    ]
  }
]

const reviews = [
  { name: 'Nusrat Jahan', rating: 5, text: 'Food quality is really good. Highly recommended!', time: '2 hours ago' },
  { name: 'Sakib Ahmed', rating: 4, text: 'Good food and reasonable prices.', time: 'Yesterday' },
  { name: 'Anonymous', rating: 4, text: 'Nice environment and friendly service.', time: '2 days ago' }
]

export default function ShopDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const shop = shops.find(item => item.id === id)
  const [activeTab, setActiveTab] = useState('menu')

  if (!shop) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold">Shop not found</h2>
        <button onClick={() => navigate('/shops')} className="mt-5 text-orange-600 font-semibold">
          Back to Shops
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button onClick={() => navigate('/shops')} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6">
        <ArrowLeft size={18} /> Back to Shops
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <img src={shop.image} alt={shop.name} className="w-full h-64 md:h-80 object-cover" />

        <div className="p-6 md:p-8">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
            {shop.category}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mt-4">{shop.name}</h1>
          <p className="text-gray-600 mt-3">{shop.description}</p>

          <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-600">
            <span className="flex items-center gap-2"><MapPin size={17} />{shop.location}</span>
            <span className="flex items-center gap-2"><Clock size={17} />{shop.hours}</span>
            <span className="flex items-center gap-2 text-yellow-600"><Star size={17} fill="currentColor" />{shop.rating} ({shop.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b mt-8">
        <button onClick={() => setActiveTab('menu')} className={`pb-3 font-semibold ${activeTab === 'menu' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}>
          Menu
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`pb-3 font-semibold ${activeTab === 'reviews' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}>
          Reviews ({reviews.length})
        </button>
      </div>

      {activeTab === 'menu' ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
          {shop.menu.map((item, index) => (
            <div key={index} className="bg-white rounded-xl border overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <span className="font-bold text-orange-600">{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border">
              <div className="flex justify-between">
                <h3 className="font-bold">{review.name}</h3>
                <span className="text-xs text-gray-500">{review.time}</span>
              </div>
              <div className="flex text-yellow-500 my-2">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-orange-50 rounded-xl p-6 text-center">
        <UtensilsCrossed className="mx-auto text-orange-600" size={30} />
        <h2 className="text-xl font-bold mt-3">Have you visited this shop?</h2>
        <p className="text-gray-600 mt-1">Share your experience with other students.</p>
        <button onClick={() => navigate('/reviews/new')} className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700">
          <span className="flex items-center gap-2"><MessageCircle size={18} /> Write a Review</span>
        </button>
      </div>
    </div>
  )
}
