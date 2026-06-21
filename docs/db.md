# GIẢI THÍCH CƠ SỞ DỮ LIỆU — FoodHub

> Tài liệu này giải thích **dễ hiểu** về database MongoDB của hệ thống: có những bảng (collection) nào, mỗi bảng chứa field gì và để làm gì. Đọc xong bạn sẽ nắm được toàn bộ cách dữ liệu được tổ chức.
>
> - **Database:** `foodhub` (MongoDB local — `mongodb://127.0.0.1:27017/foodhub`)
> - **Mở bằng:** MongoDB Compass → kết nối `mongodb://127.0.0.1:27017` → chọn DB `foodhub`.

---

## 0. Vài khái niệm cần biết trước (MongoDB cho người mới)

MongoDB là CSDL **dạng document** (không phải bảng dòng/cột như SQL). So sánh nhanh:

| SQL (quan hệ) | MongoDB | Ở dự án này |
| :---- | :---- | :---- |
| Bảng (table) | **Collection** | `users`, `products`, `orders`... |
| Dòng (row) | **Document** (1 object JSON) | 1 người dùng, 1 đơn hàng |
| Cột (column) | **Field** | `email`, `price`... |
| Khoá chính | **`_id`** (ObjectId, tự sinh) | mọi document đều có |
| Khoá ngoại | **Reference** (lưu `_id` của document khác) | `order.customerId` trỏ tới `users` |

Hai cách lưu dữ liệu liên quan — **điểm quan trọng nhất cần hiểu**:

1. **Tham chiếu (Reference):** lưu `_id` của document khác, giống khoá ngoại. Dùng khi dữ liệu **dùng chung, thay đổi độc lập**.
   *Ví dụ:* đơn hàng lưu `customerId` trỏ tới user, thay vì chép cả hồ sơ khách vào đơn.

2. **Nhúng (Embedding):** đặt dữ liệu con **nằm gọn bên trong** document cha. Dùng khi dữ liệu con **chỉ thuộc về cha** và luôn đọc cùng nhau.
   *Ví dụ:* các tuỳ chọn (size, topping) nằm ngay trong document món.

3. **Snapshot (ảnh chụp):** một dạng nhúng đặc biệt — **chép lại dữ liệu tại một thời điểm** để nó **không đổi** dù nguồn gốc đổi sau này.
   *Ví dụ:* đơn hàng chép tên + giá món lúc đặt. Sau này quán đổi giá, đơn cũ vẫn giữ giá lúc mua → hoá đơn không bị sai.

> 🔑 **Quy tắc vàng của hệ thống:** Đơn hàng (`orders`) **nhúng snapshot** các món để giữ đúng lịch sử, nhưng **vẫn giữ `productId` tham chiếu** để truy vết & thống kê. Đây là thiết kế cốt lõi.

---

## 1. Tổng quan 6 collection

| # | Collection | Lưu cái gì | Ghi chú |
| :---- | :---- | :---- | :---- |
| 1 | **users** | Tài khoản (khách, nhân viên, quản trị) | Phân biệt bằng `role` |
| 2 | **categories** | Danh mục thực đơn (Cà phê, Trà sữa...) | Nhóm các món |
| 3 | **products** | Món ăn/đồ uống + tuỳ chọn | Tuỳ chọn được **nhúng** |
| 4 | **tables** | Bàn trong cửa hàng | Mỗi đơn gắn 1 bàn |
| 5 | **orders** | Đơn đặt món | **Trọng tâm** — nhúng snapshot món |
| 6 | **counters** | Bộ đếm sinh mã đơn tự tăng | Kỹ thuật, sinh `orderCode` |

**Sơ đồ quan hệ (đơn giản hoá):**

```
 categories ──(1 danh mục có nhiều món)──< products
                                            │ (productId, snapshot)
 users ──(1 khách có nhiều đơn)──< orders >─┘
                                    │
                                    └──(mỗi đơn 1 bàn)──> tables

 orders nhúng bên trong: items[] (các món đã đặt) + statusHistory[] (lịch sử trạng thái)
 counters: sinh mã orderCode duy nhất
```

---

## 2. Collection `users` — Người dùng

