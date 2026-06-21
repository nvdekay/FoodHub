**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*Software Requirements Specification (SRS)*

**HỆ THỐNG QUẢN LÝ ĐẶT ĐỒ ĂN & ĐỒ UỐNG**

*Food & Drink Ordering Management System*

Dành cho cửa hàng — Vai trò Khách hàng (User) & Nhân viên (Admin)

Công nghệ: MERN Stack (MongoDB · Express.js · React · Node.js)

| Tài liệu | Software Requirements Specification (SRS) |
| :---- | :---- |
| **Phiên bản** | 1.0 |
| **Vai trò biên soạn** | Business Analyst |
| **Đối tượng đọc** | Backend Developer, Frontend Developer, Giảng viên |
| **Cơ sở dữ liệu** | MongoDB (NoSQL — Document) |
| **Ngày phát hành** | 21/06/2026 |

# **Mục lục**

# **Lịch sử phiên bản**

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
| :---- | :---- | :---- | :---- |
| 1.0 | 21/06/2026 | Business Analyst | Khởi tạo tài liệu SRS đầy đủ: nghiệp vụ, yêu cầu chức năng, thiết kế CSDL chi tiết, API. |
| 1.1 | 21/06/2026 | Dev Team | Đồng bộ luồng nghiệp vụ FE–BE sau review: làm rõ trạng thái bàn, thanh toán/hoàn tiền, giảm giá, state machine, race condition, bảo mật JWT, định nghĩa doanh thu. Bổ sung mục 8.5. |

# **1\. Giới thiệu**

## **1.1. Mục đích tài liệu**

Tài liệu này đặc tả đầy đủ các yêu cầu của hệ thống Quản lý đặt đồ ăn & đồ uống cho một cửa hàng. Mục tiêu là cung cấp một bản mô tả chi tiết, rõ ràng để:

* Lập trình viên Backend hiểu chính xác cần xây dựng những API, nghiệp vụ và thiết kế cơ sở dữ liệu như thế nào.

* Lập trình viên Frontend nắm được các luồng người dùng, dữ liệu trao đổi và trạng thái của hệ thống.

* Giảng viên / người đánh giá nhìn thấy phạm vi, nghiệp vụ và mức độ hoàn chỉnh của dự án.

Tài liệu đặc biệt đầu tư vào phần thiết kế cơ sở dữ liệu MongoDB (Phần 6), giải thích chi tiết từng collection, từng trường dữ liệu, kiểu dữ liệu, ràng buộc và lý do thiết kế.

## **1.2. Phạm vi hệ thống**

Hệ thống là một ứng dụng web cho phép khách hàng khi đến cửa hàng có thể tự đặt đồ ăn, đồ uống; đồng thời cho phép nhân viên cửa hàng tiếp nhận, xác minh và xử lý đơn hàng cũng như quản lý thực đơn (menu). Phạm vi bao gồm:

* **Phía Khách hàng (User):** xem thực đơn, thêm món vào đơn, tạo đơn đặt món, chỉnh sửa và xoá đơn khi đơn chưa được xác nhận, theo dõi trạng thái đơn.

* **Phía Nhân viên (Admin/Staff):** tiếp nhận đơn, xác minh/xác nhận đơn, cập nhật trạng thái chế biến, quản lý danh mục và món ăn/đồ uống (thêm, sửa, xoá), quản lý bàn và xem thống kê cơ bản.

**Ngoài phạm vi (Out of scope):** tích hợp cổng thanh toán online thực tế (chỉ mô phỏng trạng thái thanh toán), giao hàng tận nơi (hệ thống tập trung mô hình đặt món tại cửa hàng — dine-in), tích hợp kế toán/hoá đơn điện tử.

## **1.3. Đối tượng người dùng**

| Vai trò | Mô tả | Quyền chính |
| :---- | :---- | :---- |
| Khách hàng (Customer) | Người dùng cuối đến cửa hàng và đặt món. | Xem menu, tạo/sửa/xoá đơn của chính mình, theo dõi đơn. |
| Nhân viên (Staff) | Nhân viên phục vụ tại quầy/bếp. | Nhận đơn, xác minh, cập nhật trạng thái đơn, quản lý món. |
| Quản trị (Admin) | Quản lý cửa hàng. | Toàn quyền của Staff \+ quản lý tài khoản, danh mục, thống kê. |

*Bảng 1.3 — Các nhóm người dùng và quyền tương ứng.*

## **1.4. Công nghệ sử dụng (Tech Stack)**

| Thành phần | Công nghệ | Vai trò |
| :---- | :---- | :---- |
| Database | MongoDB \+ Mongoose ODM | Lưu trữ dữ liệu dạng document, định nghĩa schema. |
| Backend | Node.js \+ Express.js | Xây dựng REST API, xử lý nghiệp vụ, xác thực. |
| Frontend | React.js | Giao diện người dùng cho Khách và Nhân viên. |
| Xác thực | JWT (JSON Web Token) \+ bcrypt | Đăng nhập, phân quyền, mã hoá mật khẩu. |
| Khác | Multer/Cloud storage, dotenv | Upload ảnh món, quản lý biến môi trường. |

## **1.5. Thuật ngữ & viết tắt**

| Thuật ngữ | Ý nghĩa |
| :---- | :---- |
| SRS | Software Requirements Specification — Đặc tả yêu cầu phần mềm. |
| Collection | Tương đương 'bảng' trong CSDL quan hệ; tập hợp các document trong MongoDB. |
| Document | Một bản ghi trong collection (tương đương một 'dòng/row'). |
| Field | Một trường dữ liệu trong document (tương đương một 'cột/column'). |
| Embedding | Nhúng dữ liệu con trực tiếp vào trong document cha. |
| Referencing | Tham chiếu sang document khác bằng ObjectId (giống khoá ngoại). |
| Snapshot | Bản sao dữ liệu tại thời điểm phát sinh, không đổi khi nguồn thay đổi. |
| CRUD | Create, Read, Update, Delete — bốn thao tác cơ bản với dữ liệu. |

# **2\. Mô tả tổng quan hệ thống**

## **2.1. Kiến trúc tổng thể**

Hệ thống áp dụng kiến trúc Client–Server tách biệt theo mô hình 3 lớp:

1. **Lớp trình bày (Frontend – React):** hiển thị giao diện cho Khách hàng và Nhân viên, gọi REST API.

2. **Lớp nghiệp vụ (Backend – Express/Node):** cung cấp REST API, xử lý logic nghiệp vụ, xác thực JWT, phân quyền theo vai trò, kiểm tra dữ liệu (validation).

3. **Lớp dữ liệu (Database – MongoDB):** lưu trữ dữ liệu người dùng, danh mục, món, bàn và đơn hàng.

| ┌──────────────────────────┐        HTTPS / REST (JSON)        ┌──────────────────────────┐ │   FRONTEND (React.js)    │  ───────────────────────────────▶ │   BACKEND (Express.js)   │ │  \- Giao diện Khách hàng  │                                   │  \- Controllers           │ │  \- Giao diện Nhân viên   │  ◀─────────────────────────────── │  \- Services / Nghiệp vụ  │ └──────────────────────────┘        JSON Response               │  \- Middleware (JWT,RBAC) │                                                                 │  \- Validation            │                                                                 └────────────┬─────────────┘                                                                              │ Mongoose ODM                                                                              ▼                                                                 ┌──────────────────────────┐                                                                 │   DATABASE (MongoDB)     │                                                                 │  users · categories ·    │                                                                 │  products · tables ·     │                                                                 │  orders · counters       │                                                                 └──────────────────────────┘ |
| :---- |

