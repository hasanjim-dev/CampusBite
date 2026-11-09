
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  GraduationCap,
  IdCard,
  Camera,
  Pencil,
  Save,
  X,
  BookOpen,
  ArrowLeft,
} from 'lucide-react'

const initialProfile = {
  name: 'Hasan Jim',
  email: 'hasan@example.com',
  studentId: 'SE-2023-001',
  department: 'Software Engineering',
  university: 'Daffodil International University',
  bio: 'Software Engineering student passionate about technology, web development and learning new skills.',
  semester: '8th Semester',
}

export default function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [photo, setPhoto] = useState(
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
  )

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setPhoto(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setEditing(false)
    toast.success('Profile updated successfully! (Demo)')
  }

  const handleCancel = () => {
    setProfile(initialProfile)
    setEditing(false)
    setPhoto(
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
    )
  }

  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      icon: User,
      placeholder: 'Enter your name',
    },
    {
      name: 'email',
      label: 'Email Address',
      icon: Mail,
      placeholder: 'Enter your email',
    },
    {
      name: 'studentId',
      label: 'Student ID',
      icon: IdCard,
      placeholder: 'Enter student ID',
    },
    {
      name: 'department',
      label: 'Department',
      icon: GraduationCap,
      placeholder: 'Enter department',
    },
    {
      name: 'university',
      label: 'University',
      icon: BookOpen,
      placeholder: 'Enter university',
    },
    {
      name: 'semester',
      label: 'Current Semester',
      icon: GraduationCap,
      placeholder: 'Enter semester',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="mt-2 text-gray-500">
          View and manage your student profile information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-orange-400 to-orange-600 sm:h-44" />

        <div className="px-6 pb-8 sm:px-9">
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-5">
            <div className="relative">
              <img
                src={photo}
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-sm"
              />

              <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-orange-500 p-2 text-white shadow hover:bg-orange-600">
                <Camera size={17} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
                >
                  <Save size={17} />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-gray-500">
              {profile.department} Student
            </p>

            <span className="mt-3 inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-600">
              {profile.semester}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <h2 className="text-xl font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your basic student information.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon

            return (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {field.label}
                </label>

                <div className="relative">
                  <Icon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name={field.name}
                    value={profile[field.name]}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-default"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bio */}
        <div className="mt-7">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            About Me
          </label>

          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!editing}
            rows={4}
            maxLength={300}
            placeholder="Tell us about yourself..."
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-default"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {profile.bio.length}/300 characters
          </p>
        </div>
      </div>
    </div>
  )
}
