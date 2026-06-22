# KẾ HOẠCH PHÁT TRIỂN FRONTEND — FoodHub

> Bản kế hoạch đầy đủ cho **Frontend dev kiêm UI/UX designer**: vừa lên lộ trình tích hợp 31 API backend, vừa lên kế hoạch thiết kế UI/UX (design system, wireframe, component, trải nghiệm theo từng role).
>
> Stack hiện có: **React 19 · Vite 8 · Tailwind CSS 4 · axios**. Backend đã xong (xem `docs/SRS_QuanLyDatMon.md`, `docs/db.md`, `backend/README.md`).
>
> ⚠️ Chỉ implement sau khi bản kế hoạch này được duyệt.

---

## ✅ Quyết định đã chốt (đã duyệt)
1. **Thư viện:** dùng **đầy đủ** bộ đề xuất (React Query · Headless UI · react-hook-form + zod · lucide · react-hot-toast · clsx/tailwind-merge · date-fns).
2. **Hướng thiết kế:** **Xanh trà sữa** (matcha) — tươi mát, hiện đại, sạch. Tokens ở mục 2.2 đã đổi sang tông xanh.
3. **Phạm vi & thứ tự:** **tuần tự F0 → F10**; mỗi phase test xong commit & push.
4. **Chi tiết món:** hiển thị bằng **modal / bottom-sheet** (không trang riêng).

---

## 0. Hiện trạng & nguyên tắc

### Hiện trạng FE
- Có sẵn: `src/App.jsx` (placeholder gọi `/foods` — sẽ thay), `src/api/axiosClient.js`, Tailwind 4 cấu hình qua `@tailwindcss/vite`, `.env` (`VITE_API_URL`).
- Chưa có: router, quản lý auth/token, state management, các trang, component dùng chung, design system.

### Nguyên tắc xuyên suốt
1. **Design-first nhẹ:** dựng design system (tokens + component cơ bản) trước, rồi mới ráp trang → đồng nhất, đỡ sửa đi sửa lại.
2. **Mobile-first cho khách, desktop-first cho nhân viên:** khách đặt món bằng điện thoại tại bàn; nhân viên thao tác trên màn hình lớn.
3. **Tách lớp rõ ràng:** `api (service) → hooks (data) → components/pages (UI)`. UI không gọi axios trực tiếp.
4. **Server state vs UI state tách biệt:** dữ liệu từ BE quản lý bằng React Query; giỏ hàng & auth bằng Context.
5. **Tôn trọng hợp đồng API:** response chuẩn `{success, data, pagination}`, lỗi `{success:false, message, errorCode}` → có lớp chuẩn hoá chung.
6. **Mọi màn hình có đủ 4 trạng thái:** loading (skeleton) · empty · error · success. Không để màn hình trắng.
7. **Accessibility & feedback:** focus rõ, contrast đạt, toast cho mọi hành động ghi (tạo/sửa/xoá).

---

## 1. Quyết định kiến trúc & thư viện (đề xuất)

| Hạng mục | Lựa chọn đề xuất | Lý do |
| --- | --- | --- |
| Routing | **react-router-dom v6** | Chuẩn de-facto, hỗ trợ nested layout + protected route theo role |
| Server state | **@tanstack/react-query** | Cache, loading/error tự động, invalidate sau mutation — hợp app nhiều list/CRUD |
| Auth/Cart state | **React Context** (+ localStorage) | Nhẹ, đủ cho token & giỏ hàng; không cần thư viện ngoài |
| Form & validate | **react-hook-form + zod** (`@hookform/resolvers`) | Form gọn, validate đồng bộ với rule BE |
| HTTP | **axios** (đã có) + interceptors | Gắn token, bắt 401 → logout, bóc `data` |
| Icon | **lucide-react** | Bộ icon nhẹ, đồng bộ |
| Thông báo | **react-hot-toast** | Toast thành công/lỗi tức thì |
| Primitive a11y | **Headless UI** (Dialog/Menu/Tabs/Listbox) | Modal/dropdown/tab có sẵn keyboard & focus trap |
| Tiện ích class | **clsx + tailwind-merge** | Ghép className có điều kiện sạch sẽ |
| Định dạng ngày/tiền | **date-fns** (locale vi) + helper `formatVND` | Hiển thị giờ địa phương & tiền VND |