*Hình 2.1 — Kiến trúc 3 lớp của hệ thống.*

## **2.2. Giả định và phụ thuộc**

* Khách hàng cần đăng ký/đăng nhập tài khoản trước khi đặt món (để có thể sửa/xoá đơn của chính mình và theo dõi lịch sử). Mã QR trên bàn (nếu có) chỉ dẫn tới trang thực đơn của bàn đó; khách vẫn phải đăng nhập mới đặt được (không hỗ trợ đặt ẩn danh trong phạm vi này).

* Mỗi đơn hàng gắn với một bàn trong cửa hàng (mô hình đặt món tại chỗ). Một bàn có thể có nhiều đơn hoạt động cùng lúc (khách gọi thêm nhiều đợt).

* Hệ thống chạy trên trình duyệt hiện đại, có kết nối Internet ổn định tới máy chủ.

* Thanh toán được ghi nhận ở mức trạng thái (chưa thanh toán / đã thanh toán); không tích hợp cổng thanh toán thật trong phạm vi này.

## **2.3. Ràng buộc chung**

* Toàn bộ tiền tệ lưu theo đơn vị VND, kiểu số nguyên (Number), không lưu phần thập phân.

* Mọi mốc thời gian lưu theo chuẩn ISODate (UTC); hiển thị theo múi giờ địa phương ở Frontend.

* Mật khẩu luôn được hash bằng bcrypt trước khi lưu, không bao giờ lưu dạng plaintext.

* API tuân theo chuẩn RESTful, trả về JSON, dùng đúng HTTP status code.

# **3\. Vai trò và phân quyền (RBAC)**

Hệ thống phân quyền dựa trên vai trò (Role-Based Access Control). Trường role trong collection users quyết định quyền truy cập. Bảng dưới đây tổng hợp ma trận quyền theo từng chức năng.

| Chức năng | Khách hàng | Nhân viên | Quản trị |
| :---- | :---- | :---- | :---- |
| Đăng ký / Đăng nhập | ✓ | ✓ | ✓ |
| Xem thực đơn (danh mục, món) | ✓ | ✓ | ✓ |
| Tạo đơn đặt món | ✓ | ✓ (đặt hộ) | ✓ |
| Sửa / xoá đơn của chính mình (khi chưa xác nhận) | ✓ | — | — |
| Xem tất cả đơn hàng | — | ✓ | ✓ |
| Xác minh / xác nhận đơn | — | ✓ | ✓ |
| Cập nhật trạng thái chế biến đơn | — | ✓ | ✓ |
| Thêm / sửa / xoá danh mục | — | ✓ | ✓ |
| Thêm / sửa / xoá món ăn, đồ uống | — | ✓ | ✓ |
| Quản lý bàn | — | ✓ | ✓ |
| Quản lý tài khoản người dùng | — | — | ✓ |
| Xem thống kê / báo cáo | — | ✓ (cơ bản) | ✓ |

*Bảng 3 — Ma trận phân quyền theo vai trò.*

# **4\. Yêu cầu chức năng**

Mỗi nhóm chức năng được mô tả gồm: mã yêu cầu, mô tả, tác nhân, điều kiện và các quy tắc nghiệp vụ quan trọng cho Backend.

## **4.1. Module Xác thực & Tài khoản (Authentication)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-AUTH-01 | Đăng ký tài khoản | Khách nhập họ tên, email, SĐT, mật khẩu. Email phải duy nhất. Mật khẩu hash bằng bcrypt. Vai trò mặc định là customer. |
| FR-AUTH-02 | Đăng nhập | Đăng nhập bằng email \+ mật khẩu. Thành công trả về JWT access token chứa userId và role. |
| FR-AUTH-03 | Phân quyền truy cập | Middleware kiểm tra JWT cho route cần đăng nhập; kiểm tra role cho route quản trị. |
| FR-AUTH-04 | Xem / cập nhật hồ sơ | Người dùng xem và sửa thông tin cá nhân (tên, SĐT, ảnh đại diện), đổi mật khẩu. |
| FR-AUTH-05 | Quản lý tài khoản (Admin) | Admin xem danh sách người dùng, khoá/mở khoá (isActive), phân vai trò staff. |

## **4.2. Module Thực đơn — Danh mục & Món (Menu Management)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-MENU-01 | Xem danh mục | Mọi người dùng xem danh sách danh mục đang hoạt động (isActive \= true), sắp xếp theo displayOrder. |
| FR-MENU-02 | Quản lý danh mục | Nhân viên thêm/sửa/xoá danh mục (Cà phê, Trà sữa, Đồ ăn vặt...). Không xoá cứng nếu còn món — khuyến nghị ẩn (isActive=false). |
| FR-MENU-03 | Xem danh sách món | Hiển thị món theo danh mục, có lọc/tìm kiếm theo tên, lọc theo trạng thái còn bán (isAvailable). |
| FR-MENU-04 | Xem chi tiết món | Hiển thị mô tả, giá gốc, ảnh, các nhóm tuỳ chọn (size, topping) kèm phụ phí. |
| FR-MENU-05 | Thêm món mới | Nhân viên tạo món: tên, danh mục, giá gốc, ảnh, tuỳ chọn. Tên \+ danh mục nên duy nhất. |
| FR-MENU-06 | Sửa món | Cập nhật thông tin món. Thay đổi giá KHÔNG ảnh hưởng các đơn đã tạo (do đơn lưu snapshot giá). |
| FR-MENU-07 | Xoá / ẩn món | Ưu tiên ẩn món (isAvailable=false) thay vì xoá cứng để giữ toàn vẹn lịch sử đơn hàng. |

## **4.3. Module Đặt món — Phía Khách hàng (Ordering)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-ORD-01 | Thêm món vào đơn | Khách chọn món, số lượng, tuỳ chọn (size/topping), ghi chú. Hệ thống tính itemTotal \= (giá gốc \+ tổng phụ phí tuỳ chọn) × số lượng. Chỉ cho đặt món đang còn bán (isAvailable=true) và thuộc danh mục đang hoạt động; tuỳ chọn gửi lên phải hợp lệ (group single chọn đúng 1, group required bắt buộc chọn), phụ phí lấy theo dữ liệu món hiện hành. |
| FR-ORD-02 | Tạo đơn đặt món | Khách xác nhận giỏ hàng → tạo order với trạng thái pending. Hệ thống kiểm tra bàn tồn tại & đang hoạt động, sinh orderCode duy nhất, tính subtotal và totalAmount, snapshot thông tin từng món. Nhân viên đặt hộ được truyền customerId của một khách đã có tài khoản. |
| FR-ORD-03 | Chỉnh sửa đơn | Khách được sửa món/số lượng/ghi chú CHỈ KHI đơn còn ở trạng thái pending (chưa được nhân viên xác nhận). Sau khi sửa, hệ thống tính lại tổng tiền. |
| FR-ORD-04 | Xoá / huỷ đơn | Khách được xoá (huỷ) đơn của chính mình khi đơn còn pending. Khi đã confirmed trở đi, khách không được tự huỷ. |
| FR-ORD-05 | Theo dõi đơn | Khách xem trạng thái đơn theo thời gian thực (pending → confirmed → preparing → ready → completed) và lịch sử đơn đã đặt. |

