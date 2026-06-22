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
  ]);
  console.log("👤 Đã tạo 4 tài khoản (admin/staff/2 customer)");

  // 3) Danh mục
  const catData = [
    { name: "Cà phê", description: "Cà phê pha phin, pha máy", displayOrder: 1 },
    { name: "Trà sữa", description: "Trà sữa & topping", displayOrder: 2 },
    { name: "Nước ép", description: "Nước ép trái cây tươi", displayOrder: 3 },
    { name: "Đồ ăn vặt", description: "Bánh, snack", displayOrder: 4 },
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

  // 5) Món
  const productData = [
    { name: "Cà phê đen", category: "Cà phê", basePrice: 20000, options: [sizeOption], isFeatured: true, preparationTime: 3 },
    { name: "Cà phê sữa", category: "Cà phê", basePrice: 25000, options: [sizeOption], preparationTime: 3 },
    { name: "Bạc xỉu", category: "Cà phê", basePrice: 30000, options: [sizeOption, sugarOption], preparationTime: 4 },
    { name: "Trà sữa trân châu đường đen", category: "Trà sữa", basePrice: 35000, options: [sizeOption, toppingOption, sugarOption], isFeatured: true, preparationTime: 5 },
    { name: "Trà sữa matcha", category: "Trà sữa", basePrice: 38000, options: [sizeOption, toppingOption, sugarOption], preparationTime: 5 },
    { name: "Nước ép cam", category: "Nước ép", basePrice: 30000, options: [sizeOption], preparationTime: 4 },
    { name: "Nước ép dưa hấu", category: "Nước ép", basePrice: 28000, options: [sizeOption], preparationTime: 4 },
    { name: "Bánh flan", category: "Đồ ăn vặt", basePrice: 15000, options: [], preparationTime: 1 },
    { name: "Khoai tây chiên", category: "Đồ ăn vặt", basePrice: 25000, options: [], preparationTime: 6 },
  ];
  const products = await Product.create(
    productData.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      categoryId: catBy[p.category]._id,
      basePrice: p.basePrice,
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
  console.log("  • admin@foodhub.com     (admin)");
  console.log("  • staff@foodhub.com     (staff)");
  console.log("  • customer@foodhub.com  (customer)");
  console.log("──────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed lỗi:", err);
  process.exit(1);
});
