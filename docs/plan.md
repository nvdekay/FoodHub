# KẾ HOẠCH PHÁT TRIỂN BACKEND — FoodHub

> Bản kế hoạch chi tiết để hiện thực hóa Backend đúng theo `docs/SRS_QuanLyDatMon.md`.
> Stack: **Node.js + Express + MongoDB (Mongoose 8)**, ESM (`"type": "module"`), JWT + bcrypt.
> Mục tiêu: hoàn thiện toàn bộ API & nghiệp vụ Backend theo SRS trước, Frontend làm sau.

---

## 0. Hiện trạng & nguyên tắc

### Hiện trạng codebase
- Đã có skeleton: `src/app.js`, `src/server.js`, `src/config/db.js`.
- Có model/CRUD mẫu `Food` (`models/Food.js`, `controllers/foodController.js`, `routes/foodRoutes.js`) — **KHÔNG khớp SRS, sẽ được gỡ bỏ** ở Phase 1.
- Dependencies hiện có: `express`, `mongoose`, `cors`, `dotenv`, `nodemon`.

### Nguyên tắc kiến trúc (theo SRS mục 5 & 8.4)
1. **Phân tầng rõ ràng:** `routes → controllers → services → models`. Controller chỉ nhận request/trả response; nghiệp vụ nằm ở service.
2. **Response thống nhất** (SRS 7.5):
   - Thành công: `{ success: true, data, message }`
   - Có phân trang: `{ success: true, data: [...], pagination: { page, limit, total } }`
   - Lỗi: `{ success: false, message, errorCode }`
3. **Tiền tính ở Backend** — không tin số tiền client gửi. Backend tự tính `itemTotal`, `subtotal`, `totalAmount`.
4. **Snapshot bất biến** — đơn lưu `name`, `unitPrice`, `selectedOptions` tại thời điểm đặt.
5. **Soft delete** — ưu tiên `isActive`/`isAvailable = false` thay vì xóa cứng.
6. **State machine đơn hàng** — chỉ cho phép chuyển trạng thái hợp lệ (SRS 8.1), nếu sai trả `409`.
7. **Bảo mật** — bcrypt ≥10 rounds, JWT có hạn, `passwordHash` luôn `select:false`, RBAC theo `role`.
8. **Tiền tệ** = Number nguyên (VND); thời gian = ISODate (UTC).

### Cấu trúc thư mục mục tiêu
```
backend/src/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Table.js
│   ├── Order.js
│   └── Counter.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── categoryController.js
│   ├── productController.js
│   ├── tableController.js
│   ├── orderController.js
│   └── dashboardController.js
├── services/
│   ├── authService.js
│   ├── userService.js
│   ├── categoryService.js
│   ├── productService.js
│   ├── tableService.js
│   ├── orderService.js
│   └── dashboardService.js
├── routes/
│   ├── index.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   ├── tableRoutes.js
│   ├── orderRoutes.js
│   └── dashboardRoutes.js
├── middlewares/
│   ├── auth.js          # verify JWT → req.user
│   ├── rbac.js          # requireRole('staff','admin')
│   ├── validate.js      # chạy express-validator / zod
│   ├── errorHandler.js  # bắt lỗi tập trung
│   └── upload.js        # multer
├── validators/          # schema validate cho từng module
├── utils/
│   ├── ApiError.js      # class lỗi chuẩn (statusCode + errorCode)
│   ├── response.js      # helper sendSuccess / sendPaginated
│   ├── asyncHandler.js  # wrap controller bắt lỗi async
│   ├── slugify.js
│   ├── jwt.js
│   └── generateOrderCode.js
├── seeds/
│   └── seed.js          # tạo dữ liệu mẫu (admin, categories, products, tables)
├── app.js
└── server.js
```

---

## QUYẾT ĐỊNH NGHIỆP VỤ ĐÃ CHỐT (sau review luồng)