**Quy tắc then chốt cho Backend:** mọi thao tác sửa/xoá đơn từ phía khách phải kiểm tra đồng thời (1) đơn thuộc về chính khách đó — customerId trùng userId trong token, và (2) trạng thái đơn đang là pending. Nếu vi phạm, trả về lỗi 403/409.

## **4.4. Module Xử lý đơn — Phía Nhân viên (Order Processing)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-STAFF-01 | Xem danh sách đơn | Nhân viên xem tất cả đơn, lọc theo trạng thái/bàn/khoảng thời gian, sắp xếp mới nhất trước. |
| FR-STAFF-02 | Xác minh & xác nhận đơn | Nhân viên kiểm tra đơn pending và xác nhận → chuyển trạng thái confirmed, ghi confirmedBy và confirmedAt. Có thể áp giảm giá (discountAmount, 0 ≤ discount ≤ subtotal) khi xác nhận → tính lại totalAmount. |
| FR-STAFF-03 | Cập nhật trạng thái chế biến | Chuyển trạng thái theo luồng: confirmed → preparing → ready → completed. Mỗi lần chuyển ghi vào statusHistory. Khi hoàn tất (completed) cộng dồn soldCount cho từng món (exactly-once). |
| FR-STAFF-04 | Huỷ đơn | Nhân viên huỷ đơn (cancelled) kèm lý do (cancelReason) chỉ khi đơn đang ở pending hoặc confirmed. Nếu đơn đã thanh toán (paid) thì tự chuyển paymentStatus sang refunded. |
| FR-STAFF-05 | Cập nhật thanh toán | Đánh dấu paymentStatus (unpaid → paid) và phương thức (cash/card/ewallet). Không bắt buộc thanh toán trước khi completed (khách trả tại quầy). |

## **4.5. Module Quản lý bàn (Table Management)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-TBL-01 | Quản lý bàn | Nhân viên thêm/sửa/xoá bàn: số bàn, sức chứa, trạng thái. |
| FR-TBL-02 | Theo dõi trạng thái bàn | Trạng thái bàn: available / occupied / reserved. Hệ thống tự đồng bộ occupied/available theo reference-counting: bàn ở occupied khi còn ≥1 đơn đang hoạt động (pending/confirmed/preparing/ready), trở về available khi không còn đơn hoạt động nào. Trạng thái reserved do nhân viên đặt/bỏ thủ công, nằm ngoài luồng tự động. |

## **4.6. Module Thống kê (Dashboard)**

| Mã | Chức năng | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- |
| FR-DASH-01 | Thống kê tổng quan | Số đơn theo trạng thái (đếm trên tất cả đơn). Doanh thu \= tổng totalAmount của các đơn completed, gom theo ngày của completedAt (hôm nay/tuần). Số đơn hôm nay. |
| FR-DASH-02 | Món bán chạy | Top món bán chạy tính bằng aggregate tổng số lượng từ items của các đơn completed (nguồn chân lý); soldCount chỉ là bộ đệm hiển thị nhanh. |

# **5\. Yêu cầu phi chức năng**

| Nhóm | Yêu cầu |
| :---- | :---- |
| Bảo mật | Mật khẩu hash bằng bcrypt (≥10 salt rounds); xác thực bằng JWT có thời hạn; phân quyền theo role; không trả về passwordHash trong API. |
| Hiệu năng | Phản hồi API truy vấn danh sách \< 500ms với dữ liệu mẫu; sử dụng index hợp lý; phân trang cho danh sách lớn. |
| Tính khả dụng | Giao diện responsive, dùng được trên điện thoại và máy tính; thông báo lỗi rõ ràng cho người dùng. |
| Toàn vẹn dữ liệu | Đơn hàng lưu snapshot thông tin món để bất biến với thay đổi menu; dùng transaction khi cần đảm bảo nhất quán. |
| Khả năng bảo trì | Mã nguồn phân tách rõ Controller–Service–Model; chuẩn hoá định dạng response; có validation tập trung. |
| Khả năng mở rộng | Schema thiết kế để dễ thêm trường (ví dụ khuyến mãi, đánh giá) mà không phá vỡ cấu trúc hiện có. |

# **6\. Thiết kế cơ sở dữ liệu (MongoDB)**

## **6.1. Triết lý & chiến lược thiết kế**

MongoDB là CSDL dạng document (NoSQL). Khác với CSDL quan hệ, ta không bị buộc phải chuẩn hoá (normalize) tối đa, mà cân nhắc giữa hai chiến lược: Nhúng (Embedding) và Tham chiếu (Referencing). Lựa chọn đúng giúp truy vấn nhanh và dữ liệu nhất quán.

### **6.1.1. Khi nào Nhúng (Embedding)?**

* Dữ liệu con luôn được đọc cùng dữ liệu cha và không tồn tại độc lập. Ví dụ: các tuỳ chọn (size, topping) của một món được nhúng trực tiếp trong product.

* Cần một 'ảnh chụp' (snapshot) bất biến. Ví dụ: danh sách món trong một order được nhúng kèm tên và giá tại thời điểm đặt — để khi menu đổi giá, đơn cũ không bị sai.

### **6.1.2. Khi nào Tham chiếu (Referencing)?**

* Dữ liệu được dùng chung ở nhiều nơi và có thể thay đổi độc lập. Ví dụ: order tham chiếu tới user qua customerId thay vì sao chép toàn bộ hồ sơ khách.

* Dữ liệu lớn hoặc tăng trưởng không giới hạn. Ví dụ: tránh nhúng toàn bộ lịch sử đơn vào trong user.

**Nguyên tắc vàng áp dụng cho hệ thống này:** Đơn hàng (order) **nhúng snapshot** các dòng món để bảo toàn lịch sử, nhưng vẫn **giữ tham chiếu productId** để truy vết và thống kê. Đây là điểm thiết kế quan trọng nhất của toàn bộ CSDL.

### **6.1.3. Quy ước chung**

* \_id: MongoDB tự sinh ObjectId làm khoá chính cho mọi document.

* createdAt / updatedAt: Mongoose tự thêm khi bật tuỳ chọn { timestamps: true }.

* Tiền tệ: Number (VND, số nguyên). Thời gian: Date (ISODate).

* Các trường liệt kê trạng thái dùng enum để Mongoose validate giá trị hợp lệ.

## **6.2. Tổng quan các collection**

| \# | Collection | Vai trò | Số lượng ước tính |
| :---- | :---- | :---- | :---- |
| 1 | users | Tài khoản khách hàng, nhân viên, quản trị. | Trung bình |
| 2 | categories | Danh mục thực đơn (Cà phê, Trà sữa, Đồ ăn...). | Nhỏ |
| 3 | products | Món ăn / đồ uống kèm tuỳ chọn. | Trung bình |
| 4 | tables | Danh sách bàn trong cửa hàng. | Nhỏ |
| 5 | orders | Đơn đặt món (trọng tâm nghiệp vụ). | Lớn (tăng liên tục) |
| 6 | counters | Bộ đếm sinh mã đơn tự tăng (orderCode). | Rất nhỏ |

## **6.3. Sơ đồ quan hệ giữa các collection**

