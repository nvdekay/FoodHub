# FoodHub — Tóm tắt trình bày nhanh

> Bản rút gọn 1–2 trang. Chi tiết đầy đủ xem `FoodHub-Tai-Lieu-Kien-Truc.md`.

## Hệ thống là gì
Ứng dụng **đặt món tại quán** (cà phê/trà sữa/món ăn) với 3 vai trò:
- **Khách** (`customer`): xem menu, đặt món, theo dõi/sửa/huỷ đơn của mình khi còn chờ.
- **Nhân viên** (`staff`): quản lý menu/bàn, xử lý đơn (xác nhận → làm → xong → thu tiền), xem thống kê.
- **Quản trị** (`admin`): mọi quyền staff + quản lý tài khoản.

## Công nghệ
- **DB:** MongoDB + Mongoose.
- **Backend:** Node/Express, JWT, bcrypt, express-validator, helmet, rate-limit.
- **Frontend:** React 19, Vite, TanStack Query, React Hook Form + Zod, Tailwind, Axios.

## Kiến trúc (3 lớp)
```
FRONTEND  Component → Hook (TanStack Query) → api → axiosClient
                                  │ HTTP + JWT
BACKEND   Route → Middleware (auth/RBAC/validate) → Controller → Service → Model
                                                                     │
DATABASE                                                          MongoDB
```
- **Controller** điều phối; **Service** chứa nghiệp vụ; **Model** là schema.

## Database (6 collection)
`users` · `categories` · `products` (tuỳ chọn nhúng) · `tables` · **`orders`** (trọng tâm) · `counters` (sinh mã đơn).
**Điểm cốt lõi:** đơn lưu **snapshot** (tên/giá/tuỳ chọn lúc đặt) → sửa menu không làm sai đơn cũ.

## Luồng chính: khách đặt món
```
Menu → chọn món + tuỳ chọn → giỏ → /cart (chọn bàn) → POST /api/orders
   BE: kiểm tra bàn → tính tiền LẠI ở server → tạo orderCode → lưu đơn (pending) → bàn = occupied
   FE: xoá giỏ → theo dõi đơn (/orders/:id, tự cập nhật mỗi 15s)
```

## Vòng đời trạng thái đơn
```
pending → confirmed → preparing → ready → completed       (huỷ: cancelled)
 (khách)   (NV xác    (NV làm)    (xong)  (NV hoàn tất:
            nhận)                          +soldCount, bàn→available)
```

## 5 điểm thiết kế đáng nhớ (hay bị hỏi)
1. **Tính tiền ở backend** (lấy giá từ DB) → chống client gian lận giá.
2. **Snapshot đơn** → sửa menu không ảnh hưởng đơn đã đặt.
3. **Cập nhật atomic có điều kiện** (`findOneAndUpdate` theo trạng thái nguồn) → chống 2 người sửa 1 đơn cùng lúc, không cần transaction.
4. **JWT chỉ mang `userId`**, role nạp tươi từ DB mỗi request → khoá/giáng quyền có hiệu lực ngay.
5. **Đồng bộ trạng thái bàn** bằng đếm số đơn đang phục vụ (reference counting).

## API (31 endpoint, tiền tố `/api`)
Auth (2) · Users (4) · Categories (4) · Products (5) · Tables (4) · **Orders (10)** · Dashboard (2).
Quyền: 🔓 công khai · 🔒 đăng nhập · 👮 staff/admin · 👑 admin.

## Đã cải tiến (đợt review)
Đồng bộ cache đơn 2 chiều · clamp giảm giá · tìm kiếm server-side + infinite scroll menu · poll theo dõi đơn · đồng bộ giá giỏ · 401 đăng xuất mềm · đồng bộ đa tab · bắt buộc lý do huỷ · lọc ngày đúng timezone · và nhiều fix nhỏ khác (xem phụ lục tài liệu đầy đủ).
