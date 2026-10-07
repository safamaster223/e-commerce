import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Printer, Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

// ── Sub-pages ──────────────────────────────────────────────────────────────

function SellerOverview({ shop }) {
  const [stats, setStats] = useState({ total_orders: 0, revenue: 0, total_products: 0 })
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/seller/orders').then(({ data }) => {
      const all = data.data || []
      setOrders(all.slice(0, 5))
      setStats({
        total_orders:   all.length,
        revenue:        all.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.subtotal), 0),
        total_products: 0,
      })
    })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-stone-800">Dashboard Penjual</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pesanan',  value: stats.total_orders,   icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pendapatan',     value: formatRupiah(stats.revenue), icon: LayoutDashboard, color: 'text-green-600 bg-green-50', isRp: true },
          { label: 'Produk Aktif',   value: stats.total_products, icon: Package, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-stone-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <h3 className="font-bold text-stone-800 mb-4">Pesanan Terbaru</h3>
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-stone-400 text-sm">Belum ada pesanan.</p>}
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div>
                <p className="font-semibold text-stone-800 text-sm">{o.order_number}</p>
                <p className="text-xs text-stone-400">{o.recipient_name} · {formatRupiah(o.grand_total)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${
                  o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{o.status}</span>
                {o.shipment && (
                  <a href={`/api/orders/${o.order_number}/label`} target="_blank" className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                    <Printer className="w-3 h-3" /> Resi
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name:'', category:'', price:'', stock:'', weight_grams:'', description:'' })
  const [submitting, setSubmitting] = useState(false)

  const CATEGORIES = ['Makanan & Minuman', 'Kerajinan Tangan', 'Fashion', 'Pertanian', 'Elektronik', 'Lainnya']

  const fetchProducts = () => {
    api.get('/seller/products').then(({ data }) => {
      setProducts(data.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      await api.post('/seller/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Produk berhasil ditambahkan!')
      setShowForm(false)
      setForm({ name:'', category:'', price:'', stock:'', weight_grams:'', description:'' })
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambah produk.')
    } finally {
      setSubmitting(false)
    }
  }

  const deactivate = async (id) => {
    await api.delete(`/seller/products/${id}`)
    toast.success('Produk dinonaktifkan.')
    fetchProducts()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">Produk Saya</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 space-y-4">
          <h3 className="font-bold text-stone-800">Produk Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Nama Produk</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} required>
                <option value="">Pilih kategori</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Harga (Rp)</label><input className="input" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} required /></div>
            <div><label className="label">Stok</label><input className="input" type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} required /></div>
            <div>
              <label className="label">Berat (gram)</label>
              <input className="input" type="number" placeholder="mis. 500 untuk 0.5 kg" value={form.weight_grams} onChange={e=>setForm(p=>({...p,weight_grams:e.target.value}))} required />
              <p className="text-xs text-stone-400 mt-1">⚖️ Digunakan untuk kalkulasi ongkos kirim otomatis</p>
            </div>
            <div><label className="label">Gambar Produk</label><input className="input" type="file" accept="image/*" onChange={e=>setForm(p=>({...p,image:e.target.files[0]}))} /></div>
          </div>
          <div><label className="label">Deskripsi</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan Produk
            </button>
          </div>
        </form>
      )}

      {/* Products list */}
      {loading ? <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 bg-stone-100 rounded-xl" />)}</div> : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <img src={p.image_url || 'https://placehold.co/60x60/dcfce7/166534?text=P'} alt={p.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">{p.name}</p>
                <p className="text-xs text-stone-400">{p.category} · {p.weight_grams}gr · Stok: {p.stock}</p>
                <p className="font-bold text-green-700 text-sm">{formatRupiah(p.price)}</p>
              </div>
              <button onClick={() => deactivate(p.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {products.length === 0 && <p className="text-stone-400 text-sm text-center py-8">Belum ada produk. Tambahkan produk pertama Anda!</p>}
        </div>
      )}
    </div>
  )
}

// ── Main Seller Dashboard ──────────────────────────────────────────────────

const NAV = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'products', label: 'Produk', icon: Package },
  { path: 'orders', label: 'Pesanan', icon: ShoppingBag },
]

export default function SellerDashboard() {
  const { user }   = useAuth()
  const location   = useLocation()
  const shop       = user?.shop

  const currentPath = location.pathname.replace('/seller', '').replace('/', '') || ''

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card p-4 space-y-1">
              <div className="text-center pb-4 border-b border-stone-100 mb-3">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-stone-800 text-sm">{shop?.shop_name}</p>
                <p className="text-xs text-stone-400">{shop?.city_name}</p>
              </div>
              {NAV.map(n => (
                <Link
                  key={n.path}
                  to={`/seller${n.path ? '/' + n.path : ''}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentPath === n.path ? 'bg-green-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <n.icon className="w-4 h-4" /> {n.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <Routes>
              <Route index         element={<SellerOverview shop={shop} />} />
              <Route path="products" element={<SellerProducts />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