> Tất cả đều là lựa chọn phổ biến, nhẹ; có thể đổi/bỏ theo ý bạn (mục 11).

---

## 2. UI/UX — Design System (làm trước khi dựng trang)

### 2.1. Ngôn ngữ thiết kế (brand)
- **Tinh thần:** quán trà sữa/đồ uống hiện đại, tươi mát, sạch sẽ, thân thiện. Ưu tiên ảnh món lớn, nhiều khoảng trắng, bo góc mềm.
- **Tông màu chủ đạo:** **xanh trà sữa (matcha)** + nền xanh nhạt, điểm nhấn xanh lá tươi.

### 2.2. Design tokens (đưa vào Tailwind theme / CSS variables)
```
Màu thương hiệu
  primary       #15803D (xanh lá)  → nút chính, nhấn
  primary-dark  #166534            → hover
  accent        #65A30D (lime)     → tag, điểm nhấn phụ
  bg-base       #F0FDF4 (xanh nhạt)→ nền trang
  surface       #FFFFFF            → card

Màu ngữ nghĩa (trạng thái)
  success #16A34A · warning #D97706 · danger #DC2626 · info #2563EB
  neutral: gray-50 → gray-900 (chữ, viền, nền phụ)

Trạng thái đơn (status pill — màu cố định để nhận biết nhanh)
  pending   xám   · confirmed xanh dương · preparing hổ phách
  ready     tím   · completed xanh lá   · cancelled đỏ

Typography  : font Inter (hoặc system-ui). Scale: 12/14/16/18/20/24/30/36
Spacing     : theo Tailwind (4px base)
Radius      : sm 6 · md 10 · lg 14 · xl 20 · full (pill/avatar)
Shadow      : card (sm), modal (lg)
Breakpoints : sm 640 · md 768 · lg 1024 · xl 1280 (chuẩn Tailwind)
```

### 2.3. Thư viện component dùng chung (`src/components/ui`)
`Button` (primary/secondary/ghost/danger, loading) · `Input` · `Textarea` · `Select` · `Checkbox/Radio` · `Badge` · **`StatusPill`** (map màu theo trạng thái đơn) · `Card` · `Modal` (Headless UI Dialog) · `Drawer` (giỏ hàng) · `Toast` · `Table` (sortable) · `Tabs` · `Pagination` · `EmptyState` · `Skeleton` · `Spinner` · `Avatar` · **`QuantityStepper`** (− số +) · **`OptionGroup`** (chọn size/topping) · **`PriceTag`** (VND) · **`OrderStatusTimeline`** (stepper theo dõi đơn).

### 2.4. Wireframe các màn hình chính (phác thảo)

**Customer — Menu (mobile)**
```
┌───────────────────────────┐
│ 🍔 FoodHub      🔍  🛒(2)  │  ← header: search + cart badge
├───────────────────────────┤
│ [Cà phê][Trà sữa][Nước ép]│  ← chips danh mục (cuộn ngang)
├───────────────────────────┤
│ ┌─────┐  Trà sữa trân châu │
│ │ ảnh │  35.000đ      [+]  │  ← card món
│ └─────┘  ⭐ nổi bật        │
│ ┌─────┐  Cà phê sữa        │
│ │ ảnh │  25.000đ      [+]  │
│ └─────┘                    │
└───────────────────────────┘
```

**Customer — Chi tiết món (modal/sheet chọn tuỳ chọn)**
```
┌───────────────────────────┐
│  [ảnh lớn]                 │
│  Trà sữa trân châu  35.000đ│
│  Mô tả ngắn...             │
│  Size *      ( ) M  (•) L  │  ← single, bắt buộc
│  Topping     [x] Trân châu │  ← multiple
│  Ghi chú [____________]    │
│  SL  [−] 2 [+]             │
│  ─────────────────────────│
│  [ Thêm vào giỏ · 80.000đ ]│  ← tổng tính realtime (client)
└───────────────────────────┘
```

