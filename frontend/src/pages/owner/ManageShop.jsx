
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ImagePlus,
  Save,
  Plus,
  Mail,
  LoaderCircle,
} from 'lucide-react'
import BackButton from '../../components/common/BackButton'
import api from '../../api/axios'

const emptyShop = {
  name: '',
  description: '',
  location: '',
  contact_phone: '',
  contact_email: '',
  opening_hours: '',
  logo_url: '',
}

export default function ManageShop() {
  const [shop, setShop] = useState(emptyShop)
  const [shopId, setShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await api.get('/shops/my-shop')
        const data = response.data.shop

        setShopId(data.id)
        setShop({
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          opening_hours: data.opening_hours || '',
          logo_url: data.logo_url || '',
        })
      } catch (error) {
        if (error.response?.status === 404) {
          setShopId(null)
          setShop(emptyShop)
        } else {
          setLoadError(
            error.response?.data?.message ||
            'Could not load your shop information.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShop()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setShop((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!shop.name.trim()) {
      toast.error('Shop name is required.')
      return
    }

    setSaving(true)

    const payload = {
      name: shop.name.trim(),
      description: shop.description.trim(),
      location: shop.location.trim(),
      contact_phone: shop.contact_phone.trim(),
      contact_email: shop.contact_email.trim(),
      opening_hours: shop.opening_hours.trim(),
      logo_url: shop.logo_url.trim(),
    }

    try {
      if (shopId) {
        const response = await api.put('/shops/my-shop', payload)
        const updated = response.data.shop

        setShopId(updated.id)
        setShop({
          name: updated.name || '',
          description: updated.description || '',
          location: updated.location || '',
          contact_phone: updated.contact_phone || '',
          contact_email: updated.contact_email || '',
          opening_hours: updated.opening_hours || '',
          logo_url: updated.logo_url || '',
        })

        toast.success('Shop information updated successfully.')
      } else {
        const response = await api.post('/shops', payload)
        const created = response.data.shop

        setShopId(created.id)
        setShop({
          name: created.name || '',
          description: created.description || '',
          location: created.location || '',
          contact_phone: created.contact_phone || '',
          contact_email: created.contact_email || '',
          opening_hours: created.opening_hours || '',
          logo_url: created.logo_url || '',
        })

        toast.success('Your shop has been created successfully.')
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Could not save shop information.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-gray-500">
        <LoaderCircle className="animate-spin" />
        Loading shop information...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <BackButton fallback="/owner" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {loadError}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <BackButton fallback="/owner" />

      <div>
        <p className="text-sm font-semibold text-orange-600">
          SHOP OWNER PANEL
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {shopId ? 'Manage Shop' : 'Create Your Shop'}
        </h1>
        <p className="mt-2 text-gray-500">
          {shopId
            ? 'Update your shop information.'
            : 'Set up your shop to start managing your menu.'}
        </p>
      </div>

      {!shopId && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          You have not created a shop yet. Complete this form to create your shop.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="flex items-center gap-3 border-b pb-5">
          <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
            <Store size={25} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Shop Information
            </h2>
            <p className="text-sm text-gray-500">
              Enter your shop details
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Shop Name *
            </label>
            <input
              name="name"
              value={shop.name}
              onChange={handleChange}
              required
              maxLength={150}
              placeholder="Enter your shop name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={shop.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your shop..."
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={16} /> Location
            </label>
            <input
              name="location"
              value={shop.location}
              onChange={handleChange}
              placeholder="Shop location"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Phone size={16} /> Contact Number
            </label>
            <input
              name="contact_phone"
              value={shop.contact_phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Mail size={16} /> Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={shop.contact_email}
              onChange={handleChange}
              placeholder="shop@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock size={16} /> Opening Hours
            </label>
            <input
              name="opening_hours"
              value={shop.opening_hours}
              onChange={handleChange}
              placeholder="e.g. 9:00 AM - 8:00 PM"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImagePlus size={16} /> Shop Logo/Image URL
            </label>
            <input
              name="logo_url"
              type="url"
              value={shop.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/shop.jpg"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {shop.logo_url && (
          <img
            src={shop.logo_url}
            alt="Shop preview"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
            className="max-h-56 w-full rounded-xl object-cover"
          />
        )}

        <div className="flex justify-end border-t pt-5">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : shopId ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}
            {saving
              ? 'Saving...'
              : shopId
                ? 'Save Changes'
                : 'Create Shop'}
          </button>
        </div>
      </form>
    </div>
  )
}
