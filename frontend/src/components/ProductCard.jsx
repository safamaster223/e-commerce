import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

const PLACEHOLDER = 'https://placehold.co/400x300/dcfce7/166534?text=Produk+UMKM'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const formatRupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const weightLabel = product.weight_grams >= 1000
    ? `${(product.weight_grams / 1000).toFixed(1)} kg`
    : `${product.weight_grams} gr`

  return (
    <div className="card group flex flex-col">
      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="block overflow-hidden relative">
        <img
          src={product.image_url || PLACEHOLDER}
          alt={product.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-red-500 text-white text-sm px-3 py-1">Habis</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 right-2 badge bg-amber-500 text-white">
            Sisa {product.stock}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Shop */}
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide truncate">
          {product.shop?.shop_name}
        </p>

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-stone-800 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-lg font-bold text-green-700">{formatRupiah(product.price)}</p>

        {/* Weight */}
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Package className="w-3.5 h-3.5" />
          <span>Berat: {weightLabel}</span>
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addToCart(product.id, 1)}
          disabled={product.stock === 0}
          className="btn-primary w-full mt-auto flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
      </div>
    </div>
  )
}