**Customer — Giỏ hàng & đặt bàn → tạo đơn**
```
Giỏ hàng (drawer)              Checkout
• Trà sữa L +Trân châu  80.000đ   Bàn: [ B05 ▼ ]
• Cà phê sữa            25.000đ   Ghi chú đơn [____]
─────────────                    Tổng (BE tính lại): 105.000đ
Tạm tính 105.000đ                [   Đặt món   ]
```

**Customer — Theo dõi đơn (timeline)**
```
Đơn ORD-20260622-0007        [pending]
●─────●─────○─────○─────○
pending confirmed preparing ready completed
(đang chờ nhân viên xác nhận)
[Sửa đơn] [Huỷ đơn]   ← chỉ hiện khi pending
```

**Staff/Admin — Layout back-office (desktop)**
```
┌────────┬──────────────────────────────┐
│ Sidebar│  Topbar: tên NV ▾  [Đăng xuất]│
│ 📊 Dash│ ┌──────────────────────────┐  │
│ 🧾 Đơn │ │  Nội dung trang           │  │
│ 🍹 Món │ │  (bảng/thống kê/form)     │  │
│ 🪑 Bàn │ └──────────────────────────┘  │
│ 👤 User│                                │
└────────┴──────────────────────────────┘
```

**Staff — Bảng xử lý đơn (kanban/bảng theo trạng thái)**
```
[Tất cả|pending|confirmed|preparing|ready|completed|cancelled]  [lọc bàn] [ngày]
┌──────────────┬──────────────┬──────────────┐
│ ORD-...0007  │ ORD-...0006  │ ORD-...0005  │
│ Bàn B05 ·2 m │ Bàn B02 ·1 m │ Bàn B03      │
│ 105.000đ     │ 35.000đ      │ 60.000đ      │
│ [Xác nhận]   │ [Bắt đầu làm]│ [Hoàn tất]   │
│ [Huỷ]        │              │ [Thanh toán] │
└──────────────┴──────────────┴──────────────┘
```

**Staff — Dashboard**
```
[Doanh thu hôm nay 50.000đ][Đơn hôm nay 12][Đang chờ 3][Hoàn tất 8]
┌ Đơn theo trạng thái (biểu đồ) ┐ ┌ Món bán chạy (top 10) ┐
```

### 2.5. Trạng thái & chi tiết UX
- **Loading:** skeleton cho list/card; spinner cho nút khi submit.
- **Empty:** minh hoạ + CTA (vd "Giỏ hàng trống → Xem thực đơn").
- **Error:** banner đỏ + nút thử lại; lỗi field hiện ngay dưới input (map `errorCode`/`details` từ BE).
- **Feedback:** toast cho tạo/sửa/xoá/chuyển trạng thái; confirm dialog cho hành động phá huỷ (huỷ đơn, xoá món).
- **Responsive:** customer 1 cột (mobile) → 2–3 cột (tablet/desktop); staff sidebar thu gọn thành drawer trên mobile.
- **A11y:** dùng thẻ ngữ nghĩa, `aria-*` cho modal/menu, focus ring rõ, contrast ≥ AA, thao tác được bằng bàn phím.

---

## 3. Kiến trúc thông tin & bản đồ route (theo role)

```
Công khai
  /login                 Đăng nhập
  /register              Đăng ký

Khách (customer) — layout Storefront
  /                      Trang menu (mặc định)
  /products/:id          (mở modal chi tiết, hoặc trang riêng)
  /cart                  Giỏ hàng / checkout
  /orders                Đơn của tôi
  /orders/:id            Theo dõi đơn
  /profile               Hồ sơ

Nhân viên/Quản trị — layout Back-office (/admin)
  /admin                 Dashboard
  /admin/orders          Quản lý đơn
  /admin/orders/:id      Chi tiết đơn (xử lý)
  /admin/categories      Quản lý danh mục
  /admin/products        Quản lý món
  /admin/tables          Quản lý bàn
  /admin/users           Quản lý người dùng (👑 chỉ admin)
```

**Bảo vệ route:** `ProtectedRoute` (cần đăng nhập) + `RoleRoute(roles)` (staff/admin/admin-only). Chưa đăng nhập → `/login`. Sai quyền → trang 403. Sau đăng nhập điều hướng theo role (customer → `/`, staff/admin → `/admin`).

---

## 4. Cấu trúc thư mục mục tiêu

