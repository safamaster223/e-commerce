import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Minus, Plus, ShoppingCart, Package, Store, ArrowLeft, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useCart } from '../contexts/CartContext'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function ProductPage() {
  const { slug }      = useParams()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(({ data }) => setProduct(data.data))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div></>
  )

  if (!product) return null

  const weightLabel = product.weight_grams >= 1000
    ? `${(product.weight_grams / 1000).toFixed(1)} kg`
    : `${product.weight_grams} gram`

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-green-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="card overflow-hidden">
            <img
              src={product.image_url || 'https://placehold.co/600x500/dcfce7/166534?text=Produk+UMKM'}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{product.shop?.shop_name}</span>
                <span className="text-stone-300">·</span>
                <span className="text-sm text-stone-400">{product.shop?.city_name}</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-800">{product.name}</h1>
            </div>

            <div className="text-3xl font-bold text-green-700">{formatRupiah(product.price)}</div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-3 py-1.5">
                <Package className="w-4 h-4 text-stone-500" />
                <span className="text-stone-600">{weightLabel}/pcs</span>
              </div>
              <span className={`badge ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
              </span>
            </div>

            <p className="text-stone-600 leading-relaxed">{product.description || 'Tidak ada deskripsi.'}</p>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-stone-600">Jumlah:</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-stone-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-stone-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => addToCart(product.id, qty)}
                disabled={product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-stone-600 space-y-1.5">
              <p>🏪 Dijual oleh <span className="font-semibold">{product.shop?.shop_name}</span></p>
              <p>📍 {product.shop?.city_name}, {product.shop?.province_name}</p>
              <p>📦 Berat per item: <span className="font-semibold">{weightLabel}</span> (digunakan untuk kalkulasi ongkir otomatis)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
