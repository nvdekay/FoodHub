import { UtensilsCrossed } from "lucide-react";
import { Card, Skeleton, EmptyState } from "../../components/ui";
import ProductCard from "./ProductCard";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="p-3">
          <Skeleton className="h-28 w-full sm:h-32" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, isLoading, isError, onSelect }) {
  if (isLoading) return <GridSkeleton />;

  if (isError)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Không tải được thực đơn. Vui lòng thử lại.
      </div>
    );

  if (!products?.length)
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="Không có món nào"
        description="Thử đổi danh mục hoặc từ khoá tìm kiếm khác."
      />
    );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onSelect={onSelect} />
      ))}
    </div>
  );
}
