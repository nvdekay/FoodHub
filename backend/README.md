# FoodHub Backend

REST API cho hệ thống quản lý đặt đồ ăn & đồ uống (dine-in). Stack: **Node.js + Express + MongoDB (Mongoose)**, ESM, JWT + bcrypt.

> Tài liệu nghiệp vụ: `../docs/SRS_QuanLyDatMon.md` · Thiết kế DB: `../docs/db.md` · Kế hoạch: `../docs/plan.md`

## Yêu cầu

- Node.js 18+ (đã test trên Node 24)
- MongoDB chạy local (mặc định `mongodb://127.0.0.1:27017/foodhub`)

## Cài đặt & chạy

```bash
cd backend
npm install
cp .env.example .env     # chỉnh JWT_SECRET nếu cần
npm run seed             # đổ dữ liệu mẫu (tài khoản, menu, bàn)
npm run dev              # chạy ở http://localhost:5050 (nodemon)
# hoặc: npm start
```

### Biến môi trường (`.env`)

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `PORT` | 5050 | Cổng server |
| `MONGODB_URI` | mongodb://127.0.0.1:27017/foodhub | Chuỗi kết nối MongoDB |
| `CLIENT_URL` | http://localhost:5173 | Origin cho phép CORS |
| `JWT_SECRET` | — | Khoá ký JWT (đổi khi deploy) |
| `JWT_EXPIRES_IN` | 7d | Hạn token |
| `BCRYPT_SALT_ROUNDS` | 10 | Số vòng hash bcrypt |

### Tài khoản mẫu (sau `npm run seed`)

Mật khẩu chung: `123456`
- `admin@foodhub.com` — admin
- `staff@foodhub.com` — staff
- `customer@foodhub.com` — customer

## Kiến trúc

```
src/
├── config/         # kết nối DB
├── models/         # 6 schema: User, Category, Product, Table, Order, Counter
├── services/       # nghiệp vụ (Controller gọi Service gọi Model)
├── controllers/    # nhận request, trả response chuẩn
├── routes/         # định nghĩa endpoint + gắn middleware
├── middlewares/    # auth (JWT), rbac, validate, errorHandler
├── validators/     # rule express-validator
├── utils/          # ApiError, response, asyncHandler, jwt, slugify, generateOrderCode
└── seeds/          # seed.js
```

**Quy ước response** (đồng nhất):
```jsonc
// thành công
{ "success": true, "message": "...", "data": { } }
// danh sách phân trang
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 } }
// lỗi
{ "success": false, "message": "...", "errorCode": "ORDER_NOT_EDITABLE" }
```

`🔒` cần đăng nhập · `👮` cần role staff/admin · `👑` chỉ admin.

## Danh sách API (31 endpoint)

### Auth & User
| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/api/auth/register` | công khai |
| POST | `/api/auth/login` | công khai |
| GET | `/api/users/me` | 🔒 |
| PUT | `/api/users/me` | 🔒 |
| GET | `/api/users` | 👑 |
| PATCH | `/api/users/:id/status` | 👑 |

### Category & Product
| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/api/categories` | công khai |
| POST/PUT/DELETE | `/api/categories[/:id]` | 👮 |
| GET | `/api/products` · `/api/products/:id` | công khai |
| POST/PUT/DELETE | `/api/products[/:id]` | 👮 |

### Table
| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/api/tables` | 🔒 |
| POST/PUT/DELETE | `/api/tables[/:id]` | 👮 |

### Order
| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/api/orders` | 🔒 |
| GET | `/api/orders/my` | 🔒 |
| GET | `/api/orders/:id` | 🔒 (chủ đơn hoặc 👮) |
| PUT | `/api/orders/:id` | 🔒 (chủ đơn, pending) |
| DELETE | `/api/orders/:id` | 🔒 (chủ đơn, pending) |
| GET | `/api/orders` | 👮 |
| PATCH | `/api/orders/:id/confirm` | 👮 |
| PATCH | `/api/orders/:id/status` | 👮 |
| PATCH | `/api/orders/:id/cancel` | 👮 |
| PATCH | `/api/orders/:id/payment` | 👮 |

### Dashboard
| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/api/dashboard/summary` | 👮 |
| GET | `/api/dashboard/top-products` | 👮 |

> Thử nhanh tất cả endpoint: mở `api.http` bằng extension **REST Client** (VS Code).

## Quy tắc nghiệp vụ cốt lõi

- **Tính tiền ở backend** — không tin số tiền client gửi; `priceModifier` lấy từ DB.
- **Snapshot bất biến** — đơn lưu `name`/`unitPrice`/options lúc đặt; đổi giá menu không ảnh hưởng đơn cũ.
- **State machine đơn** — pending → confirmed → preparing → ready → completed; huỷ chỉ ở pending/confirmed; bước sai trả 409.
- **Quyền sửa/huỷ đơn (khách)** — chỉ chủ đơn & khi pending (cập nhật atomic).
- **Trạng thái bàn tự đồng bộ** — occupied khi còn đơn active, available khi hết (reserved đặt thủ công).
- **soldCount cộng exactly-once** khi đơn completed; **doanh thu** tính trên đơn completed theo `completedAt`.
- **Soft delete** — ẩn (`isActive`/`isAvailable=false`) thay vì xoá cứng để giữ lịch sử.
- **Ảnh** — lưu bằng **link URL** (`imageUrl`), không upload file.
