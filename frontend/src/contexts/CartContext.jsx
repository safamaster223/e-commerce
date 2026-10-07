import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const CartContext = createContext(null)

const initialState = {
  items: [],        // [{id, product_id, name, price, weight_grams, stock, image_url, shop, quantity, subtotal}]
  totalPrice: 0,
  totalWeight: 0,
  itemCount: 0,
  loading: false,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items:       action.payload.data,
        totalPrice:  action.payload.total_price,
        totalWeight: action.payload.total_weight_grams,
        itemCount:   action.payload.item_count,
        loading:     false,
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'CLEAR':
      return { ...initialState }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const isLoggedIn = () => !!localStorage.getItem('auth_token')

  const fetchCart = async () => {
    if (!isLoggedIn()) return
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await api.get('/cart')
      dispatch({ type: 'SET_CART', payload: data })
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn()) {
      toast.error('Silakan login terlebih dahulu.')
      return
    }
    try {
      await api.post('/cart', { product_id: productId, quantity })
      toast.success('Produk ditambahkan ke keranjang!')
      await fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang.')
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.post('/cart', { product_id: productId, quantity })
      await fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui keranjang.')
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`)
      toast.success('Item dihapus.')
      await fetchCart()
    } catch {
      toast.error('Gagal menghapus item.')
    }
  }

  const clearCart = () => dispatch({ type: 'CLEAR' })

  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <CartContext.Provider value={{ ...state, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