Sơ đồ dưới đây mô tả quan hệ và chiến lược lưu trữ (tham chiếu là mũi tên, nhúng là khối lồng bên trong):

|                                   ┌──────────────────────┐                                   │       categories     │                                   │  \_id, name, slug ... │                                   └───────────▲──────────┘                                               │ (ref) categoryId   ┌──────────────────┐                ┌───────┴──────────┐   │      users       │                │     products     │   │ \_id, role, email │                │ \_id, name, price │   │ ...              │                │  options:\[ {..} \] │◀─ NHÚNG tuỳ chọn (size/topping)   └───────┬──────────┘                └───────▲──────────┘           │ (ref) customerId                  │ (ref) productId           │   confirmedBy                     │  (trong từng dòng món)           ▼                                   │   ┌──────────────────────────────────────────┴───────────────────────┐   │                              orders                               │   │  \_id, orderCode, customerId(ref), tableId(ref), confirmedBy(ref)  │   │  items: \[ { productId(ref), name, unitPrice, qty, options } \]  ◀─ NHÚNG snapshot món   │  statusHistory: \[ { status, changedBy, changedAt } \]          ◀─ NHÚNG lịch sử   │  subtotal, totalAmount, status, paymentStatus ...                 │   └───────────────────────────────┬──────────────────────────────────┘                                   │ (ref) tableId                                   ▼                           ┌──────────────────┐                           │      tables       │                           │ \_id, tableNumber  │                           └──────────────────┘ |
| :---- |

*Hình 6.3 — Quan hệ giữa các collection. Mũi tên \= tham chiếu (ObjectId); khối lồng \= nhúng (embedded).*

| Quan hệ | Loại | Chiến lược | Lý do |
| :---- | :---- | :---- | :---- |
| products → categories | N–1 | Tham chiếu (categoryId) | Một danh mục có nhiều món; danh mục dùng chung, thay đổi độc lập. |
| product.options | 1–N | Nhúng | Tuỳ chọn chỉ thuộc về món đó, luôn đọc kèm món. |
| orders → users | N–1 | Tham chiếu (customerId) | Khách dùng chung cho nhiều đơn; không sao chép hồ sơ. |
| orders → tables | N–1 | Tham chiếu (tableId) | Đơn gắn với một bàn; bàn dùng lại nhiều lần. |
| order.items → products | N–1 | Nhúng snapshot \+ ref productId | Bảo toàn giá/tên tại thời điểm đặt; vẫn truy vết được món gốc. |
| order.statusHistory | 1–N | Nhúng | Lịch sử trạng thái chỉ thuộc về đơn đó. |

## **6.4. Chi tiết từng collection**

### **6.4.1. Collection users — Người dùng**

Lưu trữ toàn bộ tài khoản trong hệ thống. Một collection duy nhất cho cả khách hàng và nhân viên, phân biệt bằng trường role. Cách này đơn giản hoá xác thực và phân quyền.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | ObjectId | Tự sinh | Khoá chính, MongoDB tự tạo. |
| 2 | **fullName** | String | **Có** | Họ và tên đầy đủ. Dùng để hiển thị và in trên đơn. |
| 3 | **email** | String | **Có** | Email đăng nhập. DUY NHẤT (unique). Validate đúng định dạng email, lưu chữ thường. |
| 4 | **phone** | String | **Có** | Số điện thoại liên hệ. Validate định dạng SĐT Việt Nam. Dùng String để giữ số 0 đầu. |
| 5 | **passwordHash** | String | **Có** | Mật khẩu đã hash bằng bcrypt. KHÔNG bao giờ trả về trong API (select:false). |
| 6 | **role** | String (enum) | **Có** | Vai trò: 'customer' | 'staff' | 'admin'. Mặc định 'customer'. Quyết định phân quyền. |
| 7 | **avatarUrl** | String | Không | Đường dẫn ảnh đại diện. Có thể null. |
| 8 | **isActive** | Boolean | **Có** | Tài khoản còn hoạt động không. Mặc định true. Admin có thể khoá (false) thay vì xoá. |
| 9 | **lastLoginAt** | Date | Không | Thời điểm đăng nhập gần nhất. Phục vụ theo dõi/bảo mật. |
| 10 | **createdAt** | Date | Tự sinh | Thời điểm tạo tài khoản (timestamps). |
| 11 | **updatedAt** | Date | Tự sinh | Thời điểm cập nhật gần nhất (timestamps). |

**Index:** email (unique), role (lọc nhân viên/khách), phone.

**Ví dụ document:**

| {   "\_id": ObjectId("6650a1..."),   "fullName": "Nguyễn Văn A",   "email": "vana@example.com",   "phone": "0912345678",   "passwordHash": "$2b$10$abc...",   "role": "customer",   "avatarUrl": null,   "isActive": true,   "lastLoginAt": ISODate("2026-06-21T03:12:00Z"),   "createdAt": ISODate("2026-06-01T08:00:00Z"),   "updatedAt": ISODate("2026-06-21T03:12:00Z") } |
| :---- |

### **6.4.2. Collection categories — Danh mục thực đơn**

Nhóm các món theo loại để khách dễ duyệt (ví dụ: Cà phê, Trà sữa, Nước ép, Đồ ăn vặt). Một danh mục chứa nhiều món.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | ObjectId | Tự sinh | Khoá chính. |
| 2 | **name** | String | **Có** | Tên danh mục hiển thị. DUY NHẤT. Ví dụ: 'Trà sữa'. |
| 3 | **slug** | String | **Có** | Chuỗi thân thiện URL, duy nhất. Ví dụ: 'tra-sua'. Tự sinh từ name. |
| 4 | **description** | String | Không | Mô tả ngắn về danh mục. |
| 5 | **imageUrl** | String | Không | Ảnh đại diện danh mục (icon/banner). |
| 6 | **displayOrder** | Number | Không | Thứ tự hiển thị trên giao diện (nhỏ hơn xuất hiện trước). Mặc định 0\. |
| 7 | **isActive** | Boolean | **Có** | Còn hiển thị không. Mặc định true. Ẩn danh mục bằng cách đặt false. |
| 8 | **createdAt** | Date | Tự sinh | Thời điểm tạo. |
| 9 | **updatedAt** | Date | Tự sinh | Thời điểm cập nhật gần nhất. |

**Index:** slug (unique), isActive, displayOrder.

### **6.4.3. Collection products — Món ăn / Đồ uống**

Lưu thông tin từng món. Mỗi món thuộc một danh mục (tham chiếu categoryId) và có thể có nhiều nhóm tuỳ chọn (size, topping...) được NHÚNG trực tiếp.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | ObjectId | Tự sinh | Khoá chính. |
| 2 | **name** | String | **Có** | Tên món. Ví dụ: 'Trà sữa trân châu đường đen'. |
| 3 | **slug** | String | **Có** | Chuỗi thân thiện URL, duy nhất. |
| 4 | **description** | String | Không | Mô tả chi tiết món ăn/đồ uống. |
| 5 | **categoryId** | ObjectId (ref categories) | **Có** | THAM CHIẾU tới danh mục chứa món. Cho phép populate khi truy vấn. |
| 6 | **basePrice** | Number | **Có** | Giá gốc (VND), số nguyên, ≥ 0\. Là giá chưa cộng phụ phí tuỳ chọn. |
| 7 | **imageUrl** | String | Không | Ảnh món. |
| 8 | **options** | Array\<Object\> | Không | NHÚNG các nhóm tuỳ chọn (xem cấu trúc bên dưới). Mặc định \[\]. |
| 9 | **isAvailable** | Boolean | **Có** | Còn bán không. Mặc định true. Hết hàng/ngừng bán đặt false (ưu tiên hơn xoá cứng). |
| 10 | **isFeatured** | Boolean | Không | Đánh dấu món nổi bật để hiển thị ưu tiên. Mặc định false. |
| 11 | **preparationTime** | Number | Không | Thời gian chế biến ước tính (phút). Phục vụ hiển thị/điều phối bếp. |
| 12 | **soldCount** | Number | Không | Tổng số lượng đã bán (cộng dồn khi đơn hoàn thành). Phục vụ thống kê món bán chạy. Mặc định 0\. |
| 13 | **createdAt** | Date | Tự sinh | Thời điểm tạo món. |
| 14 | **updatedAt** | Date | Tự sinh | Thời điểm cập nhật gần nhất. |

