import { useState } from 'react'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import { useEffect } from 'react'
import { supabase } from '../config/supabase'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(data?.role || 'admin')
    }

    fetchUser()
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h1>
            <p className="text-gray-600">Pilih menu di sidebar untuk memulai.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
