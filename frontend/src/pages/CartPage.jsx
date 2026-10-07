import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../contexts/CartContext'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function CartPage() {
  const { items, totalPrice, totalWeight, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <>
      <Navbar />
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-stone-300" />
        </div>
        <h2 className="text-xl font-bold text-stone-700">Keranjang Kosong</h2>
        <p className="text-stone-500">Tambahkan produk UMKM favoritmu</p>
        <Link to="/catalog" className="btn-primary mt-2">Mulai Belanja</Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4 items-start">
                <img
                  src={item.image_url || 'https://placehold.co/80x80/dcfce7/166534?text=P'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-600 font-semibold mb-0.5">{item.shop?.shop_name}</p>
                  <h3 className="font-semibold text-stone-800 truncate">{item.name}</h3>
                  <p className="text-xs text-stone-400">{item.weight_grams * item.quantity}gr total</p>
                  <p className="font-bold text-green-700 mt-1">{formatRupiah(item.subtotal)}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.product_id, item.quantity - 1) : removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, Math.min(item.stock, item.quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-stone-800">Ringkasan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Total Produk ({items.length})</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Total Berat</span>
                  <span>{totalWeight >= 1000 ? `${(totalWeight/1000).toFixed(1)} kg` : `${totalWeight}gr`}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-xs border-t border-stone-100 pt-2">
                  <span>Ongkir dihitung di halaman checkout</span>
                </div>
                <div className="flex justify-between font-bold text-stone-800 text-base">
                  <span>Subtotal</span>
                  <span className="text-green-700">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Lanjut Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
