
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus, Search, Pencil, Trash2, UtensilsCrossed,
  X, ImagePlus
} from 'lucide-react'
import BackButton from '../../components/common/BackButton'

const initialItems = [
  { id: 1, name: 'Chicken Burger', category: 'Fast Food', price: 150, description: 'Juicy chicken burger with fresh vegetables.', image: '', available: true },
  { id: 2, name: 'Chicken Fried Rice', category: 'Rice', price: 180, description: 'Delicious fried rice with chicken.', image: '', available: true },
  { id: 3, name: 'Cold Coffee', category: 'Drinks', price: 100, description: 'Fresh and creamy cold coffee.', image: '', available: false },
]

const emptyForm = {
  name: '',
  category: 'Fast Food',
  price: '',
  description: '',
  image: '',
  available: true,
}

export default function ManageMenu() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setForm({ ...item })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name.trim() || !form.price || Number(form.price) <= 0) {
      toast.error('Please enter a valid name and price.')
      return
    }

    if (editingId) {
      setItems(items.map(item =>
        item.id === editingId
          ? { ...form, id: editingId, price: Number(form.price) }
          : item
      ))
      toast.success('Menu item updated!')
    } else {
      setItems([...items, {
        ...form,
        id: Date.now(),
        price: Number(form.price),
      }])
      toast.success('Menu item added!')
    }

    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    setItems(items.filter(item => item.id !== id))
    toast.success('Menu item deleted!')
  }

  const toggleAvailability = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton fallback="/owner" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-600">SHOP OWNER PANEL</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Menu</h1>
          <p className="text-gray-500 mt-2">Add, update and manage your food items.</p>
        </div>

        <button onClick={openAddForm} className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold transition">
          <Plus size={19} /> Add Menu Item
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-gray-500">Total Items</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{items.length}</h2>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-gray-500">Available</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">{items.filter(i => i.available).length}</h2>
        </div>
        <div className="bg-white border rounded-2xl p-5 col-span-2 md:col-span-1">
          <p className="text-sm text-gray-500">Unavailable</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">{items.filter(i => !i.available).length}</h2>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food or category..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-44 object-cover" />
            ) : (
              <div className="h-44 bg-orange-50 flex items-center justify-center text-orange-300">
                <UtensilsCrossed size={55} />
              </div>
            )}

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{item.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-3">{item.name}</h3>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <p className="text-sm text-gray-500 min-h-10">{item.description}</p>

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xl font-bold text-orange-600">৳{item.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvailability(item.id)} title="Toggle availability" className="text-xs border rounded-lg px-3 py-2 hover:bg-gray-50">
                    {item.available ? 'Mark unavailable' : 'Mark available'}
                  </button>
                  <button onClick={() => openEditForm(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-700 mt-4">No menu items found</h3>
          <p className="text-sm text-gray-500 mt-1">Try another search or add a new item.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                <p className="text-sm text-gray-500 mt-1">Enter food item details.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Food Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Chicken Burger" className="w-full border rounded-xl px-4 py-3 outline-none focus:border-orange-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded-xl px-3 py-3 outline-none focus:border-orange-500">
                    <option>Fast Food</option>
                    <option>Rice</option>
                    <option>Drinks</option>
                    <option>Snacks</option>
                    <option>Desserts</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (৳) *</label>
                  <input type="number" min="1" name="price" value={form.price} onChange={handleChange} required placeholder="150" className="w-full border rounded-xl px-3 py-3 outline-none focus:border-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Describe the food item..." className="w-full border rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2"><ImagePlus size={16} /> Image URL</label>
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/food.jpg" className="w-full border rounded-xl px-4 py-3 outline-none focus:border-orange-500" />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
                This item is currently available
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl border font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