**Mục đích:** lưu mọi tài khoản. Một bảng chung cho cả khách hàng lẫn nhân viên/quản trị, phân biệt bằng `role` → đơn giản hoá đăng nhập & phân quyền.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | ObjectId | tự sinh | Khoá chính. |
| `fullName` | String | ✅ | Họ tên đầy đủ, để hiển thị & in trên đơn. |
| `email` | String | ✅ | Email đăng nhập. **Duy nhất**, lưu chữ thường, đúng định dạng. |
| `phone` | String | ✅ | SĐT liên hệ. Dùng **String** để giữ số 0 ở đầu. |
| `passwordHash` | String | ✅ | Mật khẩu đã **mã hoá bcrypt**. **Không bao giờ** trả về API (`select:false`). |
| `role` | String (enum) | ✅ | Vai trò: `customer` / `staff` / `admin`. Mặc định `customer`. Quyết định quyền. |
| `avatarUrl` | String | ❌ | Ảnh đại diện (có thể null). |
| `isActive` | Boolean | ✅ | Tài khoản còn hoạt động? Mặc định `true`. Admin **khoá** = đặt `false` (không xoá). |
| `lastLoginAt` | Date | ❌ | Lần đăng nhập gần nhất (theo dõi/bảo mật). |
| `createdAt` / `updatedAt` | Date | tự sinh | Thời điểm tạo / cập nhật (Mongoose tự thêm). |

**Index (tăng tốc tìm kiếm):** `email` (duy nhất), `role` (lọc nhân viên/khách), `phone`.

**Vì sao thiết kế vậy?**
- `passwordHash` ẩn mặc định → tránh vô tình lộ mật khẩu qua API.
- Khoá mềm bằng `isActive` thay vì xoá → giữ lịch sử đơn của khách đó.

---

## 3. Collection `categories` — Danh mục thực đơn

**Mục đích:** nhóm các món theo loại (Cà phê, Trà sữa, Đồ ăn vặt...) để khách dễ duyệt.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | ObjectId | tự sinh | Khoá chính. |
| `name` | String | ✅ | Tên danh mục hiển thị. **Duy nhất**. VD: "Trà sữa". |
| `slug` | String | ✅ | Chuỗi thân thiện URL, **duy nhất**. VD: `tra-sua`. Tự sinh từ `name`. |
| `description` | String | ❌ | Mô tả ngắn. |
| `imageUrl` | String | ❌ | Ảnh/icon danh mục. |
| `displayOrder` | Number | ❌ | Thứ tự hiển thị (số nhỏ lên trước). Mặc định `0`. |
| `isActive` | Boolean | ✅ | Còn hiển thị? Mặc định `true`. Ẩn = đặt `false`. |
| `createdAt` / `updatedAt` | Date | tự sinh | Thời điểm tạo / cập nhật. |

**Index:** `slug` (duy nhất), `isActive`, `displayOrder`.

**Vì sao?** `slug` để URL đẹp & ổn định; `displayOrder` để quán tự sắp thứ tự menu; ẩn bằng `isActive` để không phá vỡ món đang thuộc danh mục.

---

## 4. Collection `products` — Món ăn / Đồ uống

**Mục đích:** lưu từng món. Mỗi món **thuộc 1 danh mục** (tham chiếu `categoryId`) và có thể có nhiều **nhóm tuỳ chọn** (size, topping...) được **nhúng** trực tiếp.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | ObjectId | tự sinh | Khoá chính. |
| `name` | String | ✅ | Tên món. VD: "Trà sữa trân châu đường đen". |
| `slug` | String | ✅ | URL thân thiện, **duy nhất**. |
| `description` | String | ❌ | Mô tả chi tiết. |
| `categoryId` | ObjectId → `categories` | ✅ | **Tham chiếu** danh mục chứa món. Cho phép `populate` khi truy vấn. |
| `basePrice` | Number | ✅ | **Giá gốc** (VND, số nguyên, ≥ 0). Chưa cộng phụ phí tuỳ chọn. |
| `imageUrl` | String | ❌ | Ảnh món. |
| `options` | Array<Object> | ❌ | **Nhúng** các nhóm tuỳ chọn (xem bảng dưới). Mặc định `[]`. |
| `isAvailable` | Boolean | ✅ | Còn bán? Mặc định `true`. Hết hàng = `false` (ưu tiên hơn xoá). |
| `isFeatured` | Boolean | ❌ | Món nổi bật để ưu tiên hiển thị. Mặc định `false`. |
| `preparationTime` | Number | ❌ | Thời gian chế biến ước tính (phút). |
| `soldCount` | Number | ❌ | Tổng số lượng đã bán (cộng dồn khi đơn hoàn thành). Phục vụ "món bán chạy". Mặc định `0`. |
| `createdAt` / `updatedAt` | Date | tự sinh | Thời điểm tạo / cập nhật. |

