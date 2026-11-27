
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
  Store,
  CheckCircle2,
  CircleOff,
  Sparkles,
  Tag,
  Clock3,
  ArrowUpRight,
  Camera,
  ShoppingBag,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'
import BackButton from '../../components/common/BackButton'
import api from '../../api/axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

const emptyForm = {
  name: '',
  description: '',
  image_url: '',
  price: '',
  discount_percent: '0',
  is_available: true,
}

const inputClass =
  'w-full rounded-xl border border-[#e9e5dc] bg-[#fcfbf8] px-4 py-3 text-sm text-[#292d23] outline-none transition placeholder:text-[#aaa99f] hover:border-[#d8d0c1] focus:border-[#e97835] focus:bg-white focus:ring-4 focus:ring-orange-100/70'

function isAvailable(item) {
  return Number(item.is_available) === 1 || item.is_available === true
}

function SectionLabel({ children }) {
  return (
    <label className="mb-2 block text-sm font-bold text-[#414438]">
      {children}
    </label>
  )
}

function StatCard({ icon: Icon, label, value, variant }) {
  const styles = {
    orange: 'bg-[#fff1e5] text-[#d9773c]',
    green: 'bg-[#edf4e8] text-[#66844d]',
    red: 'bg-[#fff0ed] text-[#d66b57]',
  }

  return (
    <div className="rounded-2xl border border-[#ece8df] bg-white p-5 shadow-sm shadow-[#373629]/[0.03] transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#969589]">
            {label}
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-[#292d23]">
            {value}
          </h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[variant]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default function ManageMenu() {
  const [items, setItems] = useState([])
  const [shop, setShop] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [imageFile])

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
        const foodResponse = await api.get('/food-items', {
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

  const availableCount = items.filter(isAvailable).length
  const unavailableCount = items.length - availableCount

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
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
      is_available: isAvailable(item),
    })
    setImageFile(null)
    setShowForm(true)
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null

    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG and WEBP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setImageFile(file)
    event.target.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!shop) {
      toast.error('Please create your shop first.')
      return
    }

    if (!form.name.trim() || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      toast.error('Enter a valid food name and price.')
      return
    }

    const discount = Number(form.discount_percent)

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      toast.error('Discount must be between 0 and 100.')
      return
    }

    const payload = new FormData()

    payload.append('name', form.name.trim())
    payload.append('description', form.description.trim())
    payload.append('price', String(Number(form.price)))
    payload.append('discount_percent', String(discount))
    payload.append('is_available', form.is_available ? '1' : '0')

    if (imageFile) {
      payload.append('image', imageFile)
    }

    try {
      setSaving(true)

      if (editingId) {
        await api.put(`/food-items/${editingId}`, payload)
        toast.success('Menu item updated successfully.')
      } else {
        await api.post('/food-items', payload)
        toast.success('Menu item added successfully.')
      }

      resetForm()
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
      setDeletingId(id)
      await api.delete(`/food-items/${id}`)

      setItems((previous) =>
        previous.filter((item) => item.id !== id)
      )

      toast.success('Menu item deleted successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Could not delete menu item.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const toggleAvailability = async (item) => {
    const nextAvailability = !isAvailable(item)

    try {
      await api.put(`/food-items/${item.id}`, {
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
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
          <LoaderCircle size={30} className="animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#858579]">
          Loading your menu...
        </p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <BackButton fallback="/owner" />

        <div className="rounded-[26px] border border-[#ece8df] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UtensilsCrossed size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#292d23]">
            Unable to Load Menu
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#929184]">
            {pageError}
          </p>

          <button
            type="button"
            onClick={fetchMenu}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e97835] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9672b]"
          >
            <RefreshCw size={16} />
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

        <div className="overflow-hidden rounded-[28px] border border-[#ece8df] bg-white text-center shadow-sm">
          <div className="bg-[#292f25] px-6 py-10 text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-[#f3ae79]">
              <Store size={38} />
            </div>
            <h2 className="mt-5 text-2xl font-black">
              Your shop comes first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#d2d5c9]">
              Create your shop profile before adding food items to your menu.
            </p>
          </div>

          <div className="px-6 py-8">
            <button
              type="button"
              onClick={() => window.location.assign('/owner/shop')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e97835] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9672b]"
            >
              <Store size={17} />
              Manage Shop
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const previewImage =
    imagePreview || getImageUrl(form.image_url)

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <BackButton fallback="/owner" />

      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#292f25] px-6 py-8 text-white shadow-xl shadow-[#303728]/10 sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-[#e77b3c]/20 blur-3xl" />
        <div className="absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-[#a7b47a]/15 blur-3xl" />

        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-wide text-[#f6d4b8]">
              <Sparkles size={14} />
              OWNER STUDIO
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Manage your menu
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-7 text-[#d2d5c9] sm:text-base">
              Organize your food collection, update prices and keep students
              informed about what's available at your shop.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#d9dfce]">
              <span className="flex items-center gap-2">
                <Store size={15} className="text-[#c5d99b]" />
                {shop.name}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#c5d99b]" />
                {items.length} menu items
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-[#e97835] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#f18b4c] md:self-center"
          >
            <Plus size={19} />
            Add Menu Item
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={UtensilsCrossed}
          label="Total Items"
          value={items.length}
          variant="orange"
        />
        <StatCard
          icon={CheckCircle2}
          label="Available"
          value={availableCount}
          variant="green"
        />
        <StatCard
          icon={CircleOff}
          label="Unavailable"
          value={unavailableCount}
          variant="red"
        />
      </div>

      <section className="rounded-[24px] border border-[#ece8df] bg-white p-4 shadow-sm shadow-[#373629]/[0.03] sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-[#292d23]">
              Your food collection
            </h2>
            <p className="mt-1 text-xs text-[#99988c]">
              Browse and manage all items in your shop.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa99f]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search food items..."
              className={`${inputClass} pl-11`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#99988c] hover:bg-[#f3f0e9]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#f0ede6] pt-4 text-xs font-semibold text-[#8f8e82]">
          <span className="flex items-center gap-1.5 rounded-full bg-[#f6f3eb] px-3 py-2">
            <ShoppingBag size={14} />
            {filteredItems.length} showing
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#edf4e8] px-3 py-2 text-[#66844d]">
            <CheckCircle2 size={14} />
            {availableCount} available
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#fff0ed] px-3 py-2 text-[#d66b57]">
            <CircleOff size={14} />
            {unavailableCount} unavailable
          </span>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const available = isAvailable(item)
            const hasDiscount = Number(item.discount_percent) > 0
            const finalPrice = Number(
              item.final_price ?? item.price
            )

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[25px] border border-[#ece8df] bg-white shadow-sm shadow-[#373629]/[0.03] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#373629]/[0.07]"
              >
                <div className="relative h-52 overflow-hidden bg-[#f5f1e8]">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#c4bca9]">
                      <ImageIcon size={45} strokeWidth={1.2} />
                      <span className="text-xs font-semibold">
                        No food image
                      </span>
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-extrabold shadow-sm backdrop-blur ${
                        available
                          ? 'bg-[#edf6e7]/95 text-[#5e7b46]'
                          : 'bg-[#fff0ed]/95 text-[#cb6552]'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          available ? 'bg-[#76a45a]' : 'bg-[#d66b57]'
                        }`}
                      />
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#e97835] px-3 py-2 text-[11px] font-black text-white shadow-md">
                      <Tag size={12} />
                      {item.discount_percent}% OFF
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-lg font-black text-[#292d23]">
                        {item.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#969589]">
                        {item.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#f0ede6] pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#a09e91]">
                        Selling price
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-2xl font-black tracking-tight text-[#df783b]">
                          ৳{finalPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-semibold text-[#aaa99f] line-through">
                            ৳{Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {hasDiscount && (
                      <span className="rounded-xl bg-[#edf4e8] px-2.5 py-2 text-[10px] font-extrabold text-[#66844d]">
                        Save ৳{(Number(item.price) - finalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#f0ede6] pt-4">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${
                        available
                          ? 'bg-[#fff3eb] text-[#c76e39] hover:bg-[#ffe7d5]'
                          : 'bg-[#edf4e8] text-[#66844d] hover:bg-[#e1edd8]'
                      }`}
                    >
                      {available ? (
                        <CircleOff size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      {available ? 'Unavailable' : 'Available'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        aria-label={`Edit ${item.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2f8] text-[#54749b] transition hover:bg-[#dfe9f6]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        aria-label={`Delete ${item.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0ed] text-[#d66b57] transition hover:bg-[#ffe1dc] disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[26px] border border-[#ece8df] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff1e5] text-[#df783b]">
            {search ? <Search size={34} /> : <UtensilsCrossed size={36} />}
          </div>

          <h3 className="mt-5 text-xl font-black text-[#292d23]">
            {search ? 'No matching food items' : 'Your menu is waiting'}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#969589]">
            {search
              ? 'Try another search term to find what you are looking for.'
              : 'Start building your food collection by adding your first menu item.'}
          </p>

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-5 rounded-xl bg-[#f4f1e9] px-5 py-3 text-sm font-bold text-[#686b5c] transition hover:bg-[#eae6db]"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e97835] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9672b]"
            >
              <Plus size={17} />
              Add First Item
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171b15]/65 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetForm()
            }
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-[#fcfbf8] shadow-2xl shadow-black/20">
            <div className="relative overflow-hidden bg-[#292f25] px-6 py-6 text-white sm:px-8">
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#e77b3c]/20 blur-2xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f2bd94]">
                    <Sparkles size={14} />
                    Menu editor
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">
                    {editingId ? 'Edit menu item' : 'Add new item'}
                  </h2>

                  <p className="mt-1 text-xs text-[#d2d5c9]">
                    {editingId
                      ? 'Update your food information.'
                      : 'Add something delicious to your menu.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  aria-label="Close form"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 overflow-y-auto p-5 sm:p-8"
            >
              <div>
                <SectionLabel>Food name *</SectionLabel>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="e.g. Chicken Burger"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <SectionLabel>Regular price (৳) *</SectionLabel>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="150"
                    className={inputClass}
                  />
                </div>

                <div>
                  <SectionLabel>Discount (%)</SectionLabel>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    name="discount_percent"
                    value={form.discount_percent}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#eee7d9] bg-[#f6f3eb] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#858579]">
                    Estimated selling price
                  </span>
                  <span className="text-xl font-black text-[#df783b]">
                    ৳
                    {(
                      Math.max(0, Number(form.price) || 0) *
                      (1 - Math.min(100, Math.max(0, Number(form.discount_percent) || 0)) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <SectionLabel>Description</SectionLabel>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your food item, ingredients or special features..."
                  className={`${inputClass} resize-none leading-6`}
                />
              </div>

              <div>
                <SectionLabel>
                  <span className="flex items-center gap-2">
                    <ImagePlus size={16} className="text-[#df783b]" />
                    Food image
                  </span>
                </SectionLabel>

                <label
                  htmlFor="food-image"
                  className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#e9dfd0] bg-white text-center transition hover:border-[#e78b50] hover:bg-[#fff8ef]"
                >
                  {previewImage ? (
                    <div className="relative h-48 w-full">
                      <img
                        src={previewImage}
                        alt="Food preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                        <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#373b30]">
                          <Camera size={15} />
                          Change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-9">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0df] text-[#df783b]">
                        <ImagePlus size={25} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#45483d]">
                        Upload food image
                      </p>
                      <p className="mt-1 text-xs text-[#99988c]">
                        JPG, PNG or WEBP · Maximum 5 MB
                      </p>
                    </div>
                  )}
                </label>

                <input
                  id="food-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                {imageFile && (
                  <p className="mt-2 break-all text-xs text-[#858579]">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e9e5dc] bg-white p-4 transition hover:border-[#d8d0c1]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e8] text-[#66844d]">
                    <Clock3 size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#414438]">
                      Item availability
                    </p>
                    <p className="mt-1 text-xs text-[#969589]">
                      Allow students to see this item as available.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="h-5 w-5 shrink-0 accent-[#e97835]"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-[#eeeae1] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-[#e6e1d6] bg-white px-5 py-3 text-sm font-bold text-[#77776c] transition hover:bg-[#f5f2eb] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e97835] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-100 transition hover:bg-[#d9672b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : editingId ? (
                    <Pencil size={17} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Item'
                      : 'Add Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
