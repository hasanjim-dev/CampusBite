
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="relative mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
