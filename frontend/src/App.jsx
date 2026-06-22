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
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminTablesPage from "./pages/admin/AdminTablesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import DesignSystemPage from "./pages/DesignSystemPage";
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
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="tables" element={<AdminTablesPage />} />
            <Route element={<RoleRoute roles={["admin"]} />}>
              <Route path="users" element={<AdminUsersPage />} />
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
