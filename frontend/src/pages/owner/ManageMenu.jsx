
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UtensilsCrossed,
  X,
  ImagePlus,
  LoaderCircle,
} from 'lucide-react'
import BackButton from '../../components/common/BackButton'
import api from '../../api/axios'

const emptyForm = {
  name: '',
  description: '',
  image_url: '',
  price: '',
  discount_percent: '0',
  is_available: true,
}

export default function ManageMenu() {
  const [items, setItems] = useState([])
  const [shop, setShop] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  const fetchMenu = async () => {
    try {
      setLoading(true)
      setPageError('')

      let currentShop

      try {
        const shopResponse = await api.get('/shops/my-shop')
        currentShop = shopResponse.data.shop

        if (!currentShop) {
          setShop(null)
          setItems([])
          return
        }

        setShop(currentShop)
      } catch (error) {
        if (error.response?.status === 404) {
          setShop(null)
          setItems([])
          return
        }

        throw error
      }

      try {
        const foodResponse = await api.get('/food', {
          params: {
            shop_id: currentShop.id,
            page: 1,
            limit: 100,
          },
        })

        setItems(foodResponse.data.foodItems || [])
      } catch (error) {
        setItems([])
        setPageError(
          error.response?.data?.message ||
          'Shop found, but menu could not be loaded.'
        )
      }
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
        'Could not load your shop information. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) return items

    return items.filter((item) =>
      `${item.name} ${item.description || ''}`
        .toLowerCase()
        .includes(term)
    )
  }, [items, search])

  const availableCount = items.filter(
    (item) => Number(item.is_available) === 1 || item.is_available === true
  ).length

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      image_url: item.image_url || '',
      price: String(item.price ?? ''),
      discount_percent: String(item.discount_percent ?? 0),
      is_available: Number(item.is_available) === 1 || item.is_available === true,
    })
    setShowForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!shop) {
      toast.error('Please create your shop first.')
      return
    }

    if (!form.name.trim() || Number(form.price) <= 0) {
      toast.error('Enter a valid food name and price.')
      return
    }

    const discount = Number(form.discount_percent)

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      toast.error('Discount must be between 0 and 100.')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      price: Number(form.price),
      discount_percent: discount,
      is_available: form.is_available,
    }

    try {
      setSaving(true)

      if (editingId) {
        await api.put(`/food/${editingId}`, payload)
        toast.success('Menu item updated successfully.')
      } else {
        await api.post('/food', payload)
        toast.success('Menu item added successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await fetchMenu()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Could not save menu item.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await api.delete(`/food/${id}`)
      setItems((previous) =>
        previous.filter((item) => item.id !== id)
      )
      toast.success('Menu item deleted successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Could not delete menu item.'
      )
    }
  }

  const toggleAvailability = async (item) => {
    const currentlyAvailable =
      Number(item.is_available) === 1 || item.is_available === true

    const nextAvailability = !currentlyAvailable

    try {
      await api.put(`/food/${item.id}`, {
        is_available: nextAvailability,
      })

      setItems((previous) =>
        previous.map((food) =>
          food.id === item.id
            ? { ...food, is_available: nextAvailability ? 1 : 0 }
            : food
        )
      )

      toast.success(
        nextAvailability
          ? 'Item marked as available.'
          : 'Item marked as unavailable.'
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Could not update availability.'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-gray-500">
        <LoaderCircle className="animate-spin" />
        Loading menu...
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <BackButton fallback="/owner" />

        <div className="rounded-2xl border bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Unable to Load Menu
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {pageError}
          </p>

          <button
            type="button"
            onClick={fetchMenu}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <BackButton fallback="/owner" />

        <div className="rounded-2xl border bg-white p-10 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Create your shop first
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You need an active shop before adding food items.
          </p>

          <button
            type="button"
            onClick={() => window.location.assign('/owner/shop')}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Manage Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <BackButton fallback="/owner" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            SHOP OWNER PANEL
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Manage Menu
          </h1>

          <p className="mt-2 text-gray-500">
            Manage food items for {shop.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus size={19} />
          Add Menu Item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Items</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {items.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Available</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {availableCount}
          </h2>
        </div>

        <div className="col-span-2 rounded-2xl border bg-white p-5 md:col-span-1">
          <p className="text-sm text-gray-500">Unavailable</p>
          <h2 className="mt-2 text-3xl font-bold text-red-500">
            {items.length - availableCount}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="relative max-w-md">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search food items..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const available =
            Number(item.is_available) === 1 || item.is_available === true

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-orange-50 text-orange-300">
                  <UtensilsCrossed size={55} />
                </div>
              )}

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.name}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      available
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="min-h-10 text-sm text-gray-500">
                  {item.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-orange-600">
                    ৳{Number(item.final_price ?? item.price).toFixed(2)}
                  </span>

                  {Number(item.discount_percent) > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ৳{Number(item.price).toFixed(2)}
                      </span>

                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                        {item.discount_percent}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-gray-50"
                  >
                    {available ? 'Mark unavailable' : 'Mark available'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-300" />

          <h3 className="mt-4 font-bold text-gray-700">
            No menu items found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your first food item or try another search.
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your food item details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Food Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Chicken Burger"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Price (৳) *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border px-3 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="discount_percent"
                    value={form.discount_percent}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ImagePlus size={16} />
                  Image URL
                </label>

                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/food.jpg"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 accent-orange-500"
                />
                This item is currently available
              </label>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border px-5 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Item'
                      : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
