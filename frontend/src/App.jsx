import { Routes, Route } from "react-router-dom";
import StorefrontLayout from "./components/layout/StorefrontLayout";
import AdminLayout from "./components/layout/AdminLayout";
import DesignSystemPage from "./pages/DesignSystemPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";

/**
 * Khung router (F0). Các trang thật được bổ sung dần qua từng phase:
 *   F1: /login, /register + bảo vệ route theo role
 *   F2-F4: storefront (menu, giỏ, đơn, hồ sơ)
 *   F5-F9: back-office (dashboard, orders, products, tables, users)
 */
function App() {
  return (
    <Routes>
      {/* Storefront (khách) */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<DesignSystemPage />} />
      </Route>

      {/* Back-office (nhân viên/quản trị) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<PlaceholderPage title="Tổng quan (Dashboard)" />} />
      </Route>

      {/* Trang hệ thống */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
