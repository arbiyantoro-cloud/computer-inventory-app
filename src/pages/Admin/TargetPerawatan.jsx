import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import Table from '../components/Shared/Table'
import Modal from '../components/Shared/Modal'
import { Plus, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TargetPerawatan() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    bulan: '',
    tahun: new Date().getFullYear(),
    target_unit: '',
    tercapai: '',
    catatan: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      setUserRole(data?.role || 'admin')
    }
    fetchUser()
  }, [])

  useEffect(() => {
    fetchTargets()
  }, [])

  const fetchTargets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('target_perawatan').select('*').order('tahun', { ascending: false }).order('bulan', { ascending: false })
      if (error) throw error
      setTargets(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const saveData = {
        bulan: parseInt(formData.bulan),
        tahun: parseInt(formData.tahun),
        target_unit: parseInt(formData.target_unit),
        tercapai: parseInt(formData.tercapai) || 0,
        catatan: formData.catatan,
      }

      if (editingId) {
        const { error } = await supabase.from('target_perawatan').update(saveData).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('target_perawatan').insert([saveData])
        if (error) throw error
      }
      fetchTargets()
      setShowModal(false)
      setEditingId(null)
      setFormData({ bulan: '', tahun: new Date().getFullYear(), target_unit: '', tercapai: '', catatan: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData(item)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus?')) return
    try {
      const { error } = await supabase.from('target_perawatan').delete().eq('id', id)
      if (error) throw error
      fetchTargets()
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus data')
    }
  }

  const columns = [
    {
      key: 'bulan',
      label: 'Bulan',
      render: (val) => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][val],
    },
    { key: 'tahun', label: 'Tahun' },
    { key: 'target_unit', label: 'Target Unit' },
    { key: 'tercapai', label: 'Tercapai' },
    {
      key: 'tercapai',
      label: 'Persentase',
      render: (val, row) => {
        const percent = row.target_unit > 0 ? Math.round((val / row.target_unit) * 100) : 0
        return `${percent}%`
      },
    },
  ]

  const chartData = targets
    .sort((a, b) => a.bulan - b.bulan)
    .map((t) => ({
      bulan: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][t.bulan],
      target: t.target_unit,
      tercapai: t.tercapai,
    }))
    .slice(0, 12)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Target Perawatan Bulanan</h1>
              <button
                onClick={() => {
                  setEditingId(null)
                  setFormData({ bulan: '', tahun: new Date().getFullYear(), target_unit: '', tercapai: '', catatan: '' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} /> Tambah Target
              </button>
            </div>

            {chartData.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Grafik Target vs Realisasi</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#3B82F6" name="Target" />
                    <Bar dataKey="tercapai" fill="#10B981" name="Tercapai" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <Table columns={columns} data={targets} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Target' : 'Tambah Target Perawatan'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select
                value={formData.bulan}
                onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Pilih Bulan</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input
                type="number"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Unit</label>
              <input
                type="number"
                value={formData.target_unit}
                onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tercapai</label>
              <input
                type="number"
                value={formData.tercapai}
                onChange={(e) => setFormData({ ...formData, tercapai: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="input-field"
              rows="3"
            ></textarea>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
