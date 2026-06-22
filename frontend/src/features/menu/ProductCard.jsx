import { Plus, Star } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { formatVND } from "../../lib/format";

/** Ảnh món với fallback khi không có imageUrl. */
function ProductImage({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="h-28 w-full rounded-lg object-cover sm:h-32"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex h-28 w-full items-center justify-center rounded-lg bg-primary/10 text-3xl sm:h-32">
      🍵
    </div>
  );
}

export default function ProductCard({ product, onSelect }) {
  const hasExtra = product.options?.some((g) => g.choices?.some((c) => c.priceModifier > 0));

  return (
    <Card className="flex flex-col overflow-hidden p-3 transition hover:shadow-md">
      <button onClick={() => onSelect(product)} className="text-left">
        <div className="relative">
          <ProductImage src={product.imageUrl} name={product.name} />
          {product.isFeatured && (
            <Badge className="absolute left-2 top-2 bg-accent/90 text-white">
              <Star className="mr-0.5 h-3 w-3" /> Nổi bật
            </Badge>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</h3>
      </button>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-bold text-primary">
          {hasExtra ? "từ " : ""}
          {formatVND(product.basePrice)}
        </span>
        <button
          onClick={() => onSelect(product)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
          aria-label={`Thêm ${product.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
