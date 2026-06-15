import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import Table from '../components/Shared/Table'
import Modal from '../components/Shared/Modal'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function MasterBarang() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [barang, setBarang] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_barang: '',
    kategori: '',
    spesifikasi: '',
    harga: '',
    supplier: '',
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
    fetchBarang()
  }, [])

  const fetchBarang = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('master_barang').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setBarang(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('master_barang')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('master_barang').insert([formData])
        if (error) throw error
      }
      fetchBarang()
      setShowModal(false)
      setEditingId(null)
      setFormData({ nama_barang: '', kategori: '', spesifikasi: '', harga: '', supplier: '' })
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
      const { error } = await supabase.from('master_barang').delete().eq('id', id)
      if (error) throw error
      fetchBarang()
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus data')
    }
  }

  const columns = [
    { key: 'nama_barang', label: 'Nama Barang' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'spesifikasi', label: 'Spesifikasi' },
    { key: 'harga', label: 'Harga', render: (val) => `Rp ${val?.toLocaleString()}` },
    { key: 'supplier', label: 'Supplier' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Master Barang</h1>
              <button
                onClick={() => {
                  setEditingId(null)
                  setFormData({ nama_barang: '', kategori: '', spesifikasi: '', harga: '', supplier: '' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} /> Tambah Barang
              </button>
            </div>
            <div className="card">
              <Table columns={columns} data={barang} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Barang' : 'Tambah Barang'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input
              type="text"
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              className="input-field"
              placeholder="Contoh: CPU, RAM, Monitor"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi</label>
            <textarea
              value={formData.spesifikasi}
              onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
              className="input-field"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="input-field"
            />
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
