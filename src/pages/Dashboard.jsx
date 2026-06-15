import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(userData?.role || 'teknisi')

        // Fetch statistics
        const [{ count: totalComputers }, { data: statusData }, { count: maintenanceCount }] = await Promise.all([
          supabase.from('inventaris_komputer').select('*', { count: 'exact', head: true }),
          supabase.from('inventaris_komputer').select('status'),
          supabase.from('jadwal_maintenance').select('*', { count: 'exact', head: true }),
        ])

        const statusCounts = statusData?.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1
          return acc
        }, {}) || {}

        setStats({
          totalComputers: totalComputers || 0,
          statusCounts,
          maintenanceCount: maintenanceCount || 0,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = stats
    ? Object.entries(stats.statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : []

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6']

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Server className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Komputer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalComputers || 0}</p>
                </div>
              </div>

              <div className="card flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.statusCounts?.aktif || 0}</p>
                </div>
              </div>

              <div className="card flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Maintenance Terjadwal</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.maintenanceCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Status Komputer</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">Tidak ada data</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Statistik Bulanan</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: 'Jan', maintenance: 5 },
                    { month: 'Feb', maintenance: 8 },
                    { month: 'Mar', maintenance: 12 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="maintenance" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
