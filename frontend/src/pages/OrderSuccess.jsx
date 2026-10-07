import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Truck, Package, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../lib/api'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function OrderSuccess() {
  const { orderNumber }   = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${orderNumber}`).then(({ data }) => setOrder(data.data))
  }, [orderNumber])

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-stone-800 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-stone-500 mb-2">Terima kasih telah berbelanja di UMKM Nusantara 🎉</p>
        <p className="text-sm text-stone-400">No. Pesanan: <span className="font-bold text-stone-600">{orderNumber}</span></p>

        {order && (
          <div className="card p-6 mt-8 text-left space-y-4">
            <h2 className="font-bold text-stone-800">Detail Pesanan</h2>

            {/* Shipment */}
            {order.shipment && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                  <Truck className="w-5 h-5" /> Resi Pengiriman Siap!
                </div>
                <p className="text-stone-600 text-sm">No. Resi (AWB):</p>
                <p className="text-2xl font-bold text-green-700 tracking-widest mt-1">
                  {order.shipment.tracking_number}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {order.shipping_courier?.toUpperCase()} · {order.shipping_service}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-stone-700">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold">
                <span>Total Dibayar</span>
                <span className="text-green-700">{formatRupiah(order.grand_total)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to="/orders" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Package className="w-4 h-4" /> Lihat Semua Pesanan
          </Link>
          <Link to="/" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