Các quyết định dưới đây bổ sung/làm rõ SRS, là chuẩn để code. Mỗi quyết định đã được nhúng vào phase tương ứng.

| # | Vấn đề | Phương án chốt | Phase |
|---|---|---|---|
| 1 | Trạng thái bàn khi 1 bàn có nhiều đơn | **Tự động theo reference-counting:** hàm `syncTableStatus(tableId)` set `occupied` khi còn ≥1 đơn active `{pending,confirmed,preparing,ready}`; set `available` khi không còn đơn active. Gọi sau create/confirm/status/cancel/complete. `reserved` = staff đặt tay (ngoài luồng tự động). | 6, 7 |
| 2 | Ràng buộc bàn khi đặt | Validate `tableId` **tồn tại + `isActive=true`**. **Cho phép nhiều đơn trên cùng 1 bàn** (mô hình dine-in gọi nhiều đợt) → KHÔNG chặn theo `occupied`. | 6 |
| 3 | Đặt món đã ẩn | Khi tạo/sửa đơn, **validate mọi `productId` phải `isAvailable=true`** (và category `isActive=true`). Vi phạm → 409 `PRODUCT_UNAVAILABLE`. | 6 |
| 4 | Thanh toán ↔ hoàn tất ↔ hoàn tiền | **KHÔNG bắt buộc `paid` trước khi `completed`** (cho linh hoạt, trả tiền tại quầy). Khi **hủy đơn đã `paid`** → tự set `paymentStatus='refunded'` + ghi statusHistory. Enum `refunded` được dùng ở đây. | 7 |
| 5 | `discountAmount` mồ côi | Cho **staff/admin áp giảm giá khi xác nhận đơn** (thêm field `discountAmount` optional vào payload `PATCH /confirm`). Validate `0 ≤ discount ≤ subtotal`, tính lại `totalAmount`. | 7 |
| 6 | Mâu thuẫn QR vs đăng nhập | **Theo SRS giả định 2.2: bắt buộc đăng nhập mới đặt món.** QR chỉ deep-link tới trang menu của bàn; khách vẫn phải login. Không hỗ trợ khách vãng lai ẩn danh trong phạm vi này. `qrCodeUrl` là tiện ích phụ. | 6 |
| 7 | Nhân viên "đặt hộ" | `POST /api/orders`: nếu role=`customer` → `customerId` ép = chính mình (bỏ qua body). Nếu role=`staff/admin` → cho phép truyền `customerId` của một user **đã tồn tại**; không truyền thì mặc định = id của staff. `customerId` vẫn bắt buộc (ref users). | 6 |
| 8 | Định nghĩa doanh thu | **Doanh thu = tổng `totalAmount` của đơn `status='completed'`, tính theo ngày của `completedAt`.** Số đơn theo trạng thái đếm trên tất cả đơn. Định nghĩa duy nhất, nhất quán toàn dashboard. | 8 |
| 9 | Mâu thuẫn sơ đồ vs bảng trạng thái | **Chốt theo bảng (chặt hơn):** chỉ cho **hủy ở `pending` và `confirmed`**. Vào `preparing` rồi phải đi tiếp `ready → completed`. State machine cuối: pending→{confirmed,cancelled}; confirmed→{preparing,cancelled}; preparing→ready; ready→completed; completed/cancelled = kết thúc. | 7 |
| 10 | Race: khách sửa ↔ NV xác nhận | **Update có điều kiện atomic**, không tách đọc-rồi-ghi. Sửa/xóa: `findOneAndUpdate({_id, customerId, status:'pending'}, ...)`. Confirm: `findOneAndUpdate({_id, status:'pending'}, ...)`. Không khớp → 409. | 6, 7 |
| 11 | `soldCount` cộng đôi | Chỉ cộng **trong chính bước chuyển atomic sang `completed`** (điều kiện `status != 'completed'`) → đảm bảo exactly-once. | 7 |
| 12 | `soldCount` lệch số liệu | **Nguồn chân lý cho top-products = aggregate từ `items` của đơn `completed`.** `soldCount` chỉ là cache để hiển thị/sắp xếp nhanh. | 8 |
| 13 | Khóa user / đổi role không hiệu lực ngay | **auth middleware nạp user từ DB mỗi request:** lấy `role` mới nhất, từ chối nếu `isActive=false` (401 `ACCOUNT_LOCKED`). Token chỉ mang `userId`. Đặt token đời ngắn hợp lý. | 3 |
| 14 | Khóa nhầm admin cuối | Guard ở `PATCH /users/:id/status`: **không cho tự khóa**, **không cho khóa/giáng admin active cuối cùng**. | 3 |
| 15 | Validate `selectedOptions` | Group `type=single` chọn đúng 1; group `required` bắt buộc có lựa chọn; choice phải thuộc options của món; **`priceModifier` lấy từ DB**, không tin client. | 6 |
| 16 | Sửa đơn khi giá menu vừa đổi | Khi sửa đơn `pending` → **re-snapshot toàn bộ items theo giá menu hiện hành** (đơn chưa confirmed nên chưa "đóng băng"). | 6 |
| 17 | Đổi email trùng | Bắt lỗi duplicate key (11000) → 409 `EMAIL_TAKEN` thông báo gọn. | 3 |
| 18 | Hủy/hoàn tất → trả bàn | Gọi `syncTableStatus` sau mọi thay đổi trạng thái đơn (gộp với #1). | 7 |

---

## PHASE 1 — Nền tảng & hạ tầng dùng chung
**Mục tiêu:** dựng bộ khung kỹ thuật trước khi viết nghiệp vụ.

- [ ] Cài thêm dependencies: `bcryptjs`, `jsonwebtoken`, `express-validator`, `multer`, `morgan` (log dev), `express-async-errors` (tùy chọn).
- [ ] Cập nhật `.env.example`: thêm `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`, `UPLOAD_DIR`.
- [ ] `utils/ApiError.js` — class lỗi (message, statusCode, errorCode).
- [ ] `utils/response.js` — `sendSuccess(res, data, message, status)`, `sendPaginated(res, data, pagination)`.
- [ ] `utils/asyncHandler.js` — wrap async controller.
- [ ] `middlewares/errorHandler.js` — chuẩn hóa lỗi (ValidationError của Mongoose, duplicate key 11000, ApiError, lỗi JWT) về format SRS 7.5. Kèm `notFoundHandler`.
- [ ] `middlewares/validate.js` — gom kết quả express-validator → trả 422.
- [ ] `utils/slugify.js` — sinh slug tiếng Việt (bỏ dấu, gạch nối).
- [ ] Refactor `app.js`: gắn `morgan`, mount `routes/index.js`, gắn `notFoundHandler` + `errorHandler` (cuối cùng), phục vụ tĩnh thư mục upload.
- [ ] Gỡ bỏ `Food` model/controller/route mẫu.

**Tiêu chí hoàn thành:** server chạy được, `GET /api/health` OK, mọi lỗi trả đúng format chuẩn.

---

## PHASE 2 — Models (6 collections) theo SRS mục 6
**Mục tiêu:** định nghĩa đầy đủ schema, enum, index theo SRS.

- [ ] `models/User.js` — fullName, email(unique, lowercase), phone, passwordHash(`select:false`), role enum `[customer,staff,admin]` default customer, avatarUrl, isActive default true, lastLoginAt, timestamps. Index: email(unique), role, phone. Method `comparePassword`, hook hash mật khẩu (hoặc hash ở service).
- [ ] `models/Category.js` — name(unique), slug(unique), description, imageUrl, displayOrder default 0, isActive default true, timestamps. Index: slug(unique), isActive, displayOrder.
- [ ] `models/Product.js` — name, slug(unique), description, categoryId(ref Category), basePrice(min 0), imageUrl, `options[]` (nhúng: name, type enum `[single,multiple]`, required, `choices[]`{label, priceModifier min 0}), isAvailable default true, isFeatured default false, preparationTime, soldCount default 0, timestamps. Index: categoryId, slug(unique), isAvailable, text index trên name.
- [ ] `models/Table.js` — tableNumber(unique), capacity, status enum `[available,occupied,reserved]` default available, qrCodeUrl, isActive default true, timestamps. Index: tableNumber(unique), status.
- [ ] `models/Order.js` — theo SRS 6.4.5 & 6.5: orderCode(unique), customerId(ref), customerInfo{fullName,phone}, tableId(ref), tableNumber, `items[]`(nhúng snapshot: productId, name, unitPrice, quantity min 1, selectedOptions[]{groupName,choiceLabel,priceModifier}, itemTotal, note), subtotal, discountAmount default 0, totalAmount, status enum 6 giá trị default pending, paymentStatus enum default unpaid, paymentMethod enum, note, cancelReason, confirmedBy(ref), confirmedAt, completedAt, `statusHistory[]`{status,changedBy,changedAt,note}, timestamps. Validate items.length > 0. Index: orderCode(unique), customerId, status, tableId, createdAt(-1).
- [ ] `models/Counter.js` — `_id`(String), seq(Number).

**Tiêu chí hoàn thành:** import tất cả model không lỗi; index khai báo đúng.

---

## PHASE 3 — Xác thực & Tài khoản (FR-AUTH, SRS 7.1)
**Mục tiêu:** đăng ký/đăng nhập, JWT, RBAC middleware, quản lý hồ sơ & tài khoản.

- [ ] `utils/jwt.js` — `signToken({userId, role})`, `verifyToken`.
- [ ] `middlewares/auth.js` — đọc `Authorization: Bearer`, verify token (chỉ chứa `userId`), **nạp user từ DB mỗi request** → lấy `role` mới nhất, **từ chối nếu `isActive=false`** (401 `ACCOUNT_LOCKED`); gắn `req.user`. *(Quyết định #13)*
- [ ] `middlewares/rbac.js` — `requireRole(...roles)` → 403 nếu không khớp.
- [ ] `authService` + `authController`:
  - `POST /api/auth/register` (FR-AUTH-01) — validate, email duy nhất (bắt lỗi 11000 → 409 `EMAIL_TAKEN`, quyết định #17), hash bcrypt, role mặc định customer.
  - `POST /api/auth/login` (FR-AUTH-02) — kiểm tra email + mật khẩu + isActive, cập nhật `lastLoginAt`, trả JWT + thông tin user (không kèm passwordHash).
- [ ] `userService` + `userController`:
  - `GET /api/users/me` 🔒 (FR-AUTH-04).
  - `PUT /api/users/me` 🔒 — cập nhật tên/SĐT/avatar, đổi mật khẩu (yêu cầu mật khẩu cũ). Đổi email trùng → 409 `EMAIL_TAKEN` (#17).
  - `GET /api/users` 👮 Admin — danh sách + phân trang + lọc role.
  - `PATCH /api/users/:id/status` 👮 Admin (FR-AUTH-05) — khóa/mở `isActive`, đổi role staff. **Guard #14:** không cho tự khóa; không cho khóa/giáng admin active cuối cùng (kiểm tra số admin còn lại) → 409 `LAST_ADMIN`.
- [ ] `validators/authValidator.js`, `validators/userValidator.js`.

**Tiêu chí hoàn thành:** đăng ký → đăng nhập → gọi route 🔒 bằng token thành công; route 👮 chặn customer.

---

## PHASE 4 — Thực đơn: Danh mục & Món (FR-MENU, SRS 7.2)
**Mục tiêu:** CRUD category/product với soft delete & snapshot-friendly.

- [ ] **Ảnh:** KHÔNG upload file. `imageUrl` là **chuỗi link** do người dùng điền, lưu thẳng DB (không dùng multer, không phụ thuộc hệ thống lưu trữ bên thứ ba).
- [ ] `categoryService` + `categoryController`:
  - `GET /api/categories` công khai (FR-MENU-01) — chỉ `isActive=true`, sort `displayOrder`. (Hỗ trợ query `?all=true` cho staff xem cả ẩn.)
  - `POST /api/categories` 👮 — tự sinh slug, name duy nhất.
  - `PUT /api/categories/:id` 👮.
  - `DELETE /api/categories/:id` 👮 (FR-MENU-02) — **soft delete** (isActive=false) nếu còn món; chặn xóa cứng khi còn product.
- [ ] `productService` + `productController`:
  - `GET /api/products` công khai (FR-MENU-03) — lọc `categoryId`, tìm theo tên (text/regex), lọc `isAvailable`, **phân trang**, sort.
  - `GET /api/products/:id` công khai (FR-MENU-04) — populate category.
  - `POST /api/products` 👮 (FR-MENU-05) — sinh slug, validate options/choices, name+category nên duy nhất.
  - `PUT /api/products/:id` 👮 (FR-MENU-06) — đổi giá KHÔNG ảnh hưởng đơn cũ (đảm bảo nhờ snapshot ở Order).
  - `DELETE /api/products/:id` 👮 (FR-MENU-07) — **soft delete** `isAvailable=false`.
- [ ] `validators/categoryValidator.js`, `validators/productValidator.js`.

**Tiêu chí hoàn thành:** tạo category → tạo product có options → list/filter/search/paginate hoạt động; soft delete đúng.

---

## PHASE 5 — Quản lý bàn (FR-TBL, SRS 7.4)
**Mục tiêu:** CRUD bàn + theo dõi trạng thái.

- [ ] `tableService` + `tableController`:
  - `GET /api/tables` 🔒 (FR-TBL-01/02) — danh sách, lọc status.
  - `POST /api/tables` 👮 — tableNumber duy nhất.
  - `PUT /api/tables/:id` 👮 — sửa thông tin; staff đặt `reserved`/bỏ `reserved` **thủ công** (ngoài luồng auto của `syncTableStatus`, #1).
  - `DELETE /api/tables/:id` 👮 — soft delete (isActive=false); chặn nếu bàn còn đơn active.
- [ ] `validators/tableValidator.js`.

**Tiêu chí hoàn thành:** CRUD bàn hoạt động; ràng buộc tableNumber unique.

---

## PHASE 6 — Đặt món phía Khách (FR-ORD, SRS 7.3)
**Mục tiêu:** vòng đời đơn phía khách + sinh orderCode an toàn + tính tiền ở backend.

- [ ] `utils/generateOrderCode.js` — atomic `Counter.findOneAndUpdate({_id:'order-YYYYMMDD'}, {$inc:{seq:1}}, {new,upsert})` → `ORD-YYYYMMDD-0001`.
- [ ] `services/tableService.syncTableStatus(tableId)` — **reference-counting (#1/#18):** đếm đơn active `{pending,confirmed,preparing,ready}` trên bàn → còn ≥1 thì `occupied`, hết thì `available` (không động vào `reserved`).
- [ ] `orderService` — hàm dùng chung:
  - `buildOrderItems(items)` — với mỗi item: lấy Product hiện hành, **chặn nếu `isAvailable=false` hoặc category `isActive=false`** → 409 `PRODUCT_UNAVAILABLE` (#3); snapshot name + unitPrice(basePrice); **validate `selectedOptions` (#15):** choice phải thuộc options của món, group `single` đúng 1 lựa chọn, group `required` bắt buộc có, `priceModifier` lấy từ DB; tính `itemTotal = (unitPrice + Σ priceModifier) × quantity`.
  - `calcTotals(items, discount)` → subtotal, totalAmount.
  - `resolveCustomer(req, body)` — **#7:** customer → ép `customerId=self`; staff/admin → cho truyền `customerId` của user tồn tại, mặc định = self.
- [ ] `orderController` (🔒, gắn `auth`):
  - `POST /api/orders` (FR-ORD-02) — **validate tableId tồn tại + `isActive=true`** (#2, cho phép nhiều đơn/bàn), resolveCustomer (#7), build items + tính tiền backend, snapshot customerInfo & tableNumber, sinh orderCode, status=pending, push statusHistory[pending], **gọi `syncTableStatus`** (#1).
  - `GET /api/orders/my` (FR-ORD-05) — đơn của chính khách, phân trang, sort mới nhất.
  - `GET /api/orders/:id` — chỉ chủ đơn xem được (hoặc staff/admin), nếu không phải → 403.
  - `PUT /api/orders/:id` (FR-ORD-03) — **atomic `findOneAndUpdate({_id, customerId, status:'pending'})`** (#10), **re-snapshot toàn bộ items theo giá hiện hành** + tính lại tổng tiền (#16); không khớp → 409 `ORDER_NOT_EDITABLE`.
  - `DELETE /api/orders/:id` (FR-ORD-04) — atomic theo điều kiện `{_id, customerId, status:'pending'}` (#10); sau đó `syncTableStatus`; không khớp → 409.
- [ ] `validators/orderValidator.js`.

**Tiêu chí hoàn thành:** khách tạo đơn → tổng tiền do backend tính; sửa/xóa chỉ khi pending; orderCode không trùng.

---

## PHASE 7 — Xử lý đơn phía Nhân viên (FR-STAFF, SRS 7.3 👮)
**Mục tiêu:** state machine + xác nhận/cập nhật/hủy/thanh toán + cộng soldCount.

- [ ] Bảng chuyển trạng thái hợp lệ **(chốt #9 — theo bảng SRS, chặt):**
  - pending → confirmed | cancelled
  - confirmed → preparing | cancelled
  - preparing → ready *(không cho hủy)*
  - ready → completed
  - completed/cancelled = trạng thái kết thúc.
  - Bước nhảy sai → 409 (`INVALID_STATUS_TRANSITION`).
- [ ] `orderController` (👮):
  - `GET /api/orders` (FR-STAFF-01) — tất cả đơn, lọc status/tableId/khoảng ngày, phân trang, sort mới nhất.
  - `PATCH /api/orders/:id/confirm` (FR-STAFF-02) — **atomic `findOneAndUpdate({_id, status:'pending'})`** (#10) → confirmed, ghi confirmedBy/confirmedAt + statusHistory; **nhận `discountAmount` optional, validate `0 ≤ discount ≤ subtotal`, tính lại totalAmount** (#5).
  - `PATCH /api/orders/:id/status` (FR-STAFF-03) — chuyển theo state machine; khi →completed: set completedAt + **cộng `soldCount` exactly-once trong chính bước atomic (điều kiện `status != 'completed'`)** (#11); gọi `syncTableStatus` (#18).
  - `PATCH /api/orders/:id/cancel` (FR-STAFF-04) — chỉ từ `{pending,confirmed}` (#9); set cancelled + cancelReason + statusHistory; **nếu đơn đang `paid` → set `paymentStatus='refunded'`** (#4); gọi `syncTableStatus` (#18).
  - `PATCH /api/orders/:id/payment` (FR-STAFF-05) — paymentStatus(unpaid→paid) + paymentMethod. **Không bắt buộc paid trước completed** (#4).
- [ ] **Transaction (Mongoose session)** cho bước completed (order + soldCount) đảm bảo nhất quán. *Local standalone không có replica set → fallback cập nhật tuần tự có guard atomic (#11).*

**Tiêu chí hoàn thành:** luồng pending→...→completed hợp lệ; bước sai bị chặn 409; soldCount cộng đúng khi completed.

---

## PHASE 8 — Thống kê (FR-DASH, SRS 7.4 👮)
**Mục tiêu:** dashboard tổng quan & món bán chạy.

- [ ] `dashboardService` + `dashboardController` (👮):
  - `GET /api/dashboard/summary` (FR-DASH-01) — **#8: doanh thu = Σ `totalAmount` đơn `completed`, gom theo ngày của `completedAt`** (hôm nay/tuần); số đơn theo status đếm toàn bộ; số đơn hôm nay.
  - `GET /api/dashboard/top-products` (FR-DASH-02) — **#12: aggregate từ `items` của đơn `completed` làm nguồn chân lý** (không phụ thuộc `soldCount`).
- [ ] `routes/dashboardRoutes.js`.

**Tiêu chí hoàn thành:** trả số liệu đúng với dữ liệu seed.

---

## PHASE 9 — Seed, kiểm thử & tài liệu hóa
**Mục tiêu:** dữ liệu mẫu + bộ test thủ công + tài liệu API.

- [ ] `seeds/seed.js` — tạo: 1 admin, 1 staff, vài customer; categories; products (có options); tables. Script `npm run seed`.
- [ ] Bộ kiểm thử thủ công: file REST Client (`api.http`) hoặc Postman collection cho toàn bộ endpoint.
- [ ] Rà soát ma trận RBAC (SRS mục 3) khớp với các route.
- [ ] Cập nhật `backend/README.md`: cách chạy, biến môi trường, danh sách endpoint.
- [ ] Rà soát NFR: không lộ passwordHash, status code đúng, phân trang cho list lớn, index đầy đủ.

**Tiêu chí hoàn thành:** seed chạy được; toàn bộ endpoint test pass theo đúng phân quyền & nghiệp vụ SRS.

---

## Bảng đối chiếu API ↔ Phase (SRS mục 7)

| Endpoint | Quyền | Phase |
|---|---|---|
| POST /api/auth/register, /login | Công khai | 3 |
| GET/PUT /api/users/me | 🔒 | 3 |
| GET /api/users · PATCH /api/users/:id/status | 👮 Admin | 3 |
| GET /api/categories | Công khai | 4 |
| POST/PUT/DELETE /api/categories | 👮 | 4 |
| GET /api/products · GET /api/products/:id | Công khai | 4 |
| POST/PUT/DELETE /api/products | 👮 | 4 |
| GET /api/tables | 🔒 | 5 |
| POST/PUT/DELETE /api/tables | 👮 | 5 |
| POST /api/orders | 🔒 | 6 |
| GET /api/orders/my · GET/PUT/DELETE /api/orders/:id | 🔒 | 6 |
| GET /api/orders | 👮 | 7 |
| PATCH /api/orders/:id/confirm · /status · /cancel · /payment | 👮 | 7 |
| GET /api/dashboard/summary · /top-products | 👮 | 8 |

---

## Quyết định kỹ thuật đã chốt
1. **Validation lib:** `express-validator`.
2. **Ảnh:** lưu **link ảnh (URL string)** trong `imageUrl`, không upload file / không dùng dịch vụ lưu trữ bên thứ ba (chốt theo yêu cầu).
3. **bcrypt:** `bcryptjs` (thuần JS, không cần build native).
4. **Transaction:** ưu tiên atomic conditional update; dùng session khi có replica set, fallback tuần tự khi local standalone.
5. **Thứ tự thực hiện:** tuần tự Phase 1 → 9.

## Danh sách errorCode dùng chung (response chuẩn SRS 7.5)
`VALIDATION_ERROR` (422) · `UNAUTHORIZED` (401) · `ACCOUNT_LOCKED` (401) · `FORBIDDEN` (403) · `NOT_FOUND` (404) · `EMAIL_TAKEN` (409) · `LAST_ADMIN` (409) · `PRODUCT_UNAVAILABLE` (409) · `ORDER_NOT_EDITABLE` (409) · `INVALID_STATUS_TRANSITION` (409) · `TABLE_INACTIVE` (409) · `INTERNAL_ERROR` (500).