**Cấu trúc 1 nhóm tuỳ chọn trong `options[]` (nhúng):**

| Field | Kiểu | Để làm gì |
| :---- | :---- | :---- |
| `options[].name` | String | Tên nhóm. VD: "Size", "Topping", "Mức đường". |
| `options[].type` | String (enum) | `single` (chọn 1) hoặc `multiple` (chọn nhiều). |
| `options[].required` | Boolean | Bắt buộc chọn? VD: Size = bắt buộc. |
| `options[].choices[]` | Array<Object> | Danh sách lựa chọn trong nhóm. |
| `...choices[].label` | String | Tên lựa chọn. VD: "Size L", "Trân châu". |
| `...choices[].priceModifier` | Number | Phụ phí cộng thêm (VND, ≥ 0). VD: Size L = +5000. |

**Index:** `categoryId`, `slug` (duy nhất), `isAvailable`, **text index trên `name`** (để tìm kiếm theo tên).

**Vì sao nhúng `options`?** Tuỳ chọn **chỉ thuộc về món đó** và luôn đọc kèm món → nhúng giúp 1 lần truy vấn lấy đủ. **Vì sao có `soldCount`?** Để truy vấn "món bán chạy" nhanh mà không phải quét toàn bộ đơn (đây là bộ đệm; số liệu chuẩn vẫn tính lại từ đơn `completed`).

**Ví dụ 1 document:**
```json
{
  "name": "Trà sữa trân châu đường đen",
  "slug": "tra-sua-tran-chau-duong-den",
  "categoryId": "664f02...",
  "basePrice": 30000,
  "options": [
    { "name": "Size", "type": "single", "required": true,
      "choices": [ { "label": "M", "priceModifier": 0 }, { "label": "L", "priceModifier": 5000 } ] },
    { "name": "Topping", "type": "multiple", "required": false,
      "choices": [ { "label": "Trân châu", "priceModifier": 5000 } ] }
  ],
  "isAvailable": true,
  "soldCount": 124
}
```

---

## 5. Collection `tables` — Bàn trong cửa hàng

**Mục đích:** quản lý các bàn phục vụ. Mỗi đơn gắn với 1 bàn. Có thể gắn QR để khách quét vào menu của bàn.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | ObjectId | tự sinh | Khoá chính. |
| `tableNumber` | String | ✅ | Tên/số bàn. **Duy nhất**. VD: "B01", "Bàn 5". |
| `capacity` | Number | ❌ | Số chỗ ngồi tối đa. |
| `status` | String (enum) | ✅ | `available` / `occupied` / `reserved`. Mặc định `available`. |
| `qrCodeUrl` | String | ❌ | Ảnh mã QR của bàn (nếu dùng đặt qua QR). |
| `isActive` | Boolean | ✅ | Bàn còn dùng? Mặc định `true`. |
| `createdAt` / `updatedAt` | Date | tự sinh | Thời điểm tạo / cập nhật. |

**Index:** `tableNumber` (duy nhất), `status`.

**Logic trạng thái (quan trọng):** Hệ thống **tự đồng bộ** `occupied`/`available` theo số đơn đang hoạt động trên bàn:
- Còn ≥ 1 đơn ở trạng thái `pending/confirmed/preparing/ready` → bàn `occupied`.
- Không còn đơn hoạt động nào → bàn về `available`.
- `reserved` do nhân viên đặt **thủ công** (nằm ngoài luồng tự động).
> Nhờ đó, 1 bàn có nhiều đơn cùng lúc vẫn không bị "trả bàn" nhầm.

---

## 6. Collection `orders` — Đơn đặt món (TRỌNG TÂM)

