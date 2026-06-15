import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Header from '../components/Shared/Header'
import Sidebar from '../components/Shared/Sidebar'
import Table from '../components/Shared/Table'
import Modal from '../components/Shared/Modal'
import { Plus, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function Maintenance() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [maintenance, setMaintenance] = useState([])
  const [inventaris, setInventaris] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    inventaris_id: '',
    tanggal_jadwal: '',
    jenis_maintenance: '',
    deskripsi: '',
    status: 'terjadwal',
    teknisi: '',
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
      const [maintRes, invRes] = await Promise.all([
        supabase
          .from('jadwal_maintenance')
          .select('id, tanggal_jadwal, jenis_maintenance, deskripsi, status, teknisi, inventaris_komputer(nomor_seri, master_barang(nama_barang))')
          .order('tanggal_jadwal', { ascending: true }),
        supabase.from('inventaris_komputer').select('id, nomor_seri, master_barang(nama_barang)'),
      ])
      setMaintenance(maintRes.data || [])
      setInventaris(invRes.data || [])
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
        inventaris_id: parseInt(formData.inventaris_id),
        tanggal_jadwal: formData.tanggal_jadwal,
        jenis_maintenance: formData.jenis_maintenance,
        deskripsi: formData.deskripsi,
        status: formData.status,
        teknisi: formData.teknisi,
      }

      if (editingId) {
        const { error } = await supabase.from('jadwal_maintenance').update(saveData).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('jadwal_maintenance').insert([saveData])
        if (error) throw error
      }
      fetchData()
      setShowModal(false)
      setEditingId(null)
      setFormData({ inventaris_id: '', tanggal_jadwal: '', jenis_maintenance: '', deskripsi: '', status: 'terjadwal', teknisi: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      inventaris_id: item.inventaris_id,
      tanggal_jadwal: item.tanggal_jadwal,
      jenis_maintenance: item.jenis_maintenance,
      deskripsi: item.deskripsi,
      status: item.status,
      teknisi: item.teknisi,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus?')) return
    try {
      const { error } = await supabase.from('jadwal_maintenance').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus data')
    }
  }

  const columns = [
    {
      key: 'inventaris_id',
      label: 'Barang',
      render: (val, row) => `${row.inventaris_komputer?.nomor_seri} - ${row.inventaris_komputer?.master_barang?.nama_barang}`,
    },
    { key: 'tanggal_jadwal', label: 'Tanggal Jadwal' },
    { key: 'jenis_maintenance', label: 'Jenis Maintenance' },
    { key: 'teknisi', label: 'Teknisi' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`px-2 py-1 rounded text-sm font-medium ${
        val === 'terjadwal' ? 'bg-blue-100 text-blue-800' :
        val === 'sedang_dilakukan' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>{val}</span>,
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} userRole={userRole} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Jadwal Maintenance</h1>
              <button
                onClick={() => {
                  setEditingId(null)
                  setFormData({ inventaris_id: '', tanggal_jadwal: '', jenis_maintenance: '', deskripsi: '', status: 'terjadwal', teknisi: '' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} /> Buat Jadwal
              </button>
            </div>
            <div className="card">
              <Table columns={columns} data={maintenance} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Maintenance' : 'Buat Jadwal Maintenance'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inventaris Komputer</label>
            <select
              value={formData.inventaris_id}
              onChange={(e) => setFormData({ ...formData, inventaris_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Pilih Komputer</option>
              {inventaris.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.nomor_seri} - {inv.master_barang?.nama_barang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jadwal</label>
            <input
              type="date"
              value={formData.tanggal_jadwal}
              onChange={(e) => setFormData({ ...formData, tanggal_jadwal: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Maintenance</label>
            <select
              value={formData.jenis_maintenance}
              onChange={(e) => setFormData({ ...formData, jenis_maintenance: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Pilih Jenis</option>
              <option value="pembersihan">Pembersihan</option>
              <option value="update_software">Update Software</option>
              <option value="penggantian_komponen">Penggantian Komponen</option>
              <option value="cek_keamanan">Cek Keamanan</option>
              <option value="backup_data">Backup Data</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="input-field"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teknisi</label>
            <input
              type="text"
              value={formData.teknisi}
              onChange={(e) => setFormData({ ...formData, teknisi: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="terjadwal">Terjadwal</option>
              <option value="sedang_dilakukan">Sedang Dilakukan</option>
              <option value="selesai">Selesai</option>
            </select>
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
