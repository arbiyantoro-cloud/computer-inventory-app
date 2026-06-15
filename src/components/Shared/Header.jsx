import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header({ user, userRole, onMenuClick }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded">
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Computer Inventory</h1>
            <p className="text-sm text-gray-500 capitalize">Role: {userRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
