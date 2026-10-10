import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Store, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') || 'buyer'

  const [form, setForm]       = useState({
    name: '', email: '', password: '', password_confirmation: '',
    role: defaultRole,
    shop_name: '', shop_address: '', city_id: '', city_name: '', province_id: '', province_name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [cities, setCities]   = useState([])
  const [citySearch, setCitySearch] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      return toast.error('Password tidak cocok.')
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Registrasi berhasil! Selamat datang 🎉')
      navigate(user.role === 'seller' ? '/seller' : '/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Registrasi gagal.')
      }
    } finally {
      setLoading(false)
    }
  }

  const searchCities = async (q) => {
    if (q.length < 2) { setCities([]); return }
    const { data } = await api.get(`/shipping/cities?search=${q}`)
    setCities(data.data || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Store className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-stone-800">UMKM <span className="text-green-600">Nusantara</span></span>
          </Link>
          <p className="text-stone-500 mt-2 text-sm">Buat akun baru</p>
        </div>

        <div className="card p-8">
          {/* Role Switch */}
          <div className="flex rounded-xl overflow-hidden border border-stone-200 mb-6">
            {['buyer', 'seller'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({...p, role: r}))}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  form.role === r ? 'bg-green-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {r === 'buyer' ? '🛍️ Pembeli' : '🏪 Penjual UMKM'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Lengkap</label>
                <input className="input" placeholder="Budi Santoso" value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
              </div>
              <div>
                <label className="label">No. HP</label>
                <input className="input" type="tel" placeholder="08123456789" value={form.phone}
                  onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="email@contoh.com" value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min. 8 karakter" value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
              </div>
              <div>
                <label className="label">Konfirmasi Password</label>
                <input className="input" type="password" placeholder="Ulangi password" value={form.password_confirmation}
                  onChange={e => setForm(p => ({...p, password_confirmation: e.target.value}))} required />
              </div>
            </div>

            {/* Seller fields */}
            {form.role === 'seller' && (
              <div className="space-y-4 border-t border-stone-100 pt-4">
                <p className="text-sm font-semibold text-stone-600">Info Toko UMKM</p>
                <div>
                  <label className="label">Nama Toko</label>
                  <input className="input" placeholder="Batik Bu Sari" value={form.shop_name}
                    onChange={e => setForm(p => ({...p, shop_name: e.target.value}))} />
                </div>
                <div className="relative">
                  <label className="label">Kota Asal Toko</label>
                  <input
                    className="input"
                    placeholder="Ketik kota..."
                    value={citySearch}
                    onChange={e => { setCitySearch(e.target.value); searchCities(e.target.value) }}
                  />
                  {cities.length > 0 && !form.city_id && (
                    <div className="absolute z-10 w-full border border-stone-200 rounded-xl bg-white shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {cities.map(c => (
                        <button key={c.city_id} type="button"
                          onClick={() => {
                            setForm(p => ({...p, city_id: c.city_id, city_name: c.city_name, province_id: c.province_id, province_name: c.province}))
                            setCitySearch(`${c.city_name}, ${c.province}`)
                            setCities([])
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm border-b border-stone-100 last:border-0"
                        >
                          <span className="font-medium">{c.city_name}</span>
                          <span className="text-stone-400 ml-1 text-xs">{c.province}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Alamat Toko</label>
                  <textarea className="input resize-none" rows={2} placeholder="Alamat lengkap toko..." value={form.shop_address}
                    onChange={e => setForm(p => ({...p, shop_address: e.target.value}))} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
