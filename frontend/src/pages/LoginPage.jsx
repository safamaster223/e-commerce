import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Selamat datang, ${user.name.split(' ')[0]}!`)
      const redirect = user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/'
      navigate(redirect)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Store className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-stone-800">
              UMKM <span className="text-green-600">Nusantara</span>
            </span>
          </Link>
          <p className="text-stone-500 mt-2 text-sm">Masuk ke akun Anda</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={show ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 bg-stone-50 rounded-xl p-3 text-xs text-stone-500 space-y-0.5">
            <p className="font-semibold text-stone-600 mb-1">Demo Admin:</p>
            <p>Email: admin@umkm.id</p>
            <p>Password: Admin@1234</p>
          </div>

          <p className="text-center text-sm text-stone-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/register" className="text-green-700 font-semibold hover:underline">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
