
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Search,
  Store,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import BackButton from '../../components/common/BackButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ManageShops() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedShop, setSelectedShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const fetchShops = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_URL}/shops`)
      setShops(response.data.shops || [])
    } catch (err) {
      const message =
        err.response?.data?.message || 'Could not load shops.'

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const updateShopStatus = async (shop) => {
    const isActive = Number(shop.is_active ?? 1) === 1
    const action = isActive ? 'deactivate' : 'activate'

    if (!window.confirm(`Are you sure you want to ${action} ${shop.name}?`)) {
      return
    }

    setUpdatingId(shop.id)

    try {
      const token = localStorage.getItem('token')

      const response = await axios.patch(
        `${API_URL}/admin/shops/${shop.id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success(response.data.message || `Shop ${action}d successfully.`)

      if (action === 'deactivate') {
        setShops(current => current.filter(item => item.id !== shop.id))

        if (selectedShop?.id === shop.id) {
          setSelectedShop(null)
        }
      } else {
        await fetchShops()
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Could not ${action} shop.`
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredShops = shops.filter(shop => {
    const searchText = [
      shop.name,
      shop.location,
      shop.description,
    ].filter(Boolean).join(' ').toLowerCase()

    const matchesSearch = searchText.includes(search.toLowerCase())

    const isActive = Number(shop.is_active ?? 1) === 1
    const matchesStatus =
      filter === 'All' ||
      (filter === 'Active' && isActive) ||
      (filter === 'Inactive' && !isActive)

    return matchesSearch && matchesStatus
  })

  const activeCount = shops.filter(
    shop => Number(shop.is_active ?? 1) === 1
  ).length

  const inactiveCount = shops.length - activeCount

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton fallback="/admin" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            ADMINISTRATION
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Manage Shops
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage registered CampusBite shops.
          </p>
        </div>

        <button
          onClick={fetchShops}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <Store className="text-blue-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Loaded Shops</p>
          <h2 className="text-3xl font-bold mt-1">{shops.length}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <CheckCircle className="text-green-600" size={23} />
          <p className="text-sm text-gray-500 mt-3">Active Shops</p>
          <h2 className="text-3xl font-bold mt-1">{activeCount}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <XCircle className="text-red-500" size={23} />
          <p className="text-sm text-gray-500 mt-3">Inactive Shops</p>
          <h2 className="text-3xl font-bold mt-1">{inactiveCount}</h2>
        </div>
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
            placeholder="Search shop or location..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none"
        >
          <option value="All">All Shops</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
          Loading shops...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredShops.map(shop => {
            const isActive = Number(shop.is_active ?? 1) === 1

            return (
              <div
                key={shop.id}
                className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                      <Store size={25} />
                    </div>
                  )}

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {shop.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                    <MapPin size={15} />
                    {shop.location || 'Location not provided'}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {shop.description || 'No description available.'}
                  </p>
                </div>

                <div className="border-t pt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedShop(shop)}
                    className="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Eye size={16} />
                    Details
                  </button>

                  <button
                    onClick={() => updateShopStatus(shop)}
                    disabled={updatingId === shop.id}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm disabled:opacity-50 ${
                      isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )
          })}

          {filteredShops.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 bg-white border rounded-2xl p-12 text-center text-gray-500">
              No shops found.
            </div>
          )}
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Shop Details</h2>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-gray-500 hover:text-gray-900 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>Shop:</strong> {selectedShop.name}</p>
              <p><strong>Location:</strong> {selectedShop.location || 'Not provided'}</p>
              <p><strong>Description:</strong> {selectedShop.description || 'Not provided'}</p>
              <p>
                <strong>Status:</strong>{' '}
                {Number(selectedShop.is_active ?? 1) === 1 ? 'Active' : 'Inactive'}
              </p>
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
