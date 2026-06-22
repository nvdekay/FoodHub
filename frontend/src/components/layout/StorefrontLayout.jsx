import { useState, Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Button } from "../ui";
import CartDrawer from "../../features/cart/CartDrawer";
import PageTransition from "../common/PageTransition";
import PageLoader from "../common/PageLoader";
import UserMenu from "./UserMenu";

/** Layout cho khu vực khách hàng (storefront). */
export default function StorefrontLayout() {
  const { isAuthenticated, isStaff } = useAuth();
  const { totalCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-2xl">🍵</span> FoodHub
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
            {isStaff && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  Khu vực nhân viên
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <UserMenu variant="storefront" />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense fallback={<PageLoader />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
