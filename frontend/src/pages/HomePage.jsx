import { Link } from 'react-router-dom'
import { Store, ShieldCheck, Truck, Zap, ArrowRight, Star, TrendingUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['Makanan & Minuman', 'Kerajinan Tangan', 'Fashion', 'Pertanian', 'Elektronik', 'Lainnya']

const FEATURES = [
  { icon: Truck,       title: 'Ongkir Real-time',    desc: 'Kalkulasi otomatis via RajaOngkir berdasarkan berat & lokasi' },
  { icon: ShieldCheck, title: 'Pembayaran Aman',      desc: 'QRIS, Virtual Account & e-Wallet via Midtrans PCI DSS' },
  { icon: Zap,         title: 'Resi Instan',          desc: 'Airway Bill otomatis digenerate saat pembayaran terverifikasi' },
  { icon: Store,       title: 'Khusus UMKM',          desc: 'Platform yang dirancang untuk mendukung pertumbuhan UMKM Indonesia' },
]

export default function HomePage() {
  const [featured, setFeatured]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/products?sort=created_at&dir=desc').then(({ data }) => {
      setFeatured(data.data?.slice(0, 8) || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full -translate-x-16 translate-y-16 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Star className="w-4 h-4 text-amber-300" />
              Platform E-Commerce #1 untuk UMKM Indonesia
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Jual Lebih Mudah,<br />
              <span className="text-amber-300">Beli Lebih Percaya</span>
            </h1>

            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
              Platform e-commerce end-to-end untuk UMKM Nusantara. Integrasi ongkir otomatis, 
              pembayaran digital, dan resi instan — semua dalam satu platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="btn-accent flex items-center justify-center gap-2 text-base py-3 px-8">
                Mulai Belanja <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register?role=seller" className="bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 text-base">
                <Store className="w-5 h-5" /> Buka Toko UMKM
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[['1.200+', 'Produk UMKM'], ['500+', 'Penjual Aktif'], ['99.9%', 'Uptime Pembayaran']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-amber-300">{n}</p>
                  <p className="text-sm text-white/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-3">Kenapa Pilih Kami?</h2>
          <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
            Dibangun khusus untuk memenuhi kebutuhan UMKM Indonesia dengan teknologi terdepan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-bold text-stone-800 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Jelajahi Kategori</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/catalog?category=${encodeURIComponent(cat)}`}
                className="bg-white border border-stone-200 hover:border-green-400 hover:bg-green-50 text-stone-700 hover:text-green-700 font-medium px-5 py-2.5 rounded-full transition-all text-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" /> Produk Terbaru
              </h2>
              <p className="text-stone-500 text-sm mt-1">Produk unggulan dari UMKM terpercaya</p>
            </div>
            <Link to="/catalog" className="btn-secondary text-sm">Lihat Semua</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="card h-80 animate-pulse">
                  <div className="bg-stone-200 h-52 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="bg-stone-200 h-3 rounded w-3/4" />
                    <div className="bg-stone-200 h-3 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Siap Membuka Toko UMKM Anda?</h2>
          <p className="text-white/85 mb-8 text-lg">Bergabunglah bersama ratusan UMKM yang telah berjualan di platform kami.</p>
          <Link to="/register?role=seller" className="bg-white text-amber-600 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-colors inline-flex items-center gap-2">
            <Store className="w-5 h-5" /> Daftar Jadi Penjual — Gratis!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 text-center text-sm">
        <p className="text-stone-200 font-bold text-lg mb-2">🇮🇩 UMKM Nusantara</p>
        <p>Platform E-Commerce untuk UMKM Indonesia © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