**Cấu trúc một phần tử trong mảng options (nhóm tuỳ chọn):**

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **options\[\].name** | String | **Có** | Tên nhóm tuỳ chọn. Ví dụ: 'Size', 'Topping', 'Mức đường'. |
| 2 | **options\[\].type** | String (enum) | **Có** | 'single' (chọn 1\) hoặc 'multiple' (chọn nhiều). |
| 3 | **options\[\].required** | Boolean | **Có** | Bắt buộc chọn hay không. Ví dụ Size \= bắt buộc. |
| 4 | **options\[\].choices** | Array\<Object\> | **Có** | Danh sách lựa chọn trong nhóm. |
| 5 | **...choices\[\].label** | String | **Có** | Tên lựa chọn. Ví dụ: 'Size L', 'Trân châu'. |
| 6 | **...choices\[\].priceModifier** | Number | **Có** | Phụ phí cộng thêm (VND). Có thể 0\. Ví dụ Size L \= \+5000. |

**Index:** categoryId, slug (unique), isAvailable; index văn bản name để tìm kiếm.

**Ví dụ document product:**

| {   "\_id": ObjectId("66510b..."),   "name": "Trà sữa trân châu đường đen",   "slug": "tra-sua-tran-chau-duong-den",   "description": "Trà sữa béo thơm, trân châu dai.",   "categoryId": ObjectId("664f02..."),   // \-\> categories   "basePrice": 30000,   "imageUrl": "https://.../milktea.jpg",   "options": \[     {       "name": "Size", "type": "single", "required": true,       "choices": \[         { "label": "Size M", "priceModifier": 0 },         { "label": "Size L", "priceModifier": 5000 }       \]     },     {       "name": "Topping", "type": "multiple", "required": false,       "choices": \[         { "label": "Trân châu", "priceModifier": 5000 },         { "label": "Pudding",  "priceModifier": 7000 }       \]     }   \],   "isAvailable": true,   "isFeatured": true,   "preparationTime": 5,   "soldCount": 124,   "createdAt": ISODate("2026-06-01T08:00:00Z"),   "updatedAt": ISODate("2026-06-20T10:00:00Z") } |
| :---- |

### **6.4.4. Collection tables — Bàn trong cửa hàng**

Quản lý các bàn phục vụ. Mỗi đơn hàng gắn với một bàn. Có thể gắn QR để khách quét và đặt món trực tiếp tại bàn.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | ObjectId | Tự sinh | Khoá chính. |
| 2 | **tableNumber** | String | **Có** | Tên/số bàn. DUY NHẤT. Ví dụ: 'B01', 'Bàn 5'. |
| 3 | **capacity** | Number | Không | Số chỗ ngồi tối đa của bàn. |
| 4 | **status** | String (enum) | **Có** | 'available' | 'occupied' | 'reserved'. Mặc định 'available'. |
| 5 | **qrCodeUrl** | String | Không | Đường dẫn ảnh mã QR của bàn (nếu dùng đặt món qua QR). |
| 6 | **isActive** | Boolean | **Có** | Bàn còn sử dụng không. Mặc định true. |
| 7 | **createdAt** | Date | Tự sinh | Thời điểm tạo. |
| 8 | **updatedAt** | Date | Tự sinh | Thời điểm cập nhật gần nhất. |

**Index:** tableNumber (unique), status.

### **6.4.5. Collection orders — Đơn đặt món (TRỌNG TÂM)**

Đây là collection cốt lõi của hệ thống. Một order ghi nhận đầy đủ một lần đặt món: ai đặt, bàn nào, gồm những món gì, tổng tiền, trạng thái xử lý và thanh toán. Các dòng món (items) và lịch sử trạng thái (statusHistory) được NHÚNG để bảo toàn dữ liệu.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | ObjectId | Tự sinh | Khoá chính. |
| 2 | **orderCode** | String | **Có** | Mã đơn dễ đọc, DUY NHẤT. Ví dụ 'ORD-20260621-0001'. Sinh từ collection counters. |
| 3 | **customerId** | ObjectId (ref users) | **Có** | THAM CHIẾU tới khách đặt đơn. Dùng để kiểm tra quyền sửa/xoá đơn. |
| 4 | **customerInfo** | Object (embedded) | **Có** | Snapshot { fullName, phone } của khách tại thời điểm đặt — phòng khi hồ sơ thay đổi. |
| 5 | **tableId** | ObjectId (ref tables) | **Có** | THAM CHIẾU bàn phục vụ đơn. |
| 6 | **tableNumber** | String | **Có** | Snapshot số bàn để hiển thị nhanh không cần populate. |
| 7 | **items** | Array\<Object\> | **Có** | Danh sách dòng món (NHÚNG snapshot — xem cấu trúc bên dưới). Tối thiểu 1 phần tử. |
| 8 | **subtotal** | Number | **Có** | Tổng tiền các món \= Σ itemTotal. Đơn vị VND. |
| 9 | **discountAmount** | Number | Không | Số tiền giảm giá (nếu có). Mặc định 0\. Do nhân viên/quản trị áp khi xác nhận đơn; ràng buộc 0 ≤ discountAmount ≤ subtotal. |
| 10 | **totalAmount** | Number | **Có** | Thành tiền cuối \= subtotal − discountAmount. Đơn vị VND. |
| 11 | **status** | String (enum) | **Có** | Trạng thái đơn: pending | confirmed | preparing | ready | completed | cancelled. Mặc định 'pending'. |
| 12 | **paymentStatus** | String (enum) | **Có** | 'unpaid' | 'paid' | 'refunded'. Mặc định 'unpaid'. Tự chuyển 'refunded' khi huỷ đơn đã 'paid'. |
| 13 | **paymentMethod** | String (enum) | Không | 'cash' | 'card' | 'ewallet'. Ghi nhận khi thanh toán. |
| 14 | **note** | String | Không | Ghi chú chung của khách cho đơn (ví dụ: 'Giao nhanh giúp em'). |
| 15 | **cancelReason** | String | Không | Lý do huỷ, ghi khi status \= 'cancelled'. |
| 16 | **confirmedBy** | ObjectId (ref users) | Không | Nhân viên đã xác nhận đơn. Null khi chưa xác nhận. |
| 17 | **confirmedAt** | Date | Không | Thời điểm xác nhận đơn. |
| 18 | **completedAt** | Date | Không | Thời điểm hoàn tất đơn. |
| 19 | **statusHistory** | Array\<Object\> | Không | NHÚNG lịch sử thay đổi trạng thái (xem cấu trúc bên dưới). |
| 20 | **createdAt** | Date | Tự sinh | Thời điểm tạo đơn. |
| 21 | **updatedAt** | Date | Tự sinh | Thời điểm cập nhật gần nhất. |

**Cấu trúc một dòng món trong mảng items (NHÚNG snapshot):**

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **items\[\].productId** | ObjectId (ref products) | **Có** | Tham chiếu món gốc — để truy vết và cập nhật soldCount/thống kê. |
| 2 | **items\[\].name** | String | **Có** | SNAPSHOT tên món tại thời điểm đặt (không đổi khi món đổi tên). |
| 3 | **items\[\].unitPrice** | Number | **Có** | SNAPSHOT giá gốc món tại thời điểm đặt (basePrice). Bất biến với thay đổi menu. |
| 4 | **items\[\].quantity** | Number | **Có** | Số lượng đặt. Số nguyên ≥ 1\. |
| 5 | **items\[\].selectedOptions** | Array\<Object\> | Không | Các tuỳ chọn đã chọn: { groupName, choiceLabel, priceModifier }. |
| 6 | **items\[\].itemTotal** | Number | **Có** | Thành tiền dòng \= (unitPrice \+ Σ priceModifier) × quantity. |
| 7 | **items\[\].note** | String | Không | Ghi chú riêng cho món (ví dụ: 'ít đá', 'không đường'). |

**Cấu trúc một phần tử trong statusHistory:**

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **statusHistory\[\].status** | String (enum) | **Có** | Trạng thái tại bước này (pending, confirmed, ...). |
| 2 | **statusHistory\[\].changedBy** | ObjectId (ref users) | Không | Người thực hiện thay đổi (khách hoặc nhân viên). |
| 3 | **statusHistory\[\].changedAt** | Date | **Có** | Thời điểm chuyển trạng thái. |
| 4 | **statusHistory\[\].note** | String | Không | Ghi chú kèm theo (ví dụ lý do huỷ). |

**Index:** orderCode (unique), customerId, status, tableId, createdAt (giảm dần để liệt kê đơn mới nhất).

**Ví dụ document order:**

| {   "\_id": ObjectId("66700f..."),   "orderCode": "ORD-20260621-0007",   "customerId": ObjectId("6650a1..."),   "customerInfo": { "fullName": "Nguyễn Văn A", "phone": "0912345678" },   "tableId": ObjectId("6655c0..."),   "tableNumber": "B05",   "items": \[     {       "productId": ObjectId("66510b..."),       "name": "Trà sữa trân châu đường đen",       "unitPrice": 30000,       "quantity": 2,       "selectedOptions": \[         { "groupName": "Size",    "choiceLabel": "Size L",    "priceModifier": 5000 },         { "groupName": "Topping", "choiceLabel": "Trân châu", "priceModifier": 5000 }       \],       "itemTotal": 80000,        // (30000 \+ 5000 \+ 5000\) \* 2       "note": "Ít đá"     }   \],   "subtotal": 80000,   "discountAmount": 0,   "totalAmount": 80000,   "status": "confirmed",   "paymentStatus": "unpaid",   "paymentMethod": null,   "note": "",   "confirmedBy": ObjectId("6651ff..."),  // nhân viên   "confirmedAt": ISODate("2026-06-21T03:20:00Z"),   "statusHistory": \[     { "status": "pending",   "changedBy": ObjectId("6650a1..."), "changedAt": ISODate("2026-06-21T03:18:00Z") },     { "status": "confirmed", "changedBy": ObjectId("6651ff..."), "changedAt": ISODate("2026-06-21T03:20:00Z") }   \],   "createdAt": ISODate("2026-06-21T03:18:00Z"),   "updatedAt": ISODate("2026-06-21T03:20:00Z") } |
| :---- |

### **6.4.6. Collection counters — Bộ đếm sinh mã**

Collection kỹ thuật giúp sinh số thứ tự tự tăng an toàn (atomic) cho orderCode. Mỗi ngày/tiền tố có một document đếm riêng. Dùng findOneAndUpdate với $inc để tránh trùng mã khi nhiều đơn tạo đồng thời.

| STT | Tên trường (Field) | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **\_id** | String | **Có** | Khoá định danh bộ đếm. Ví dụ: 'order-20260621' (theo ngày). |
| 2 | **seq** | Number | **Có** | Giá trị đếm hiện tại, tăng dần mỗi lần sinh mã. Bắt đầu từ 0\. |

**Cách sinh orderCode (gợi ý cho Backend):**

| // Atomic increment để lấy số thứ tự tiếp theo trong ngày const key \= \`order-${yyyymmdd}\`; const c \= await Counter.findOneAndUpdate(   { \_id: key },   { $inc: { seq: 1 } },   { new: true, upsert: true } ); const orderCode \= \`ORD-${yyyymmdd}-${String(c.seq).padStart(4, '0')}\`; // \=\> ORD-20260621-0007 |
| :---- |

## **6.5. Gợi ý định nghĩa Schema bằng Mongoose**

Trích đoạn minh hoạ cách hiện thực hai schema quan trọng (Product và Order) để Backend tham chiếu trực tiếp:

| // models/Product.js const choiceSchema \= new Schema({   label: { type: String, required: true },   priceModifier: { type: Number, default: 0, min: 0 } }, { \_id: false });   const optionSchema \= new Schema({   name: { type: String, required: true },   type: { type: String, enum: \['single','multiple'\], required: true },   required: { type: Boolean, default: false },   choices: \[choiceSchema\] }, { \_id: false });   const productSchema \= new Schema({   name: { type: String, required: true, trim: true },   slug: { type: String, required: true, unique: true },   description: String,   categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },   basePrice: { type: Number, required: true, min: 0 },   imageUrl: String,   options: \[optionSchema\],   isAvailable: { type: Boolean, default: true },   isFeatured: { type: Boolean, default: false },   preparationTime: Number,   soldCount: { type: Number, default: 0 } }, { timestamps: true }); |
| :---- |

| // models/Order.js const selectedOptionSchema \= new Schema({   groupName: String, choiceLabel: String, priceModifier: { type: Number, default: 0 } }, { \_id: false });   const orderItemSchema \= new Schema({   productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },   name: { type: String, required: true },        // snapshot   unitPrice: { type: Number, required: true },     // snapshot   quantity: { type: Number, required: true, min: 1 },   selectedOptions: \[selectedOptionSchema\],   itemTotal: { type: Number, required: true },   note: String }, { \_id: false });   const statusLogSchema \= new Schema({   status: String,   changedBy: { type: Schema.Types.ObjectId, ref: 'User' },   changedAt: { type: Date, default: Date.now },   note: String }, { \_id: false });   const orderSchema \= new Schema({   orderCode: { type: String, required: true, unique: true },   customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },   customerInfo: { fullName: String, phone: String },   tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },   tableNumber: String,   items: { type: \[orderItemSchema\], validate: v \=\> v.length \> 0 },   subtotal: { type: Number, required: true },   discountAmount: { type: Number, default: 0 },   totalAmount: { type: Number, required: true },   status: { type: String,     enum: \['pending','confirmed','preparing','ready','completed','cancelled'\],     default: 'pending', index: true },   paymentStatus: { type: String, enum: \['unpaid','paid','refunded'\], default: 'unpaid' },   paymentMethod: { type: String, enum: \['cash','card','ewallet'\] },   note: String,   cancelReason: String,   confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },   confirmedAt: Date,   completedAt: Date,   statusHistory: \[statusLogSchema\] }, { timestamps: true }); |
| :---- |

# **7\. Thiết kế REST API**

API tuân theo chuẩn RESTful. Tiền tố chung: /api. Các route có ký hiệu 🔒 yêu cầu đăng nhập (JWT); 👮 yêu cầu vai trò nhân viên/quản trị.

## **7.1. Auth & User**

| Method | Endpoint | Quyền | Mô tả |
| :---- | :---- | :---- | :---- |
| POST | /api/auth/register | Công khai | Đăng ký tài khoản khách hàng. |
| POST | /api/auth/login | Công khai | Đăng nhập, trả về JWT. |
| GET | /api/users/me | 🔒 | Lấy hồ sơ người dùng hiện tại. |
| PUT | /api/users/me | 🔒 | Cập nhật hồ sơ / đổi mật khẩu. |
| GET | /api/users | 👮 Admin | Danh sách người dùng (phân trang). |
| PATCH | /api/users/:id/status | 👮 Admin | Khoá / mở khoá tài khoản. |

## **7.2. Category & Product**

| Method | Endpoint | Quyền | Mô tả |
| :---- | :---- | :---- | :---- |
| GET | /api/categories | Công khai | Danh sách danh mục đang hoạt động. |
| POST | /api/categories | 👮 | Tạo danh mục. |
| PUT | /api/categories/:id | 👮 | Cập nhật danh mục. |
| DELETE | /api/categories/:id | 👮 | Xoá / ẩn danh mục. |
| GET | /api/products | Công khai | Danh sách món (lọc theo category, tìm kiếm, phân trang). |
| GET | /api/products/:id | Công khai | Chi tiết một món. |
| POST | /api/products | 👮 | Thêm món mới. |
| PUT | /api/products/:id | 👮 | Cập nhật món. |
| DELETE | /api/products/:id | 👮 | Xoá / ẩn món. |

## **7.3. Order**

| Method | Endpoint | Quyền | Mô tả |
| :---- | :---- | :---- | :---- |
| POST | /api/orders | 🔒 | Tạo đơn mới (status \= pending). |
| GET | /api/orders/my | 🔒 | Danh sách đơn của chính khách. |
| GET | /api/orders/:id | 🔒 | Chi tiết đơn (khách chỉ xem đơn của mình). |
| PUT | /api/orders/:id | 🔒 | Sửa đơn — chỉ khi đơn pending & của chính khách. |
| DELETE | /api/orders/:id | 🔒 | Huỷ/xoá đơn — chỉ khi pending & của chính khách. |
| GET | /api/orders | 👮 | Danh sách tất cả đơn (lọc trạng thái/bàn/ngày). |
| PATCH | /api/orders/:id/confirm | 👮 | Xác minh & xác nhận đơn. |
| PATCH | /api/orders/:id/status | 👮 | Cập nhật trạng thái chế biến. |
| PATCH | /api/orders/:id/cancel | 👮 | Huỷ đơn kèm lý do. |
| PATCH | /api/orders/:id/payment | 👮 | Cập nhật trạng thái thanh toán. |

## **7.4. Table & Dashboard**

| Method | Endpoint | Quyền | Mô tả |
| :---- | :---- | :---- | :---- |
| GET | /api/tables | 🔒 | Danh sách bàn. |
| POST | /api/tables | 👮 | Thêm bàn. |
| PUT | /api/tables/:id | 👮 | Cập nhật bàn. |
| DELETE | /api/tables/:id | 👮 | Xoá bàn. |
| GET | /api/dashboard/summary | 👮 | Thống kê tổng quan (doanh thu, số đơn theo trạng thái). |
| GET | /api/dashboard/top-products | 👮 | Danh sách món bán chạy. |

## **7.5. Quy ước response**

Mọi response trả JSON theo cấu trúc thống nhất để Frontend xử lý dễ dàng:

| // Thành công { "success": true, "data": { ... }, "message": "..." }   // Danh sách có phân trang { "success": true, "data": \[ ... \],   "pagination": { "page": 1, "limit": 20, "total": 137 } }   // Lỗi { "success": false, "message": "Mô tả lỗi", "errorCode": "ORDER\_NOT\_EDITABLE" } |
| :---- |

# **8\. Luồng nghiệp vụ chính**

## **8.1. Vòng đời trạng thái đơn hàng**

Đơn hàng đi qua các trạng thái theo sơ đồ sau. Mỗi mũi tên là một hành động hợp lệ kèm vai trò thực hiện:

|                  (Khách tạo đơn)                        │                        ▼   ┌─────────┐  xác nhận (NV)   ┌───────────┐  bắt đầu làm (NV)  ┌────────────┐   │ pending │ ───────────────▶ │ confirmed │ ────────────────▶ │ preparing  │   └────┬────┘                  └─────┬─────┘                   └─────┬──────┘        │ Khách sửa/xoá               │ huỷ (NV)                      │ làm xong (NV)        │ (chỉ khi pending)           ▼                               ▼        │                       ┌───────────┐                   ┌────────────┐        └─────────────────────▶ │ cancelled │ ◀──────────────── │   ready    │                                └───────────┘                   └─────┬──────┘                                                                      │ giao cho khách (NV)                                                                      ▼                                                                ┌────────────┐                                                                │ completed  │                                                                └────────────┘ |
| :---- |

*Hình 8.1 — Máy trạng thái (state machine) của đơn hàng.*

| Trạng thái | Ý nghĩa | Hành động cho phép |
| :---- | :---- | :---- |
| pending | Khách vừa tạo, chờ nhân viên xác nhận. | Khách: sửa/xoá. NV: xác nhận / huỷ. |
| confirmed | Nhân viên đã xác minh & nhận đơn. | NV: chuyển sang preparing / huỷ. |
| preparing | Đang chế biến. | NV: chuyển sang ready. (Không cho huỷ — món đã chế biến.) |
| ready | Đã làm xong, sẵn sàng phục vụ. | NV: chuyển sang completed. (Không cho huỷ.) |
| completed | Đã giao cho khách, hoàn tất. | Trạng thái kết thúc (cộng soldCount). |
| cancelled | Đơn bị huỷ. | Trạng thái kết thúc (kèm cancelReason; nếu đã paid → refunded). |

*Lưu ý đồng bộ: chỉ cho phép HUỶ ở trạng thái pending và confirmed. Sơ đồ Hình 8.1 minh hoạ tổng quát; quy tắc chuẩn để hiện thực là bảng trên.*

## **8.2. Luồng Khách hàng đặt món**

1. Khách đăng nhập, duyệt thực đơn theo danh mục.

2. Chọn món, cấu hình tuỳ chọn (size/topping), số lượng, ghi chú → thêm vào giỏ.

3. Chọn bàn, xác nhận giỏ hàng. Hệ thống tính subtotal/totalAmount, snapshot từng món, sinh orderCode, lưu order với status \= pending.

4. Khi đơn còn pending, khách có thể sửa/xoá. Hệ thống tính lại tổng tiền sau mỗi lần sửa.

5. Khách theo dõi trạng thái đơn đến khi completed.

## **8.3. Luồng Nhân viên xử lý đơn**

1. Nhân viên xem danh sách đơn pending mới nhất.

2. Xác minh nội dung đơn và bấm xác nhận → status \= confirmed, ghi confirmedBy/confirmedAt, đẩy bản ghi vào statusHistory. Từ lúc này khách không sửa/xoá được nữa.

3. Cập nhật tiến trình: confirmed → preparing → ready → completed. Mỗi bước ghi statusHistory.

4. Khi completed: hệ thống cộng dồn soldCount cho từng productId trong items để phục vụ thống kê món bán chạy.

5. Cập nhật paymentStatus \= paid và paymentMethod khi khách thanh toán.

## **8.4. Quy tắc nghiệp vụ quan trọng (tóm tắt cho Backend)**

* **Quyền sửa/xoá đơn:** chỉ chủ đơn (customerId \== userId) và chỉ khi status \== 'pending'.

* **Tính tiền ở Backend:** không tin số tiền do client gửi lên. Backend tự tính lại itemTotal, subtotal, totalAmount dựa trên basePrice và priceModifier hiện hành.

* **Snapshot bất biến:** khi tạo đơn, sao chép name \+ unitPrice của món vào items. Sửa giá menu về sau KHÔNG ảnh hưởng đơn cũ.

* **Chuyển trạng thái hợp lệ:** chỉ cho phép các bước chuyển trong máy trạng thái (Hình 8.1); từ chối bước nhảy không hợp lệ với lỗi 409\.

* **Xoá mềm (soft delete):** ưu tiên ẩn (isActive/isAvailable \= false) cho category/product thay vì xoá cứng, để giữ toàn vẹn lịch sử đơn.

* **Sinh orderCode an toàn:** dùng collection counters với findOneAndUpdate \+ $inc (atomic) để tránh trùng mã khi tải cao.

## **8.5. Quy tắc nghiệp vụ đồng bộ FE–BE (bổ sung v1.1)**

Mục này tổng hợp các quy tắc đã được làm rõ sau review, là chuẩn chung cho cả Frontend và Backend để hành xử nhất quán.

### **8.5.1. Đặt món & đơn hàng**

* **Kiểm tra khi đặt:** BE từ chối nếu món `isAvailable=false` / danh mục `isActive=false` (lỗi `PRODUCT_UNAVAILABLE`) hoặc bàn không tồn tại / `isActive=false` (lỗi `TABLE_INACTIVE`). FE nên ẩn/disable các món, bàn này để tránh lỗi.
* **Tuỳ chọn hợp lệ:** group `type=single` phải chọn đúng 1; group `required=true` bắt buộc chọn; mọi lựa chọn phải thuộc options của món. BE luôn lấy `priceModifier` từ DB, KHÔNG tin giá trị FE gửi.
* **Tính tiền:** chỉ BE tính `itemTotal`, `subtotal`, `totalAmount`. FE chỉ hiển thị ước tính; con số chính thức lấy từ response.
* **Sửa đơn:** chỉ khi `status=pending` và là chủ đơn. Khi sửa, BE re-snapshot toàn bộ items theo giá menu hiện hành rồi tính lại tổng. FE phải tải lại đơn sau khi sửa.
* **Đặt hộ:** khách thường → `customerId` ép bằng chính mình. Nhân viên/quản trị → được truyền `customerId` của một user đã tồn tại.

### **8.5.2. State machine & xử lý đơn**

* **Chuyển trạng thái hợp lệ:** pending→{confirmed, cancelled}; confirmed→{preparing, cancelled}; preparing→ready; ready→completed. Bước sai → lỗi `INVALID_STATUS_TRANSITION` (409). FE chỉ hiển thị nút hành động đúng theo trạng thái hiện tại.
* **Huỷ đơn:** chỉ ở pending/confirmed. Đơn đã `paid` khi huỷ → `paymentStatus=refunded`.
* **Hoàn tất:** khi vào `completed`, BE cộng `soldCount` cho từng món đúng một lần (exactly-once) và đặt `completedAt`.
* **Thanh toán:** độc lập với chế biến; không bắt buộc `paid` trước `completed`.
* **Đồng thời (race condition):** mọi thao tác đổi trạng thái dùng cập nhật có điều kiện atomic; nếu trạng thái đã đổi, trả 409 — FE hiển thị thông báo và tải lại đơn.

### **8.5.3. Trạng thái bàn**

* BE tự đồng bộ `occupied`/`available` theo reference-counting đơn đang hoạt động sau mỗi lần tạo/đổi trạng thái/huỷ/hoàn tất đơn. `reserved` do nhân viên đặt thủ công. FE chỉ hiển thị, không tự suy luận trạng thái bàn.

### **8.5.4. Tài khoản & bảo mật**

* **Hiệu lực tức thì:** mỗi request BE nạp user từ DB để lấy `role` mới nhất và chặn tài khoản bị khoá (`ACCOUNT_LOCKED`). Khi bị khoá/đổi quyền, FE sẽ nhận 401/403 và buộc đăng nhập lại.
* **Khoá tài khoản:** không cho tự khoá; không cho khoá/giáng quyền admin đang hoạt động cuối cùng (`LAST_ADMIN`).
* **Email trùng:** đăng ký/đổi email trùng → `EMAIL_TAKEN` (409).

### **8.5.5. Thống kê**

* Doanh thu \= Σ `totalAmount` đơn `completed`, gom theo `completedAt`. Top món bán chạy aggregate từ items đơn `completed`. FE hiển thị đúng theo định nghĩa này để khớp số liệu.

### **8.5.6. Bảng mã lỗi (errorCode) dùng chung**

| errorCode | HTTP | Ý nghĩa |
| :---- | :---- | :---- |
| VALIDATION\_ERROR | 422 | Dữ liệu gửi lên không hợp lệ. |
| UNAUTHORIZED | 401 | Chưa đăng nhập / token sai. |
| ACCOUNT\_LOCKED | 401 | Tài khoản bị khoá. |
| FORBIDDEN | 403 | Không đủ quyền. |
| NOT\_FOUND | 404 | Không tìm thấy tài nguyên. |
| EMAIL\_TAKEN | 409 | Email đã tồn tại. |
| LAST\_ADMIN | 409 | Không thể khoá/giáng admin cuối cùng. |
| PRODUCT\_UNAVAILABLE | 409 | Món không còn bán. |
| TABLE\_INACTIVE | 409 | Bàn không khả dụng. |
| ORDER\_NOT\_EDITABLE | 409 | Đơn không ở trạng thái cho sửa/xoá. |
| INVALID\_STATUS\_TRANSITION | 409 | Bước chuyển trạng thái không hợp lệ. |
| INTERNAL\_ERROR | 500 | Lỗi máy chủ. |

# **9\. Phụ lục — Bảng giá trị enum**

Tổng hợp toàn bộ các giá trị enum dùng trong hệ thống để thống nhất giữa Backend và Frontend.

| Trường | Collection | Giá trị hợp lệ |
| :---- | :---- | :---- |
| role | users | customer · staff · admin |
| status | tables | available · occupied · reserved |
| options\[\].type | products | single · multiple |
| status | orders | pending · confirmed · preparing · ready · completed · cancelled |
| paymentStatus | orders | unpaid · paid · refunded |
| paymentMethod | orders | cash · card · ewallet |

*— Hết tài liệu —*