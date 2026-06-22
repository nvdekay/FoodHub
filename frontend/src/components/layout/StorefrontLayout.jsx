import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";
import UserMenu from "./UserMenu";

/** Layout cho khu vực khách hàng (storefront). */
export default function StorefrontLayout() {
  const { isAuthenticated, isStaff } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-2xl">🍵</span> FoodHub
          </Link>

          <div className="flex items-center gap-2">
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
        <Outlet />
      </main>
    </div>
  );
}