```
src/
├── api/
│   ├── axiosClient.js        # base + interceptors (token, 401, bóc data)
│   ├── authApi.js  · userApi.js
│   ├── categoryApi.js · productApi.js
│   ├── tableApi.js · orderApi.js · dashboardApi.js
├── hooks/                    # React Query hooks bọc api (useProducts, useMyOrders, ...)
├── context/
│   ├── AuthContext.jsx       # user, token, login/logout
│   └── CartContext.jsx       # giỏ hàng (localStorage)
├── components/
│   ├── ui/                   # design system (Button, Modal, StatusPill, ...)
│   ├── layout/               # StorefrontLayout, AdminLayout, Sidebar, Topbar
│   └── common/               # ProtectedRoute, RoleRoute, EmptyState, ...
├── features/                 # nhóm theo nghiệp vụ
│   ├── auth/  · menu/ · cart/ · orders/ · admin-orders/
│   ├── admin-menu/ · admin-tables/ · admin-users/ · dashboard/
├── pages/                    # các trang ghép route
├── lib/                      # formatVND, formatDate, statusConfig, constants (enum)
├── styles/ (tokens)          # theme tokens nếu tách
├── App.jsx (router) · main.jsx
```

---

## 5. Lớp tích hợp API

- **`axiosClient` interceptors:**
  - Request: gắn `Authorization: Bearer <token>` từ AuthContext/localStorage.
  - Response: trả thẳng `res.data` (đã chuẩn `{success,data,...}`); lỗi → chuẩn hoá `{message, errorCode, details}` để hiển thị.
  - 401 `ACCOUNT_LOCKED`/`UNAUTHORIZED` → tự logout + chuyển `/login`.
- **Service modules** (1 file/BE module) — hàm mảnh ánh xạ đúng endpoint (mục 7).
- **React Query hooks** — `useQuery` cho GET, `useMutation` cho ghi; `invalidateQueries` sau mutation (vd xác nhận đơn → refresh danh sách đơn + dashboard).
- **Enum dùng chung** (`lib/constants`) — copy từ Phụ lục SRS mục 9 (role, status, paymentStatus, paymentMethod, table status, option type) để FE & BE khớp.

---

## 6. Lộ trình phát triển theo phase

> Mỗi phase: tiêu chí "Done" = chạy được trên app thật + đủ 4 trạng thái + responsive cơ bản.

### Phase F0 — Setup & Design System
- Cài thư viện (mục 1). Cấu hình router, React Query provider, Toaster, AuthContext skeleton.
- Tạo design tokens + bộ `components/ui` cốt lõi (Button, Input, Card, Modal, StatusPill, Badge, Skeleton, EmptyState, Spinner, Pagination, Toast).
- Dựng `axiosClient` interceptors + `lib` (formatVND, formatDate, statusConfig, constants).
- Gỡ `App.jsx` placeholder; dựng khung router 2 layout.
- **Done:** storybook-lite (1 trang demo component) hiển thị đủ component & tokens.

### Phase F1 — Auth & nền điều hướng
- Trang Login/Register (react-hook-form + zod). Lưu token + user vào AuthContext/localStorage.
- `ProtectedRoute`, `RoleRoute`, trang 403, điều hướng theo role.
- Topbar hiển thị user + đăng xuất.
- **API:** `POST /auth/register`, `POST /auth/login`, `GET /users/me`.
- **Done:** đăng ký → đăng nhập → vào đúng khu vực theo role; token hết hạn/khoá → đẩy về login.

### Phase F2 — Khách: Duyệt thực đơn
- Trang Menu: chips danh mục, lưới món, tìm kiếm theo tên, lọc danh mục, phân trang/`load more`, badge "nổi bật".
- Modal/trang chi tiết món: hiển thị options (size/topping/đường), tính tạm giá realtime phía client.
- **API:** `GET /categories`, `GET /products` (search/filter/paginate), `GET /products/:id`.
- **Done:** duyệt + tìm + xem chi tiết mượt; skeleton/empty/error đầy đủ.

