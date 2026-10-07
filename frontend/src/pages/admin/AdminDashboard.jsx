import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, Store, CheckCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, orders: 0, shops: 0, revenue: 0 })
  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/orders'),
      api.get('/admin/shops'),
    ]).then(([u, o, s]) => {
      const orders = o.data.data || []
      setStats({
        users:   u.data.data?.length || 0,
        orders:  orders.length,
        shops:   s.data.data?.length || 0,
        revenue: orders.filter(x => x.status !== 'cancelled').reduce((sum, x) => sum + Number(x.grand_total), 0),
      })
    })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-stone-800">Admin Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Pengguna',  value: stats.users,              icon: Users,    color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Pesanan',   value: stats.orders,             icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
          { label: 'Total Toko UMKM', value: stats.shops,              icon: Store,    color: 'bg-amber-50 text-amber-600' },
          { label: 'Total Pendapatan', value: formatRupiah(stats.revenue), icon: LayoutDashboard, color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400">{s.label}</p>
              <p className="text-xl font-bold text-stone-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminShops() {
  const [shops, setShops] = useState([])
  useEffect(() => { api.get('/admin/shops').then(({ data }) => setShops(data.data || [])) }, [])

  const verify = async (id) => {
    await api.patch(`/admin/shops/${id}/verify`)
    toast.success('Toko diverifikasi!')
    setShops(prev => prev.map(s => s.id === id ? {...s, is_verified: 1} : s))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-stone-800">Kelola Toko UMKM</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Toko</th>
                <th className="px-4 py-3 text-left">Pemilik</th>
                <th className="px-4 py-3 text-left">Kota</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shops.map(s => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{s.shop_name}</td>
                  <td className="px-4 py-3 text-stone-500">{s.user?.name}</td>
                  <td className="px-4 py-3 text-stone-500">{s.city_name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${s.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.is_verified ? 'Terverifikasi' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!s.is_verified && (
                      <button onClick={() => verify(s.id)} className="btn-primary text-xs py-1 px-3 flex items-center gap-1 mx-auto">
                        <CheckCircle className="w-3.5 h-3.5" /> Verifikasi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { path: '', label: 'Overview', icon: LayoutDashboard },
  { path: 'shops', label: 'Toko UMKM', icon: Store },
  { path: 'users', label: 'Pengguna', icon: Users },
]

export default function AdminDashboard() {
  const location = useLocation()
  const currentPath = location.pathname.replace('/admin', '').replace('/', '') || ''

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="card p-4 space-y-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide px-3 pb-2">Admin Panel</p>
              {NAV.map(n => (
                <Link
                  key={n.path}
                  to={`/admin${n.path ? '/' + n.path : ''}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentPath === n.path ? 'bg-green-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <n.icon className="w-4 h-4" /> {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <Routes>
              <Route index       element={<AdminOverview />} />
              <Route path="shops" element={<AdminShops />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
