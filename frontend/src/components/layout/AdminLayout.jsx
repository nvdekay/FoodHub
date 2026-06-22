import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ReceiptText, Coffee, Armchair, Users } from "lucide-react";
import { cn } from "../../lib/cn";

const NAV = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Đơn hàng", icon: ReceiptText },
  { to: "/admin/products", label: "Thực đơn", icon: Coffee },
  { to: "/admin/tables", label: "Bàn", icon: Armchair },
  { to: "/admin/users", label: "Người dùng", icon: Users, adminOnly: true },
];

/** Layout back-office (nhân viên/quản trị). Sidebar tối giản — sẽ mở rộng ở F5. */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-56 shrink-0 border-r border-gray-100 bg-white md:block">
        <div className="flex items-center gap-2 px-5 py-4 text-lg font-bold text-primary">
          <span className="text-2xl">🍵</span> FoodHub
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
          <h1 className="text-base font-semibold text-gray-700">Bảng điều khiển</h1>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