### Phase F3 — Khách: Giỏ hàng & Đặt món
- CartContext (thêm/sửa SL/xoá, lưu localStorage), drawer giỏ hàng + badge.
- Trang checkout: chọn bàn (GET /tables), ghi chú, hiển thị tạm tính (client) — **tổng chính thức lấy từ response BE**.
- Tạo đơn, validate options/required theo schema món; xử lý lỗi `PRODUCT_UNAVAILABLE`/`TABLE_INACTIVE`/`OPTION_*`.
- **API:** `GET /tables`, `POST /orders`.
- **Done:** đặt đơn thành công → điều hướng sang theo dõi đơn; giỏ được dọn.

### Phase F4 — Khách: Đơn của tôi & Theo dõi
- Danh sách đơn (phân trang, lọc trạng thái), StatusPill.
- Chi tiết đơn: `OrderStatusTimeline`, danh sách món snapshot, tổng tiền, thanh toán.
- Sửa đơn & huỷ đơn **chỉ khi pending** (ẩn nút theo trạng thái; xử lý 409 `ORDER_NOT_EDITABLE`).
- Hồ sơ: xem/sửa tên/SĐT/avatar(link)/đổi mật khẩu.
- **API:** `GET /orders/my`, `GET /orders/:id`, `PUT /orders/:id`, `DELETE /orders/:id`, `GET/PUT /users/me`.
- **Done:** vòng đời đơn phía khách hoàn chỉnh, cập nhật trạng thái khi refetch.

### Phase F5 — Back-office: Shell & Dashboard
- AdminLayout (sidebar + topbar, responsive drawer).
- Dashboard: thẻ KPI (doanh thu hôm nay/tuần, đơn theo trạng thái, đơn hôm nay), biểu đồ đơn theo trạng thái, bảng top món bán chạy.
- **API:** `GET /dashboard/summary`, `GET /dashboard/top-products`.
- **Done:** dashboard hiển thị số liệu thật từ seed.

### Phase F6 — Nhân viên: Xử lý đơn
- Bảng/kanban đơn: lọc trạng thái/bàn/ngày, phân trang, mới nhất trước.
- Hành động theo state machine: **Xác nhận** (kèm nhập giảm giá), **Bắt đầu làm/Hoàn tất** (status), **Huỷ** (lý do), **Thanh toán** (status + phương thức). Nút hiện theo trạng thái hợp lệ; xử lý 409 `INVALID_STATUS_TRANSITION`.
- Chi tiết đơn + statusHistory.
- **API:** `GET /orders`, `PATCH /orders/:id/confirm|status|cancel|payment`, `GET /orders/:id`.
- **Done:** chạy trọn vòng đời đơn từ phía NV; invalidate dashboard sau khi completed.

### Phase F7 — Nhân viên: Quản lý thực đơn
- Quản lý danh mục: bảng (kể cả ẩn, `?all=true`), form thêm/sửa, ẩn/xoá.
- Quản lý món: bảng + lọc, form thêm/sửa với **builder options** (thêm nhóm size/topping, choices + phụ phí), nhập `imageUrl` (link), bật/tắt còn bán/nổi bật.
- **API:** `GET /categories?all=true`, `POST/PUT/DELETE /categories`, `GET /products`, `GET /products/:id`, `POST/PUT/DELETE /products`.
- **Done:** CRUD menu đầy đủ, options builder validate giống BE.

### Phase F8 — Nhân viên: Quản lý bàn
- Bảng bàn, form thêm/sửa, đổi trạng thái `reserved` thủ công, ẩn bàn (xử lý 409 `TABLE_HAS_ACTIVE_ORDERS`).
- **API:** `GET /tables`, `POST/PUT/DELETE /tables`.
- **Done:** CRUD bàn + hiển thị trạng thái occupied/available realtime (refetch).

### Phase F9 — Quản trị: Quản lý người dùng (👑)
- Bảng người dùng (phân trang, lọc role, tìm kiếm), khoá/mở khoá, đổi role; xử lý guard `SELF_MODIFY`/`LAST_ADMIN`.
- **API:** `GET /users`, `PATCH /users/:id/status`.
- **Done:** admin quản trị tài khoản; ẩn mục này với staff.

