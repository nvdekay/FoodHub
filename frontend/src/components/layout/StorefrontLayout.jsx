import { Link, Outlet } from "react-router-dom";

/** Layout cho khu vực khách hàng (storefront). Header tối giản — sẽ mở rộng ở F2/F3. */
export default function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-2xl">🍵</span> FoodHub
          </Link>
          {/* Giỏ hàng / tài khoản sẽ thêm ở các phase sau */}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
