// Ảnh nền/đại diện (Unsplash CDN) cho trang thực đơn.
// Khớp theo tên danh mục; không khớp -> null (UI dùng fallback gradient/icon).

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80";

const CATEGORY_MAP = {
  "cà phê": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
  "trà sữa": "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80",
  "trà trái cây": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
  "nước ép": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
  "đồ ăn vặt": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
  "bánh ngọt": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
};

export const categoryImage = (name = "") => CATEGORY_MAP[name.trim().toLowerCase()] || null;
