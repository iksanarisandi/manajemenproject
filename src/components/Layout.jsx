import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Project Management</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-screen-xl mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
