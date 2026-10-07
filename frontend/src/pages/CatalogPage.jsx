import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../lib/api'

const CATEGORIES = ['Semua', 'Makanan & Minuman', 'Kerajinan Tangan', 'Fashion', 'Pertanian', 'Elektronik', 'Lainnya']

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [meta, setMeta]                 = useState(null)
  const [loading, setLoading]           = useState(true)

  const [search, setSearch]   = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'Semua')
  const [sort, setSort]         = useState('created_at')
  const [page, setPage]         = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sort, dir: 'desc', page }
      if (search)                   params.q        = search
      if (category && category !== 'Semua') params.category = category

      const { data } = await api.get('/products', { params })
      setProducts(data.data || [])
      setMeta(data.meta || null)
    } finally {
      setLoading(false)
    }
  }, [search, category, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Katalog Produk UMKM</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                className="input pl-10"
                placeholder="Cari produk UMKM..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-6">Cari</button>
          </form>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1) }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-green-600 text-white shadow'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-green-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-stone-500">
            {loading ? 'Mencari...' : `Menampilkan ${products.length} produk`}
          </p>
          <select
            className="input w-auto text-sm"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="created_at">Terbaru</option>
            <option value="price">Harga: Rendah ke Tinggi</option>
            <option value="name">Nama A-Z</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="bg-stone-200 h-52 w-full" />
                <div className="p-4 space-y-3">
                  <div className="bg-stone-200 h-3 rounded w-3/4" />
                  <div className="bg-stone-200 h-4 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Produk tidak ditemukan</p>
            <p className="text-sm">Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({length: meta.last_page}, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  page === p ? 'bg-green-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-green-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
