import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Printer, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../lib/api'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_STYLES = {
  pending_payment: 'bg-amber-100 text-amber-700',
  paid:            'bg-blue-100 text-blue-700',
  processing:      'bg-indigo-100 text-indigo-700',
  shipped:         'bg-purple-100 text-purple-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  pending_payment: 'Menunggu Pembayaran',
  paid:            'Dibayar',
  processing:      'Diproses Penjual',
  shipped:         'Dalam Pengiriman',
  delivered:       'Selesai',
  cancelled:       'Dibatalkan',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Pesanan Saya</h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Belum ada pesanan</p>
            <Link to="/catalog" className="btn-primary mt-4 inline-block">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-stone-800">{order.order_number}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{order.shop?.shop_name}</p>
                  </div>
                  <span className={`badge ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-600'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-3 overflow-hidden">
                  {order.items?.slice(0, 4).map(item => (
                    <div key={item.id} className="text-xs text-stone-500 bg-stone-50 rounded-lg px-2 py-1 truncate max-w-[120px]">
                      {item.product_name} ×{item.quantity}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-green-700">{formatRupiah(order.grand_total)}</p>
                    {order.shipment && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        Resi: <span className="font-mono font-semibold text-stone-600">{order.shipment.tracking_number}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.shipment && (
                      <a
                        href={`/api/orders/${order.order_number}/label`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak Resi
                      </a>
                    )}
                    <Link
                      to={`/orders/success/${order.order_number}`}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      Detail <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
