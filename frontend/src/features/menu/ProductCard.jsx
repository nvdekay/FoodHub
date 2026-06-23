import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { formatVND } from "../../lib/format";

/** Ảnh món với fallback khi không có imageUrl hoặc ảnh lỗi. */
function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-28 w-full items-center justify-center bg-primary/10 text-3xl transition-transform duration-300 group-hover:scale-105 sm:h-32">
        🍵
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-32"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductCard({ product, onSelect }) {
  const hasExtra = product.options?.some((g) => g.choices?.some((c) => c.priceModifier > 0));

  return (
    <Card className="group cursor-pointer overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Toàn bộ thẻ là một vùng bấm duy nhất (bỏ vùng chết, tránh nút lồng nút) */}
      <button onClick={() => onSelect(product)} className="flex h-full w-full flex-col p-3 text-left">
        <div className="relative overflow-hidden rounded-lg">
          <ProductImage src={product.imageUrl} name={product.name} />
          {product.isFeatured && (
            <Badge className="absolute left-2 top-2 bg-accent/90 text-white">
              <Star className="mr-0.5 h-3 w-3" /> Nổi bật
            </Badge>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-primary">
            {hasExtra ? "từ " : ""}
            {formatVND(product.basePrice)}
          </span>
          {/* Affordance trang trí — hành động thật do cả thẻ đảm nhận */}
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition group-hover:bg-primary-dark"
            aria-hidden="true"
          >
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </button>
    </Card>
  );
}
