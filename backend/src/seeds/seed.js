import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Table from "../models/Table.js";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";
import slugify from "../utils/slugify.js";

const PASSWORD = "123456"; // mật khẩu chung cho tài khoản mẫu

const run = async () => {
  await connectDB();
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // 1) Dọn dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Table.deleteMany({}),
    Order.deleteMany({}),
    Counter.deleteMany({}),
  ]);
  console.log("🧹 Đã xoá dữ liệu cũ");

  // 2) Người dùng
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const [admin] = await User.create([
    { fullName: "Quản Trị Viên", email: "admin@foodhub.com", phone: "0900000001", passwordHash, role: "admin" },
    { fullName: "Nhân Viên A", email: "staff@foodhub.com", phone: "0900000002", passwordHash, role: "staff" },
    { fullName: "Nguyễn Văn A", email: "customer@foodhub.com", phone: "0912345678", passwordHash, role: "customer" },
    { fullName: "Trần Thị B", email: "customer2@foodhub.com", phone: "0987654321", passwordHash, role: "customer" },
    // Tài khoản test tiện dụng (gmail) — cùng mật khẩu chung
    { fullName: "Admin Gmail", email: "admin@gmail.com", phone: "0900000003", passwordHash, role: "admin" },
    { fullName: "Staff Gmail", email: "staff@gmail.com", phone: "0900000004", passwordHash, role: "staff" },
    { fullName: "User Gmail", email: "user@gmail.com", phone: "0900000005", passwordHash, role: "customer" },
  ]);
  console.log("👤 Đã tạo 7 tài khoản (2 admin/2 staff/3 customer)");

  // 3) Danh mục
  const catData = [
    { name: "Cà phê", description: "Cà phê pha phin, pha máy", displayOrder: 1 },
    { name: "Trà sữa", description: "Trà sữa & topping", displayOrder: 2 },
    { name: "Trà trái cây", description: "Trà hoa quả tươi mát", displayOrder: 3 },
    { name: "Nước ép", description: "Nước ép trái cây tươi", displayOrder: 4 },
    { name: "Đồ ăn vặt", description: "Bánh, snack, gà rán", displayOrder: 5 },
    { name: "Bánh ngọt", description: "Bánh ngọt & tráng miệng", displayOrder: 6 },
  ];
  const categories = await Category.create(
    catData.map((c) => ({ ...c, slug: slugify(c.name), isActive: true }))
  );
  const catBy = Object.fromEntries(categories.map((c) => [c.name, c]));
  console.log(`📂 Đã tạo ${categories.length} danh mục`);

  // 4) Tuỳ chọn dùng lại
  const sizeOption = {
    name: "Size",
    type: "single",
    required: true,
    choices: [
      { label: "Size M", priceModifier: 0 },
      { label: "Size L", priceModifier: 5000 },
    ],
  };
  const toppingOption = {
    name: "Topping",
    type: "multiple",
    required: false,
    choices: [
      { label: "Trân châu", priceModifier: 5000 },
      { label: "Pudding", priceModifier: 7000 },
      { label: "Thạch", priceModifier: 4000 },
    ],
  };
  const sugarOption = {
    name: "Mức đường",
    type: "single",
    required: false,
    choices: [
      { label: "100%", priceModifier: 0 },
      { label: "70%", priceModifier: 0 },
      { label: "50%", priceModifier: 0 },
    ],
  };
  const iceOption = {
    name: "Mức đá",
    type: "single",
    required: false,
    choices: [
      { label: "100% đá", priceModifier: 0 },
      { label: "70% đá", priceModifier: 0 },
      { label: "50% đá", priceModifier: 0 },
      { label: "Không đá", priceModifier: 0 },
    ],
  };

  // 5) Món
  const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
  const productData = [
    // ── Cà phê ──
    { name: "Cà phê đen", category: "Cà phê", basePrice: 20000, options: [sizeOption, iceOption], isFeatured: true, preparationTime: 3, imageUrl: img("photo-1514432324607-a09d9b4aefdd") },
    { name: "Cà phê sữa", category: "Cà phê", basePrice: 25000, options: [sizeOption, iceOption], preparationTime: 3, imageUrl: img("photo-1461023058943-07fcbe16d735") },
    { name: "Bạc xỉu", category: "Cà phê", basePrice: 30000, options: [sizeOption, sugarOption, iceOption], preparationTime: 4, imageUrl: img("photo-1572442388796-11668a67e53d") },
    { name: "Espresso", category: "Cà phê", basePrice: 25000, options: [], preparationTime: 2, imageUrl: img("photo-1517701550927-30cf4ba1dba5") },
    { name: "Americano", category: "Cà phê", basePrice: 30000, options: [sizeOption, iceOption], preparationTime: 3, imageUrl: img("photo-1568649929103-28ffbefaca1e") },
    { name: "Cappuccino", category: "Cà phê", basePrice: 35000, options: [sizeOption], isFeatured: true, preparationTime: 4, imageUrl: img("photo-1521302080334-4bebac2763a6") },
    { name: "Cà phê Latte", category: "Cà phê", basePrice: 40000, options: [sizeOption, sugarOption], preparationTime: 4, imageUrl: img("photo-1494314671902-399b18174975") },
    { name: "Caramel Macchiato", category: "Cà phê", basePrice: 45000, options: [sizeOption, sugarOption], isFeatured: true, preparationTime: 5, imageUrl: img("photo-1510707577719-ae7c14805e3a") },
    { name: "Cold Brew", category: "Cà phê", basePrice: 38000, options: [sizeOption, iceOption], preparationTime: 3, imageUrl: img("photo-1534778101976-62847782c213") },

    // ── Trà sữa ──
    { name: "Trà sữa trân châu đường đen", category: "Trà sữa", basePrice: 35000, options: [sizeOption, toppingOption, sugarOption, iceOption], isFeatured: true, preparationTime: 5, imageUrl: img("photo-1558857563-b371033873b8") },
    { name: "Trà sữa matcha", category: "Trà sữa", basePrice: 38000, options: [sizeOption, toppingOption, sugarOption, iceOption], preparationTime: 5, imageUrl: img("photo-1536256263959-770b48d82b0a") },
    { name: "Trà sữa truyền thống", category: "Trà sữa", basePrice: 30000, options: [sizeOption, toppingOption, sugarOption, iceOption], preparationTime: 4, imageUrl: img("photo-1571091718767-18b5b1457add") },
    { name: "Trà sữa khoai môn", category: "Trà sữa", basePrice: 35000, options: [sizeOption, toppingOption, sugarOption, iceOption], preparationTime: 5, imageUrl: img("photo-1546173159-315724a31696") },
    { name: "Hồng trà sữa", category: "Trà sữa", basePrice: 32000, options: [sizeOption, toppingOption, sugarOption, iceOption], preparationTime: 4, imageUrl: img("photo-1525385133512-2f3bdd039054") },
    { name: "Trà sữa socola", category: "Trà sữa", basePrice: 35000, options: [sizeOption, toppingOption, sugarOption, iceOption], preparationTime: 5, imageUrl: img("photo-1558961363-fa8fdf82db35") },

    // ── Trà trái cây ──
    { name: "Trà đào cam sả", category: "Trà trái cây", basePrice: 35000, options: [sizeOption, sugarOption, iceOption], isFeatured: true, preparationTime: 4, imageUrl: img("photo-1597318181409-cf64d0b5d8a2") },
    { name: "Trà vải", category: "Trà trái cây", basePrice: 33000, options: [sizeOption, sugarOption, iceOption], preparationTime: 4, imageUrl: img("photo-1499638673689-79a0b5115d87") },
    { name: "Trà chanh giã tay", category: "Trà trái cây", basePrice: 28000, options: [sizeOption, sugarOption, iceOption], preparationTime: 3, imageUrl: img("photo-1622543925917-763c34d1a86e") },

    // ── Nước ép ──
    { name: "Nước ép cam", category: "Nước ép", basePrice: 30000, options: [sizeOption, iceOption], preparationTime: 4, imageUrl: img("photo-1613478223719-2ab802602423") },
    { name: "Nước ép dưa hấu", category: "Nước ép", basePrice: 28000, options: [sizeOption, iceOption], preparationTime: 4, imageUrl: img("photo-1622597467836-f3285f2131b8") },
    { name: "Nước ép táo", category: "Nước ép", basePrice: 30000, options: [sizeOption, iceOption], preparationTime: 4, imageUrl: img("photo-1505252585461-04db1eb84625") },
    { name: "Nước ép dứa", category: "Nước ép", basePrice: 30000, options: [sizeOption, iceOption], preparationTime: 4, imageUrl: img("photo-1638176066666-ffb2f013c7dd") },
    { name: "Nước ép cà rốt", category: "Nước ép", basePrice: 28000, options: [sizeOption, iceOption], preparationTime: 4, imageUrl: img("photo-1502741224143-90386d7f8c82") },

    // ── Đồ ăn vặt ──
    { name: "Bánh flan", category: "Đồ ăn vặt", basePrice: 15000, options: [], preparationTime: 1, imageUrl: img("photo-1488477181946-6428a0291777") },
    { name: "Khoai tây chiên", category: "Đồ ăn vặt", basePrice: 25000, options: [], preparationTime: 6, imageUrl: img("photo-1630384060421-cb20d0e0649d") },
    { name: "Gà rán giòn", category: "Đồ ăn vặt", basePrice: 45000, options: [], isFeatured: true, preparationTime: 8, imageUrl: img("photo-1606755962773-d324e0a13086") },
    { name: "Xúc xích nướng", category: "Đồ ăn vặt", basePrice: 25000, options: [], preparationTime: 6, imageUrl: img("photo-1619881590738-a111d176d906") },
    { name: "Bánh mì que", category: "Đồ ăn vặt", basePrice: 15000, options: [], preparationTime: 3, imageUrl: img("photo-1521305916504-4a1121188589") },

    // ── Bánh ngọt ──
    { name: "Bánh phô mai", category: "Bánh ngọt", basePrice: 35000, options: [], isFeatured: true, preparationTime: 1, imageUrl: img("photo-1551024601-bec78aea704b") },
    { name: "Croissant bơ", category: "Bánh ngọt", basePrice: 25000, options: [], preparationTime: 1, imageUrl: img("photo-1486427944299-d1955d23e34d") },
    { name: "Bánh su kem", category: "Bánh ngọt", basePrice: 20000, options: [], preparationTime: 1, imageUrl: img("photo-1578985545062-69928b1d9587") },
  ];
  const products = await Product.create(
    productData.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      categoryId: catBy[p.category]._id,
      basePrice: p.basePrice,
      imageUrl: p.imageUrl,
      options: p.options,
      isAvailable: true,
      isFeatured: p.isFeatured || false,
      preparationTime: p.preparationTime,
      soldCount: 0,
    }))
  );
  console.log(`🍹 Đã tạo ${products.length} món`);

  // 6) Bàn
  const tables = await Table.create(
    ["B01", "B02", "B03", "B04", "B05", "B06"].map((n, i) => ({
      tableNumber: n,
      capacity: i % 2 === 0 ? 4 : 2,
      status: "available",
      isActive: true,
    }))
  );
  console.log(`🪑 Đã tạo ${tables.length} bàn`);

  console.log("\n✅ Seed hoàn tất!");
  console.log("──────────────────────────────");
  console.log("Tài khoản mẫu (mật khẩu chung: " + PASSWORD + ")");
  console.log("  • admin@foodhub.com     (admin)   • admin@gmail.com  (admin)");
  console.log("  • staff@foodhub.com     (staff)   • staff@gmail.com  (staff)");
  console.log("  • customer@foodhub.com  (customer) • user@gmail.com  (customer)");
  console.log("──────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed lỗi:", err);
  process.exit(1);
});
