import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Store,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout, isRole } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-stone-800 leading-tight">
              UMKM <span className="text-green-600">Nusantara</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className="text-stone-600 hover:text-green-600 font-medium transition-colors"
            >
              Katalog
            </Link>

            {user ? (
              <>
                {isRole("seller") && (
                  <Link
                    to="/seller"
                    className="text-stone-600 hover:text-green-600 font-medium transition-colors flex items-center gap-1"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard Penjual
                  </Link>
                )}
                {isRole("admin") && (
                  <Link
                    to="/admin"
                    className="text-stone-600 hover:text-green-600 font-medium transition-colors flex items-center gap-1"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}
                {isRole("buyer") && (
                  <Link
                    to="/orders"
                    className="text-stone-600 hover:text-green-600 font-medium transition-colors"
                  >
                    Pesanan Saya
                  </Link>
                )}

                {/* Cart */}
                {isRole("buyer") && (
                  <Link to="/cart" className="relative">
                    <div className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                      <ShoppingCart className="w-5 h-5 text-green-700" />
                    </div>
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl">
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-stone-700">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary  py-2 px-4 text-sm">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-stone-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/catalog"
            onClick={() => setOpen(false)}
            className="block text-stone-700 font-medium py-2"
          >
            Katalog
          </Link>
          {user ? (
            <>
              {isRole("buyer") && (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="block text-stone-700 py-2"
                  >
                    Keranjang ({itemCount})
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setOpen(false)}
                    className="block text-stone-700 py-2"
                  >
                    Pesanan Saya
                  </Link>
                </>
              )}

              {isRole("seller") && (
                <Link
                  to="/seller"
                  onClick={() => setOpen(false)}
                  className="block text-stone-700 py-2"
                >
                  Dashboard Penjual
                </Link>
              )}

              {isRole("admin") && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block text-stone-700 py-2"
                >
                  Dashboard Admin
                </Link>
              )}

              <button
                onClick={async () => {
                  setOpen(false);
                  await handleLogout();
                }}
                className="block text-red-500 font-medium py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-green-700 py-2"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block text-green-700 py-2"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
