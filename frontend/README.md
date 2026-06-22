# FoodHub — Frontend

Giao diện đặt món tại quán (storefront cho khách) + back-office (nhân viên/quản trị).
Tích hợp đầy đủ 31 endpoint backend, phủ 3 vai trò: **khách · nhân viên · quản trị**.

## Tech stack
- **React 19 · Vite 8 · Tailwind CSS 4**
- **React Router v7** — routing + nested layout + protected route theo role
- **@tanstack/react-query** — server state (cache, loading/error, invalidate sau mutation)
- **React Context** — auth & giỏ hàng (localStorage)
- **react-hook-form + zod** — form & validate (auth, hồ sơ)
- **Headless UI** — Modal/Drawer/Menu (a11y + transition)
- **axios** (interceptors) · **lucide-react** · **react-hot-toast** · **date-fns** · **clsx + tailwind-merge**

## Chạy dự án
```bash
npm install
npm run dev       # chạy dev (http://localhost:5173)
npm run build     # build production
npm run preview   # xem thử bản build
npm run lint      # kiểm tra eslint
```
Cấu hình API qua biến môi trường `VITE_API_URL` (mặc định `http://localhost:5050/api`) — xem `.env.example`.

## Cấu trúc thư mục
```
src/
├── api/          # service modules bọc axios (auth, user, category, product, table, order, dashboard)
├── hooks/        # React Query hooks (useMenu, useOrders, useStaffOrders, useAdminMenu, ...)
├── context/      # AuthContext, CartContext
├── components/
│   ├── ui/       # design system (Button, Input, Modal, Drawer, StatusPill, QuantityStepper, ...)
│   ├── layout/   # StorefrontLayout, AdminLayout, UserMenu
│   └── common/   # ProtectedRoute/RoleRoute, PageTransition, PageLoader
├── features/     # nhóm theo nghiệp vụ (menu, cart, orders, admin-orders, admin-menu, admin-tables, dashboard)
├── pages/        # trang ghép route (storefront + admin/)
├── lib/          # format (VND/ngày), constants (enum), statusConfig, cn, navigation
└── App.jsx       # router (lazy-load trang) · main.jsx (providers)
```

## Lộ trình (F0 → F10)
| Phase | Nội dung |
| --- | --- |
| F0 | Setup & Design System |
| F1 | Auth & nền điều hướng |
| F2 | Khách: Duyệt thực đơn |
| F3 | Khách: Giỏ hàng & Đặt món |
| F4 | Khách: Đơn của tôi & Theo dõi |
| F5 | Back-office: Shell & Dashboard |
| F6 | Nhân viên: Xử lý đơn (state machine) |
| F7 | Nhân viên: Quản lý thực đơn (CRUD + options builder) |
| F8 | Nhân viên: Quản lý bàn |
| F9 | Quản trị: Quản lý người dùng |
| F10 | Hoàn thiện UX & QA (lazy-load, chuyển trang mượt, a11y) |

## Đặc điểm UX
- **4 trạng thái** mỗi màn: loading (skeleton) · empty · error · success.
- **Chuyển trang mượt**: hiệu ứng trượt-mờ + cuộn về đầu khi đổi route; Modal/Drawer có transition.
- **Lazy-load** từng trang để chia nhỏ bundle, tải nhanh.
- **A11y**: focus ring, aria, tôn trọng `prefers-reduced-motion`.
- **Định dạng locale vi**: tiền VND & ngày giờ.
- Token tự gắn vào request; 401/khoá → tự đăng xuất; route bảo vệ theo role.

## Tài khoản mẫu (sau khi seed backend)
| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@foodhub.com | 123456 |
| Nhân viên | staff@foodhub.com | 123456 |
| Khách | customer@foodhub.com | 123456 |
