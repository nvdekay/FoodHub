import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, ReceiptText, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";

/** variant: "storefront" (có Đơn của tôi/Hồ sơ) | "admin" (chỉ đăng xuất) */
export default function UserMenu({ variant = "storefront" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const item = (active) =>
    cn("flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700", active && "bg-gray-50");

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium hover:bg-gray-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </span>
        <span className="hidden max-w-32 truncate sm:block">{user?.fullName}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 z-40 mt-2 w-52 origin-top-right overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg transition duration-150 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="border-b border-gray-100 px-4 py-2">
          <p className="truncate text-sm font-medium text-gray-800">{user?.fullName}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        {variant === "storefront" && (
          <>
            <MenuItem>
              {({ active }) => (
                <Link to="/orders" className={item(active)}>
                  <ReceiptText className="h-4 w-4" /> Đơn của tôi
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <Link to="/profile" className={item(active)}>
                  <User className="h-4 w-4" /> Hồ sơ
                </Link>
              )}
            </MenuItem>
          </>
        )}
        <MenuItem>
          {({ active }) => (
            <button onClick={onLogout} className={cn(item(active), "text-red-600")}>
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
