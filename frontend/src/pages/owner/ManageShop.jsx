import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ImagePlus,
  Save,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

export default function ManageShop() {
  const [shop, setShop] = useState({
    name: 'Campus Food Corner',
    description: 'Fresh and delicious food for campus students.',
    location: 'Daffodil International University',
    phone: '01700000000',
    openingTime: '08:00',
    closingTime: '20:00',
    image: '',
    status: 'Open',
  })

  const handleChange = (e) => {
    setShop({ ...shop, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Shop information saved successfully!')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BackButton fallback="/owner" />

      <div>
        <p className="text-sm text-orange-600 font-semibold">SHOP OWNER PANEL</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Shop</h1>
        <p className="text-gray-500 mt-2">
          Update your shop information and availability.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center gap-3 border-b pb-5">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
            <Store size={25} />
          </div>

          <div>
            <h2 className="font-bold text-lg text-gray-800">
              Shop Information
            </h2>
            <p className="text-sm text-gray-500">
              Basic details about your shop
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              name="name"
              value={shop.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={shop.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} /> Location
            </label>
            <input
              name="location"
              value={shop.location}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} /> Contact Number
            </label>
            <input
              name="phone"
              value={shop.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock size={16} /> Opening Time
            </label>
            <input
              type="time"
              name="openingTime"
              value={shop.openingTime}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock size={16} /> Closing Time
            </label>
            <input
              type="time"
              name="closingTime"
              value={shop.closingTime}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shop Status
            </label>
            <select
              name="status"
              value={shop.status}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            >
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ImagePlus size={16} /> Shop Image URL
            </label>
            <input
              name="image"
              value={shop.image}
              onChange={handleChange}
              placeholder="https://example.com/shop.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {shop.image && (
          <img
            src={shop.image}
            alt="Shop preview"
            className="w-full max-h-56 object-cover rounded-xl"
          />
        )}

        <div className="flex justify-end border-t pt-5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}