**Mục đích:** ghi nhận đầy đủ một lần đặt món: **ai đặt, bàn nào, món gì, bao nhiêu tiền, trạng thái xử lý & thanh toán**. Các món (`items`) và lịch sử trạng thái (`statusHistory`) được **nhúng** để bảo toàn dữ liệu.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | ObjectId | tự sinh | Khoá chính. |
| `orderCode` | String | ✅ | Mã đơn dễ đọc, **duy nhất**. VD: `ORD-20260621-0001`. Sinh từ `counters`. |
| `customerId` | ObjectId → `users` | ✅ | **Tham chiếu** khách đặt. Dùng để kiểm tra quyền sửa/xoá đơn. |
| `customerInfo` | Object (nhúng) | ✅ | **Snapshot** `{ fullName, phone }` lúc đặt — phòng khi hồ sơ đổi sau này. |
| `tableId` | ObjectId → `tables` | ✅ | **Tham chiếu** bàn phục vụ. |
| `tableNumber` | String | ✅ | **Snapshot** số bàn để hiển thị nhanh, khỏi `populate`. |
| `items` | Array<Object> | ✅ | Danh sách món (**nhúng snapshot**, ≥ 1 phần tử). Xem bảng dưới. |
| `subtotal` | Number | ✅ | Tổng tiền các món = Σ `itemTotal` (VND). |
| `discountAmount` | Number | ❌ | Giảm giá (NV/Admin áp khi xác nhận). Mặc định `0`. Ràng buộc `0 ≤ discount ≤ subtotal`. |
| `totalAmount` | Number | ✅ | Thành tiền cuối = `subtotal − discountAmount` (VND). |
| `status` | String (enum) | ✅ | `pending`/`confirmed`/`preparing`/`ready`/`completed`/`cancelled`. Mặc định `pending`. |
| `paymentStatus` | String (enum) | ✅ | `unpaid`/`paid`/`refunded`. Mặc định `unpaid`. Huỷ đơn đã `paid` → `refunded`. |
| `paymentMethod` | String (enum) | ❌ | `cash`/`card`/`ewallet`. Ghi khi thanh toán. |
| `note` | String | ❌ | Ghi chú chung cho đơn. |
| `cancelReason` | String | ❌ | Lý do huỷ (khi `status = cancelled`). |
| `confirmedBy` | ObjectId → `users` | ❌ | Nhân viên đã xác nhận. Null khi chưa xác nhận. |
| `confirmedAt` | Date | ❌ | Thời điểm xác nhận. |
| `completedAt` | Date | ❌ | Thời điểm hoàn tất. |
| `statusHistory` | Array<Object> | ❌ | **Nhúng** lịch sử đổi trạng thái. Xem bảng dưới. |
| `createdAt` / `updatedAt` | Date | tự sinh | Thời điểm tạo / cập nhật. |

**Cấu trúc 1 món trong `items[]` (NHÚNG SNAPSHOT — quan trọng nhất):**

| Field | Kiểu | Để làm gì |
| :---- | :---- | :---- |
| `items[].productId` | ObjectId → `products` | **Tham chiếu** món gốc — để truy vết & cộng `soldCount`/thống kê. |
| `items[].name` | String | **Snapshot** tên món lúc đặt (không đổi khi món đổi tên). |
| `items[].unitPrice` | Number | **Snapshot** giá gốc lúc đặt. **Bất biến** với thay đổi menu. |
| `items[].quantity` | Number | Số lượng (số nguyên ≥ 1). |
| `items[].selectedOptions[]` | Array<Object> | Tuỳ chọn đã chọn: `{ groupName, choiceLabel, priceModifier }`. |
| `items[].itemTotal` | Number | Thành tiền dòng = `(unitPrice + Σ priceModifier) × quantity`. |
| `items[].note` | String | Ghi chú riêng cho món. VD: "ít đá", "không đường". |

**Cấu trúc 1 phần tử `statusHistory[]`:**

| Field | Kiểu | Để làm gì |
| :---- | :---- | :---- |
| `statusHistory[].status` | String | Trạng thái tại bước này. |
| `statusHistory[].changedBy` | ObjectId → `users` | Ai thực hiện (khách hoặc nhân viên). |
| `statusHistory[].changedAt` | Date | Thời điểm chuyển. |
| `statusHistory[].note` | String | Ghi chú (vd: lý do huỷ). |

**Index:** `orderCode` (duy nhất), `customerId`, `status`, `tableId`, `createdAt` (giảm dần — liệt kê đơn mới nhất trước).

**Vì sao lưu snapshot món thay vì chỉ tham chiếu?**
Nếu chỉ lưu `productId` rồi tra giá hiện tại, khi quán đổi giá/đổi tên, **hoá đơn cũ sẽ sai**. Snapshot chép `name` + `unitPrice` + tuỳ chọn lúc đặt → đơn cũ **luôn đúng**. Vẫn giữ `productId` để biết món gốc là gì (thống kê, cộng `soldCount`).

