import { Routes, Route } from "react-router-dom";
import StorefrontLayout from "./components/layout/StorefrontLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { ProtectedRoute, RoleRoute } from "./components/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";

/**
 * Router (F1). Trang thật bổ sung dần:
 *   F2-F4: storefront (menu, giỏ, đơn, hồ sơ)
 *   F5-F9: back-office (dashboard, orders, products, tables, users)
 */
function App() {
  return (
    <Routes>
      {/* Công khai */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Storefront (khách) */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<MenuPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Back-office (🔒 + 👮 staff/admin) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={["staff", "admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<PlaceholderPage title="Quản lý đơn" />} />
            <Route path="products" element={<PlaceholderPage title="Quản lý thực đơn" />} />
            <Route path="tables" element={<PlaceholderPage title="Quản lý bàn" />} />
            <Route element={<RoleRoute roles={["admin"]} />}>
              <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Hệ thống */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
