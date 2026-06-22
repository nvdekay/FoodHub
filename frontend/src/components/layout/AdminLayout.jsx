import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Dialog, DialogPanel } from "@headlessui/react";
import { LayoutDashboard, ReceiptText, Coffee, Armchair, Users, Menu as MenuIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "./UserMenu";

const NAV = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Đơn hàng", icon: ReceiptText },
  { to: "/admin/products", label: "Thực đơn", icon: Coffee },
  { to: "/admin/tables", label: "Bàn", icon: Armchair },
  { to: "/admin/users", label: "Người dùng", icon: Users, adminOnly: true },
];

/** Nội dung sidebar — dùng chung cho desktop & drawer mobile. */
function SidebarNav({ items, onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-4 text-lg font-bold text-primary">
        <span className="text-2xl">🍵</span> FoodHub
      </div>
      <nav className="space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
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
    </>
  );
}

/** Layout back-office (nhân viên/quản trị) — sidebar desktop + drawer mobile. */
export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV.filter((n) => !n.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-100 bg-white md:block">
        <SidebarNav items={navItems} />
      </aside>

      {/* Drawer mobile */}
      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="w-64 bg-white shadow-xl">
            <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
          </DialogPanel>
        </div>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
              aria-label="Mở menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-700">Bảng điều khiển</h1>
          </div>
          <UserMenu variant="admin" />
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
