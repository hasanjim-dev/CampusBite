
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
  ArrowUpRight,
  Camera,
  Sparkles,
  CheckCircle2,
  Utensils,
  Building2,
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

const emptyShop = {
  name: '',
  description: '',
  location: '',
  contact_phone: '',
  contact_email: '',
  opening_hours: '',
  logo_url: '',
}

const inputClass =
  'w-full rounded-2xl border border-[#e9e5dc] bg-[#fcfbf8] px-4 py-3.5 text-sm text-[#25291f] outline-none transition placeholder:text-[#aaa99f] hover:border-[#d8d0c1] focus:border-[#e97835] focus:bg-white focus:ring-4 focus:ring-orange-100/70'

function Field({ label, icon: Icon, children, required = false }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold text-[#414438]">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7eee3] text-[#dc7739]">
            <Icon size={15} />
          </span>
        )}
        {label}
        {required && <span className="text-[#e16c35]">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHeading({ icon: Icon, title, description, number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0df] text-[#df783b]">
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-[#292d23]">
            {title}
          </h2>
          <span className="rounded-full bg-[#f4f1e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#929184]">
            {number}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#969589]">{description}</p>
      </div>
    </div>
  )
}

export default function ManageShop() {
  const [shop, setShop] = useState(emptyShop)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [shopId, setShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('')
      return
    }

    const preview = URL.createObjectURL(logoFile)
    setLogoPreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [logoFile])

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

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG and WEBP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setLogoFile(file)
    event.target.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!shop.name.trim()) {
      toast.error('Shop name is required.')
      return
    }

    setSaving(true)

    const formData = new FormData()

    formData.append('name', shop.name.trim())
    formData.append('description', shop.description.trim())
    formData.append('location', shop.location.trim())
    formData.append('contact_phone', shop.contact_phone.trim())
    formData.append('contact_email', shop.contact_email.trim())
    formData.append('opening_hours', shop.opening_hours.trim())

    if (logoFile) {
      formData.append('image', logoFile)
    }

    try {
      if (shopId) {
        const response = await api.put('/shops/my-shop', formData)
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

        setLogoFile(null)
        toast.success('Shop information updated successfully.')
      } else {
        const response = await api.post('/shops', formData)
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

        setLogoFile(null)
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
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
          <LoaderCircle size={30} className="animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#858579]">
          Loading your shop information...
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <BackButton fallback="/owner" />
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {loadError}
        </div>
      </div>
    )
  }

  const currentLogo = logoPreview || getImageUrl(shop.logo_url)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
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
              {shopId ? 'Manage your shop' : 'Bring your shop online'}
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-7 text-[#d2d5c9] sm:text-base">
              {shopId
                ? 'Keep your shop profile fresh. Update your details and make it easier for students to discover you.'
                : 'Create your shop profile and introduce your food business to the CampusBite community.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#d9dfce]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#c5d99b]" />
                Shop profile
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#c5d99b]" />
                Contact details
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#c5d99b]" />
                Brand identity
              </span>
            </div>
          </div>

          <div className="flex h-32 w-32 shrink-0 items-center justify-center self-start rounded-[30px] border border-white/15 bg-white/10 text-[#f5b17d] shadow-inner md:h-36 md:w-36 md:self-center">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt="Shop logo"
                className="h-full w-full rounded-[30px] object-cover"
              />
            ) : (
              <Store size={58} strokeWidth={1.2} />
            )}
          </div>
        </div>
      </section>

      {!shopId && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#f3d8b8] bg-[#fff7ed] p-4 text-sm text-[#9b6337]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#df783b]">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="font-bold">Your shop is not set up yet</p>
            <p className="mt-1 leading-6 text-[#a47b59]">
              Complete the information below to create your shop profile.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-[26px] border border-[#ece8df] bg-white p-5 shadow-sm shadow-[#373629]/[0.03] sm:p-7">
              <SectionHeading
                icon={Building2}
                title="Basic information"
                description="Tell students about your food shop."
                number="01"
              />

              <div className="mt-7 space-y-5">
                <Field label="Shop name" icon={Store} required>
                  <input
                    name="name"
                    value={shop.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    placeholder="e.g. Campus Kitchen"
                    className={inputClass}
                  />
                </Field>

                <Field label="Shop description" icon={Utensils}>
                  <textarea
                    name="description"
                    value={shop.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="What makes your shop special? Tell students about your food, specialties and experience..."
                    className={`${inputClass} min-h-32 resize-y leading-7`}
                  />
                  <div className="text-right text-xs text-[#aaa99f]">
                    {shop.description.length} characters
                  </div>
                </Field>
              </div>
            </section>

            <section className="rounded-[26px] border border-[#ece8df] bg-white p-5 shadow-sm shadow-[#373629]/[0.03] sm:p-7">
              <SectionHeading
                icon={MapPin}
                title="Contact & location"
                description="Help students find and contact your shop."
                number="02"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Shop location" icon={MapPin}>
                  <input
                    name="location"
                    value={shop.location}
                    onChange={handleChange}
                    placeholder="Building, floor or campus area"
                    className={inputClass}
                  />
                </Field>

                <Field label="Contact number" icon={Phone}>
                  <input
                    name="contact_phone"
                    value={shop.contact_phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className={inputClass}
                  />
                </Field>

                <Field label="Contact email" icon={Mail}>
                  <input
                    type="email"
                    name="contact_email"
                    value={shop.contact_email}
                    onChange={handleChange}
                    placeholder="shop@example.com"
                    className={inputClass}
                  />
                </Field>

                <Field label="Opening hours" icon={Clock}>
                  <input
                    name="opening_hours"
                    value={shop.opening_hours}
                    onChange={handleChange}
                    placeholder="9:00 AM - 8:00 PM"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-[26px] border border-[#ece8df] bg-white shadow-sm shadow-[#373629]/[0.03]">
              <div className="bg-[#f8f5ed] px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#df783b] shadow-sm">
                    <Camera size={19} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[#34382d]">
                      Shop identity
                    </h2>
                    <p className="mt-0.5 text-xs text-[#929184]">
                      Your shop logo
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <label
                  htmlFor="shop-logo"
                  className="group flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#e9dfd0] bg-[#fcfaf6] text-center transition hover:border-[#e78b50] hover:bg-[#fff8ef]"
                >
                  {currentLogo ? (
                    <img
                      src={currentLogo}
                      alt="Shop logo preview"
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0df] text-[#df783b] transition group-hover:scale-105">
                        <ImagePlus size={29} />
                      </div>
                      <p className="mt-4 text-sm font-bold text-[#45483d]">
                        Upload shop logo
                      </p>
                      <p className="mt-2 px-4 text-xs leading-5 text-[#9a998d]">
                        Choose an image from your device
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="shop-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="sr-only"
                />

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#969589]">
                    JPG, PNG, WEBP · Max 5 MB
                  </span>
                  <label
                    htmlFor="shop-logo"
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#fff0df] px-3 py-2 text-xs font-bold text-[#d97538] transition hover:bg-[#ffe5cb]"
                  >
                    <ImagePlus size={14} />
                    {currentLogo ? 'Change' : 'Browse'}
                  </label>
                </div>

                {logoFile && (
                  <p className="mt-3 break-all rounded-xl bg-[#f4f5ed] px-3 py-2 text-xs text-[#737b5b]">
                    Selected: {logoFile.name}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[26px] border border-[#e8eadf] bg-[#f3f5eb] p-5">
              <div className="flex items-center gap-2 text-[#69764e]">
                <Sparkles size={17} />
                <h3 className="text-sm font-extrabold">Profile tip</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#747b65]">
                Use a clear shop logo and accurate contact details. A complete
                profile helps students recognize and connect with your shop.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-[#dfe4d2] pt-4 text-xs font-semibold text-[#77805f]">
                <CheckCircle2 size={15} />
                Make your shop easy to discover
              </div>
            </section>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-4 rounded-[26px] border border-[#ece8df] bg-white p-5 shadow-sm shadow-[#373629]/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-sm font-extrabold text-[#34382d]">
              {shopId ? 'Ready to update your shop?' : 'Ready to launch your shop?'}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#99988c]">
              Your information will be saved to your shop profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e97835] px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200/60 transition hover:-translate-y-0.5 hover:bg-[#d9672b] hover:shadow-orange-300/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
            {!saving && <ArrowUpRight size={17} />}
          </button>
        </div>
      </form>
    </div>
  )
}
