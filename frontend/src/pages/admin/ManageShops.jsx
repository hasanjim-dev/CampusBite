import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Search,
  Store,
  MapPin,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const initialShops = [
  { id: 1, name: 'Campus Food Corner', owner: 'Karim Hasan', location: 'DIU Main Campus', category: 'Fast Food', status: 'Approved' },
  { id: 2, name: 'Green Cafe', owner: 'Nusrat Jahan', location: 'DIU Permanent Campus', category: 'Cafe', status: 'Pending' },
  { id: 3, name: 'Snack House', owner: 'Rahim Ahmed', location: 'DIU Main Campus', category: 'Snacks', status: 'Approved' },
  { id: 4, name: 'Coffee Station', owner: 'Sadia Islam', location: 'DIU Food Court', category: 'Drinks', status: 'Rejected' },
]

export default function ManageShops() {
  const [shops, setShops] = useState(initialShops)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedShop, setSelectedShop] = useState(null)

  const filteredShops = shops.filter(shop => {
    const matchesSearch = `${shop.name} ${shop.owner} ${shop.location}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus = filter === 'All' || shop.status === filter

    return matchesSearch && matchesStatus
  })

  const updateStatus = (id, status) => {
    setShops(shops.map(shop =>
      shop.id === id ? { ...shop, status } : shop
    ))

    toast.success(`Shop ${status.toLowerCase()} successfully`)
  }

  const deleteShop = (id) => {
    if (!window.confirm('Are you sure you want to remove this shop?')) return

    setShops(shops.filter(shop => shop.id !== id))
    toast.success('Shop removed from demo list')

    if (selectedShop?.id === id) {
      setSelectedShop(null)
    }
  }

  const counts = {
    total: shops.length,
    approved: shops.filter(shop => shop.status === 'Approved').length,
    pending: shops.filter(shop => shop.status === 'Pending').length,
    rejected: shops.filter(shop => shop.status === 'Rejected').length,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton fallback="/admin" />

      <div>
        <p className="text-sm font-semibold text-orange-600">ADMINISTRATION</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Shops</h1>
        <p className="text-gray-500 mt-2">
          Review shop registrations and manage shop listings.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shops', value: counts.total, icon: Store, color: 'text-blue-600' },
          { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: counts.pending, icon: Store, color: 'text-orange-600' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-600' },
        ].map(item => {
          const Icon = item.icon

          return (
            <div key={item.label} className="bg-white border rounded-2xl p-5">
              <Icon size={23} className={item.color} />
              <p className="text-sm text-gray-500 mt-3">{item.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {item.value}
              </h2>
            </div>
          )
        })}
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shop, owner or location..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none"
        >
          <option value="All">All Shops</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredShops.map(shop => (
          <div
            key={shop.id}
            className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                <Store size={25} />
              </div>

              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  shop.status === 'Approved'
                    ? 'bg-green-50 text-green-700'
                    : shop.status === 'Pending'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-red-50 text-red-600'
                }`}
              >
                {shop.status}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {shop.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Owner: {shop.owner}
              </p>

              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <MapPin size={15} /> {shop.location}
              </p>

              <p className="text-xs text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full mt-3">
                {shop.category}
              </p>
            </div>

            <div className="border-t pt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedShop(shop)}
                className="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Eye size={16} /> Details
              </button>

              {shop.status !== 'Approved' && (
                <button
                  onClick={() => updateStatus(shop.id, 'Approved')}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm hover:bg-green-100"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              )}

              {shop.status !== 'Rejected' && (
                <button
                  onClick={() => updateStatus(shop.id, 'Rejected')}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 rounded-lg px-3 py-2 text-sm hover:bg-red-100"
                >
                  <XCircle size={16} /> Reject
                </button>
              )}

              <button
                onClick={() => deleteShop(shop.id)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                title="Delete shop"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
          No shops found.
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Shop Details</h2>

              <button
                onClick={() => setSelectedShop(null)}
                className="text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>Shop:</strong> {selectedShop.name}</p>
              <p><strong>Owner:</strong> {selectedShop.owner}</p>
              <p><strong>Location:</strong> {selectedShop.location}</p>
              <p><strong>Category:</strong> {selectedShop.category}</p>
              <p><strong>Status:</strong> {selectedShop.status}</p>
            </div>

            <button
              onClick={() => setSelectedShop(null)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}