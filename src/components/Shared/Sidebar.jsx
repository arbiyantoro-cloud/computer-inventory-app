import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Package,
  Monitor,
  Wrench,
  Target,
  X,
  Home
} from 'lucide-react'

const adminLinks = [
  { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/admin/master-barang', icon: Package, label: 'Master Barang' },
  { path: '/admin/inventaris', icon: Monitor, label: 'Inventaris Komputer' },
  { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/admin/monitoring', icon: BarChart3, label: 'Monitoring' },
  { path: '/admin/target', icon: Target, label: 'Target Perawatan' },
]

const technisianLinks = [
  { path: '/technician/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/technician/inventaris', icon: Monitor, label: 'Inventaris' },
  { path: '/technician/maintenance', icon: Wrench, label: 'Maintenance' },
]

export default function Sidebar({ isOpen, onClose, userRole }) {
  const location = useLocation()
  const links = userRole === 'admin' ? adminLinks : technisianLinks

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform z-50 md:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex justify-between items-center md:hidden">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
