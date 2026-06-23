import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import StorefrontLayout from "./components/layout/StorefrontLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { ProtectedRoute, RoleRoute } from "./components/common/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy-load các trang để chia nhỏ bundle (tải nhanh hơn)
const AuthPage = lazy(() => import("./pages/AuthPage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminTablesPage = lazy(() => import("./pages/admin/AdminTablesPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystemPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));

/**
 * Router (F10). Layout giữ eager để điều hướng trong cùng khu vực không nháy;
 * các trang lazy-load, mỗi layout có Suspense + hiệu ứng chuyển trang riêng.
 */
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Công khai */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Storefront (khách) */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<MenuPage />} />
            {/* Trang design-system chỉ bật ở môi trường dev */}
            {import.meta.env.DEV && (
              <Route path="/design-system" element={<DesignSystemPage />} />
            )}
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
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
