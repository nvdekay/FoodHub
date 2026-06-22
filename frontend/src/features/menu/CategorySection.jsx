import { categoryImage } from "../../lib/categoryImages";
import ProductCard from "./ProductCard";

/** Một section danh mục: header (ảnh + tên + số món) + lưới món. */
export default function CategorySection({ category, items, onSelect }) {
  const img = categoryImage(category.name);

  return (
    <section className="scroll-mt-28">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-primary/10">
          {img ? (
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🍵</div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-800">{category.name}</h2>
          <p className="truncate text-xs text-gray-500">
            {items.length} món{category.description ? ` · ${category.description}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
