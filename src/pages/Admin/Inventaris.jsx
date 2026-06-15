import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import Table from '../components/Shared/Table'
import Modal from '../components/Shared/Modal'
import { Plus } from 'lucide-react'

export default function Inventaris() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inventaris, setInventaris] = useState([])
  const [barang, setBarang] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nomor_seri: '',
    barang_id: '',
    lokasi: '',
    status: 'aktif',
    tanggal_perolehan: '',
    keterangan: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      setUserRole(data?.role || 'teknisi')
    }
    fetchUser()
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invRes, barangRes] = await Promise.all([
        supabase
          .from('inventaris_komputer')
          .select('id, nomor_seri, barang_id, lokasi, status, tanggal_perolehan, keterangan, master_barang(nama_barang)')
          .order('created_at', { ascending: false }),
        supabase.from('master_barang').select('id, nama_barang'),
      ])
      setInventaris(invRes.data || [])
      setBarang(barangRes.data || [])
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
        nomor_seri: formData.nomor_seri,
        barang_id: parseInt(formData.barang_id),
        lokasi: formData.lokasi,
        status: formData.status,
        tanggal_perolehan: formData.tanggal_perolehan,
        keterangan: formData.keterangan,
      }

      if (editingId) {
        const { error } = await supabase.from('inventaris_komputer').update(saveData).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('inventaris_komputer').insert([saveData])
        if (error) throw error
      }
      fetchData()
      setShowModal(false)
      setEditingId(null)
      setFormData({ nomor_seri: '', barang_id: '', lokasi: '', status: 'aktif', tanggal_perolehan: '', keterangan: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      nomor_seri: item.nomor_seri,
      barang_id: item.barang_id,
      lokasi: item.lokasi,
      status: item.status,
      tanggal_perolehan: item.tanggal_perolehan,
      keterangan: item.keterangan,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus?')) return
    try {
      const { error } = await supabase.from('inventaris_komputer').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus data')
    }
  }

  const columns = [
    { key: 'nomor_seri', label: 'Nomor Seri' },
    {
      key: 'barang_id',
      label: 'Nama Barang',
      render: (val, row) => row.master_barang?.nama_barang,
    },
    { key: 'lokasi', label: 'Lokasi' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`px-2 py-1 rounded text-sm font-medium ${
        val === 'aktif' ? 'bg-green-100 text-green-800' :
        val === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>{val}</span>,
    },
    { key: 'tanggal_perolehan', label: 'Tanggal Perolehan' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Inventaris Komputer</h1>
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ nomor_seri: '', barang_id: '', lokasi: '', status: 'aktif', tanggal_perolehan: '', keterangan: '' })
                    setShowModal(true)
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} /> Tambah Inventaris
                </button>
              )}
            </div>
            <div className="card">
              <Table columns={columns} data={inventaris} onEdit={userRole === 'admin' ? handleEdit : null} onDelete={userRole === 'admin' ? handleDelete : null} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Inventaris' : 'Tambah Inventaris'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Seri</label>
            <input
              type="text"
              value={formData.nomor_seri}
              onChange={(e) => setFormData({ ...formData, nomor_seri: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barang</label>
            <select
              value={formData.barang_id}
              onChange={(e) => setFormData({ ...formData, barang_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Pilih Barang</option>
              {barang.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama_barang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
            <input
              type="text"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              className="input-field"
              placeholder="Contoh: Ruang 101, Meja 5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="aktif">Aktif</option>
              <option value="maintenance">Maintenance</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Perolehan</label>
            <input
              type="date"
              value={formData.tanggal_perolehan}
              onChange={(e) => setFormData({ ...formData, tanggal_perolehan: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
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