### Phase F10 — Hoàn thiện UX & QA
- Rà soát responsive (mobile/desktop), trạng thái loading/empty/error toàn bộ, skeleton, toast nhất quán.
- A11y pass (focus, aria, contrast), format VND/ngày locale vi, thông điệp lỗi thân thiện theo `errorCode`.
- Tối ưu nhẹ (lazy-load route, memo list), favicon/tiêu đề, README FE.
- **Done:** đi hết luồng demo (khách đặt → NV xử lý → completed → dashboard cập nhật) mượt mà.

---

## 7. Bản đồ Màn hình ↔ Endpoint API

| Màn hình | Endpoint (BE) | Phase |
| --- | --- | --- |
| Đăng ký/Đăng nhập | `POST /auth/register` · `POST /auth/login` | F1 |
| Lấy hồ sơ hiện tại | `GET /users/me` | F1/F4 |
| Hồ sơ (sửa) | `PUT /users/me` | F4 |
| Menu (danh mục) | `GET /categories` | F2 |
| Menu (món, lọc/tìm/trang) | `GET /products` | F2 |
| Chi tiết món | `GET /products/:id` | F2 |
| Chọn bàn khi đặt | `GET /tables` | F3 |
| Tạo đơn | `POST /orders` | F3 |
| Đơn của tôi | `GET /orders/my` | F4 |
| Theo dõi/chi tiết đơn | `GET /orders/:id` | F4/F6 |
| Sửa / huỷ đơn (khách) | `PUT /orders/:id` · `DELETE /orders/:id` | F4 |
| Dashboard | `GET /dashboard/summary` · `/top-products` | F5 |
| Quản lý đơn (NV) | `GET /orders` | F6 |
| Xác nhận/Trạng thái/Huỷ/Thanh toán | `PATCH /orders/:id/confirm·status·cancel·payment` | F6 |
| Quản lý danh mục | `GET ?all=true · POST · PUT · DELETE /categories` | F7 |
| Quản lý món | `GET/POST/PUT/DELETE /products` | F7 |
| Quản lý bàn | `GET/POST/PUT/DELETE /tables` | F8 |
| Quản lý người dùng | `GET /users` · `PATCH /users/:id/status` | F9 |

→ Phủ **toàn bộ 31 endpoint**.

---

## 8. Checklist chất lượng (NFR FE)
- [ ] Responsive mobile/tablet/desktop cho cả 2 khu vực.
- [ ] 4 trạng thái mỗi màn (loading/empty/error/success).
- [ ] A11y: keyboard, focus ring, aria, contrast AA.
- [ ] Tiền VND & thời gian định dạng locale vi.
- [ ] Token tự gắn; 401/khoá → logout; route bảo vệ theo role.
- [ ] Mọi hành động ghi có toast + confirm cho hành động phá huỷ.
- [ ] Hiển thị tổng tiền lấy từ BE (không tin số client tự tính).
- [ ] Nút hành động đơn hiện đúng theo state machine.

---

## 9. Thứ tự & phụ thuộc
F0 → F1 là nền (bắt buộc trước). Sau đó nhánh **Khách** (F2→F3→F4) và nhánh **Back-office** (F5→F6→F7→F8→F9) có thể làm song song nếu cần, nhưng đề xuất tuần tự F0→F10 cho gọn. F10 chốt cuối.

---

## 10. Cách áp dụng kỹ năng UI/UX trong quá trình làm
- **Trước mỗi phase UI:** phác wireframe nhanh (như mục 2.4) → thống nhất bố cục trước khi code.
- **Dựng theo design tokens & component dùng lại** → đồng nhất, dễ bảo trì.
- **Tự review UX:** mỗi màn kiểm 4 trạng thái + responsive + a11y trước khi coi là Done.
- **Có thể xuất mockup trực quan** để bạn duyệt giao diện trước khi ráp dữ liệu (tùy chọn).

---

## 11. Quyết định (đã chốt)
1. **Bộ thư viện:** dùng đầy đủ bộ đề xuất ✅
2. **Hướng thiết kế:** Xanh trà sữa (matcha) ✅
3. **Chi tiết món:** modal/bottom-sheet ✅
4. **Quản lý đơn (NV):** bảng có bộ lọc (không kanban kéo-thả) — đề xuất giữ.
5. **Phạm vi & thứ tự:** tuần tự F0→F10, đủ cả 3 role ✅