**Vòng đời trạng thái (state machine):**
```
pending ──xác nhận(NV)──▶ confirmed ──▶ preparing ──▶ ready ──▶ completed
   │                          │
   │ khách sửa/xoá (chỉ pending)│ NV huỷ
   └──────────────┬───────────┘
                  ▼
              cancelled
```
- Chỉ cho **huỷ** ở `pending`/`confirmed`. Vào `preparing` rồi phải đi tiếp.
- Khách chỉ **sửa/xoá** khi đơn còn `pending` và là đơn của chính mình.
- Khi vào `completed`: cộng `soldCount` cho từng món (đúng 1 lần) + đặt `completedAt`.

**Ví dụ rút gọn 1 document:**
```json
{
  "orderCode": "ORD-20260621-0007",
  "customerId": "6650a1...",
  "customerInfo": { "fullName": "Nguyễn Văn A", "phone": "0912345678" },
  "tableId": "6655c0...", "tableNumber": "B05",
  "items": [
    { "productId": "66510b...", "name": "Trà sữa trân châu đường đen",
      "unitPrice": 30000, "quantity": 2,
      "selectedOptions": [
        { "groupName": "Size", "choiceLabel": "L", "priceModifier": 5000 },
        { "groupName": "Topping", "choiceLabel": "Trân châu", "priceModifier": 5000 }
      ],
      "itemTotal": 80000, "note": "Ít đá" }
  ],
  "subtotal": 80000, "discountAmount": 0, "totalAmount": 80000,
  "status": "confirmed", "paymentStatus": "unpaid",
  "confirmedBy": "6651ff...", "confirmedAt": "2026-06-21T03:20:00Z",
  "statusHistory": [
    { "status": "pending",   "changedBy": "6650a1...", "changedAt": "2026-06-21T03:18:00Z" },
    { "status": "confirmed", "changedBy": "6651ff...", "changedAt": "2026-06-21T03:20:00Z" }
  ]
}
```

---

## 7. Collection `counters` — Bộ đếm sinh mã đơn

**Mục đích:** sinh số thứ tự **tự tăng an toàn** (atomic) cho `orderCode`, tránh trùng mã khi nhiều đơn tạo cùng lúc. Mỗi ngày có 1 document đếm riêng.

| Field | Kiểu | Bắt buộc | Để làm gì |
| :---- | :---- | :---- | :---- |
| `_id` | String | ✅ | Khoá định danh bộ đếm. VD: `order-20260621` (theo ngày). |
| `seq` | Number | ✅ | Giá trị đếm hiện tại, tăng mỗi lần sinh mã. Bắt đầu từ `0`. |

**Cách hoạt động (atomic — không trùng dù tải cao):**
```js
const key = `order-${yyyymmdd}`;
const c = await Counter.findOneAndUpdate(
  { _id: key },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }   // chưa có thì tạo mới
);
const orderCode = `ORD-${yyyymmdd}-${String(c.seq).padStart(4, "0")}`;
// => ORD-20260621-0007
```
**Vì sao cần?** Hai khách bấm tạo đơn cùng lúc, `findOneAndUpdate + $inc` đảm bảo mỗi người nhận một số khác nhau → mã đơn luôn duy nhất.

---

## 8. Tóm tắt chiến lược thiết kế

| Quan hệ | Loại | Chiến lược | Lý do |
| :---- | :---- | :---- | :---- |
| products → categories | N–1 | Tham chiếu (`categoryId`) | Danh mục dùng chung, đổi độc lập. |
| product.options | 1–N | Nhúng | Tuỳ chọn chỉ thuộc món, luôn đọc kèm. |
| orders → users | N–1 | Tham chiếu (`customerId`) | Khách dùng cho nhiều đơn. |
| orders → tables | N–1 | Tham chiếu (`tableId`) | Bàn dùng lại nhiều lần. |
| order.items → products | N–1 | **Nhúng snapshot + ref `productId`** | Giữ đúng giá/tên lúc đặt, vẫn truy vết được món. |
| order.statusHistory | 1–N | Nhúng | Lịch sử chỉ thuộc đơn đó. |

**3 nguyên tắc xuyên suốt:**
1. **Snapshot để bất biến:** đơn không bị ảnh hưởng khi menu đổi.
2. **Soft delete:** ẩn (`isActive`/`isAvailable = false`) thay vì xoá → giữ toàn vẹn lịch sử.
3. **Tiền tính ở Backend:** không tin số tiền client gửi, server tự tính lại từ giá thật trong DB.
