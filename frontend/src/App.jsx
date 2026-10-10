import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// Pages
import HomePage      from './pages/HomePage'
import CatalogPage   from './pages/CatalogPage'
import ProductPage   from './pages/ProductPage'
import CartPage      from './pages/CartPage'
import CheckoutPage  from './pages/CheckoutPage'
import OrderSuccess  from './pages/OrderSuccess'
import OrdersPage    from './pages/OrdersPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import SellerDashboard from './pages/seller/SellerDashboard'
import AdminDashboard  from './pages/admin/AdminDashboard'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{ className: 'font-sans text-sm font-medium' }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"              element={<HomePage />} />
            <Route path="/catalog"       element={<CatalogPage />} />
            <Route path="/products/:slug"element={<ProductPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />

            {/* Buyer — requires auth */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart"            element={<CartPage />} />
              <Route path="/checkout"        element={<CheckoutPage />} />
              <Route path="/orders"          element={<OrdersPage />} />
              <Route path="/orders/success/:orderNumber" element={<OrderSuccess />} />
            </Route>

            {/* Seller */}
            <Route element={<ProtectedRoute role="seller" />}>
              <Route path="/seller/*" element={<SellerDashboard />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
