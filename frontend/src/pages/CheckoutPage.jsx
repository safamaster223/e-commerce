import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, ShoppingBag, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STEPS = ['Alamat', 'Pengiriman', 'Pembayaran']

export default function CheckoutPage() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { items, totalPrice, totalWeight, clearCart } = useCart()

  const [step, setStep]                 = useState(0)   // 0=address, 1=shipping, 2=payment
  const [cities, setCities]             = useState([])
  const [citySearch, setCitySearch]     = useState('')
  const [shippingOptions, setShipping]  = useState([])
  const [selectedShipping, setSelected] = useState(null)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [snapLoaded, setSnapLoaded]     = useState(false)

  const [form, setForm] = useState({
    recipient_name:        user?.name || '',
    recipient_phone:       user?.phone || '',
    shipping_address:      '',
    destination_city_id:   '',
    destination_city_name: '',
    destination_province:  '',
    notes: '',
  })

  // ── Load cities ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCities = async () => {
      if (citySearch.length < 2) return
      setLoadingCities(true)
      try {
        const { data } = await api.get(`/shipping/cities?search=${encodeURIComponent(citySearch)}`)
        setCities(data.data)
      } finally {
        setLoadingCities(false)
      }
    }
    const delay = setTimeout(fetchCities, 400)
    return () => clearTimeout(delay)
  }, [citySearch])

  // ── Calculate Shipping ───────────────────────────────────────────────────────
  const calculateShipping = useCallback(async () => {
    if (!form.destination_city_id) return
    setLoadingShipping(true)
    setShipping([])
    setSelected(null)
    try {
      // Get the shop's origin city from the first cart item
      const originCityId = items[0]?.shop?.city_id || ''
      const { data } = await api.post('/shipping/calculate', {
        origin_city_id:      originCityId,
        destination_city_id: form.destination_city_id,
        weight_grams:        totalWeight,
        couriers:            ['jne', 'jnt', 'pos'],
      })
      setShipping(data.data)
      if (data.data.length > 0) setSelected(data.data[0])
    } catch {
      toast.error('Gagal mengambil opsi pengiriman. Menggunakan tarif perkiraan.')
    } finally {
      setLoadingShipping(false)
    }
  }, [form.destination_city_id, items, totalWeight])

  // ── Handle Checkout ──────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!selectedShipping) return toast.error('Pilih layanan pengiriman terlebih dahulu.')
    setSubmitting(true)

    try {
      const { data } = await api.post('/checkout', {
        ...form,
        shipping_courier: selectedShipping.courier_code,
        shipping_service: selectedShipping.service,
        shipping_cost:    selectedShipping.cost,
        shipping_etd:     selectedShipping.etd,
      })

      // Load Midtrans Snap.js then open payment UI
      await loadSnapScript(data.midtrans_client_key)

      window.snap.pay(data.snap_token, {
        onSuccess: (result) => {
          clearCart()
          navigate(`/orders/success/${data.order_number}`)
        },
        onPending: () => {
          toast('Pembayaran menunggu konfirmasi.', { icon: '⏳' })
          navigate(`/orders`)
        },
        onError: () => {
          toast.error('Pembayaran gagal.')
        },
        onClose: () => {
          toast('Jendela pembayaran ditutup.', { icon: 'ℹ️' })
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout gagal. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadSnapScript = (clientKey) =>
    new Promise((resolve) => {
      if (window.snap) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', clientKey)
      script.onload = resolve
      document.body.appendChild(script)
    })

  const grandTotal = totalPrice + (selectedShipping?.cost || 0)

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="w-16 h-16 text-stone-300" />
          <p className="text-stone-500 text-lg">Keranjang belanja Anda kosong.</p>
          <button onClick={() => navigate('/catalog')} className="btn-primary">Belanja Sekarang</button>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Page Header */}
          <h1 className="text-2xl font-bold text-stone-800 mb-6">Checkout</h1>

          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-green-600' : 'text-stone-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    i < step  ? 'bg-green-600 border-green-600 text-white' :
                    i === step ? 'border-green-600 text-green-600' :
                                 'border-stone-300 text-stone-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-stone-300 flex-1 mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Panel ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* STEP 0: Address */}
              {step === 0 && (
                <div className="card p-6 space-y-4">
                  <h2 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" /> Alamat Pengiriman
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nama Penerima</label>
                      <input className="input" value={form.recipient_name}
                        onChange={e => setForm(p => ({...p, recipient_name: e.target.value}))} />
                    </div>
                    <div>
                      <label className="label">No. HP Penerima</label>
                      <input className="input" type="tel" value={form.recipient_phone}
                        onChange={e => setForm(p => ({...p, recipient_phone: e.target.value}))} />
                    </div>
                  </div>

                  {/* City Search */}
                  <div>
                    <label className="label">Kota Tujuan</label>
                    <input
                      className="input"
                      placeholder="Ketik nama kota atau provinsi..."
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                    />
                    {loadingCities && <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Mencari kota...</p>}
                    {cities.length > 0 && !form.destination_city_id && (
                      <div className="mt-1 border border-stone-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto shadow-lg">
                        {cities.map(c => (
                          <button
                            key={c.city_id}
                            onClick={() => {
                              setForm(p => ({
                                ...p,
                                destination_city_id:   c.city_id,
                                destination_city_name: c.city_name,
                                destination_province:  c.province,
                              }))
                              setCitySearch(`${c.city_name}, ${c.province}`)
                              setCities([])
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm transition-colors border-b border-stone-100 last:border-0"
                          >
                            <span className="font-medium">{c.city_name}</span>
                            <span className="text-stone-400 ml-2 text-xs">{c.province}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Alamat Lengkap</label>
                    <textarea
                      className="input resize-none"
                      rows={3}
                      placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan..."
                      value={form.shipping_address}
                      onChange={e => setForm(p => ({...p, shipping_address: e.target.value}))}
                    />
                  </div>

                  <div>
                    <label className="label">Catatan (opsional)</label>
                    <input className="input" placeholder="Pesan ke penjual..." value={form.notes}
                      onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
                  </div>

                  <button
                    className="btn-primary w-full"
                    disabled={!form.destination_city_id || !form.shipping_address || !form.recipient_name}
                    onClick={() => { setStep(1); calculateShipping() }}
                  >
                    Pilih Pengiriman →
                  </button>
                </div>
              )}

              {/* STEP 1: Shipping */}
              {step === 1 && (
                <div className="card p-6 space-y-4">
                  <h2 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" /> Pilih Layanan Kurir
                  </h2>

                  <div className="text-sm text-stone-500 bg-stone-50 rounded-xl p-3">
                    📦 Total berat: <span className="font-semibold text-stone-700">{totalWeight >= 1000 ? `${(totalWeight/1000).toFixed(1)} kg` : `${totalWeight} gram`}</span>
                    &nbsp;→ <span className="font-medium">{form.destination_city_name}, {form.destination_province}</span>
                  </div>

                  {loadingShipping ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-stone-500">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                      <span>Menghitung ongkos kirim...</span>
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>Tidak ada layanan pengiriman tersedia.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected(opt)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedShipping?.service === opt.service && selectedShipping?.courier_code === opt.courier_code
                              ? 'border-green-500 bg-green-50'
                              : 'border-stone-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-stone-800">{opt.courier_name} — {opt.service}</p>
                              <p className="text-sm text-stone-500">{opt.description} · Estimasi {opt.etd} hari</p>
                              {opt.is_fallback && <p className="text-xs text-amber-600 mt-0.5">⚠ Tarif perkiraan (API offline)</p>}
                            </div>
                            <p className="font-bold text-green-700 text-lg">{formatRupiah(opt.cost)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Kembali</button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedShipping}
                      className="btn-primary flex-1"
                    >
                      Lanjut ke Pembayaran →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <div className="card p-6 space-y-4">
                  <h2 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" /> Konfirmasi & Bayar
                  </h2>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Ke:</span><span className="font-medium">{form.recipient_name}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Alamat:</span><span className="font-medium text-right max-w-[200px]">{form.shipping_address}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Kurir:</span><span className="font-medium">{selectedShipping?.courier_name} {selectedShipping?.service}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Ongkir:</span><span className="font-semibold text-green-700">{formatRupiah(selectedShipping?.cost || 0)}</span></div>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs text-stone-400 mb-2 font-medium">METODE PEMBAYARAN TERSEDIA</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {['QRIS', 'GoPay', 'OVO', 'BCA VA', 'BNI VA', 'Mandiri'].map(m => (
                        <div key={m} className="bg-white border border-stone-200 rounded-lg py-1.5 px-2 text-stone-600 font-medium">{m}</div>
                      ))}
                    </div>
                    <p className="text-xs text-stone-400 mt-2">Pilih metode pembayaran di pop-up Midtrans</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Kembali</button>
                    <button
                      onClick={handleCheckout}
                      disabled={submitting}
                      className="btn-accent flex-1 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      {submitting ? 'Memproses...' : `Bayar ${formatRupiah(grandTotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Panel: Order Summary ──────────────────────── */}
            <div className="space-y-5">
              <div className="card p-5">
                <h3 className="font-bold text-stone-800 mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image_url || 'https://placehold.co/64x64/dcfce7/166534?text=P'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                        <p className="text-xs text-stone-400">{item.quantity}x · {item.weight_grams}gr/pcs</p>
                        <p className="text-sm font-bold text-green-700">{formatRupiah(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal Produk</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Ongkos Kirim</span>
                    <span>{selectedShipping ? formatRupiah(selectedShipping.cost) : '-'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-800 text-base border-t border-stone-200 pt-2">
                    <span>Total Pembayaran</span>
                    <span className="text-green-700">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-700 space-y-1">
                <p className="font-semibold">🔒 Pembayaran Aman</p>
                <p>Transaksi diproses oleh Midtrans (PCI DSS Compliant) dan diproteksi dengan enkripsi SSL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
