import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, UtensilsCrossed } from "lucide-react";
import { useCategories, useProducts, useInfiniteProducts } from "../hooks/useMenu";
import { useDebounce } from "../hooks/useDebounce";
import { Card, Skeleton, EmptyState, Spinner, Button } from "../components/ui";
import CategoryChips from "../features/menu/CategoryChips";
import ProductCard from "../features/menu/ProductCard";
import ProductDetailModal from "../features/menu/ProductDetailModal";
import MenuHero from "../features/menu/MenuHero";
import CategorySection from "../features/menu/CategorySection";
import ProductGrid from "../features/menu/ProductGrid";

const catOf = (p) => p.categoryId?._id || p.categoryId;

function GridSkeleton() {
  return (
    <ProductGrid>
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="p-3">
          <Skeleton className="h-28 w-full sm:h-32" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </Card>
      ))}
    </ProductGrid>
  );
}

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null); // null = tất cả
  const [selected, setSelected] = useState(null);
  const debounced = useDebounce(search, 350);

  const { data: categories = [] } = useCategories();

  // Đẩy tìm kiếm + lọc danh mục xuống server và tải nối tiếp theo trang (infinite scroll)
  // để duyệt được toàn bộ thực đơn, không bị giới hạn 100 món đầu.
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    limit: 48,
    isAvailable: true,
    search: debounced.trim() || undefined,
    categoryId: activeCat || undefined,
  });
  const all = data?.pages.flatMap((p) => p.data) || [];
  const totalCount = data?.pages[0]?.pagination?.total ?? all.length;

  // Món nổi bật tải riêng (không phụ thuộc thứ tự trang đã cuộn).
  const { data: featuredRes } = useProducts({ isAvailable: true, isFeatured: true, limit: 12 });
  const featured = featuredRes?.data || [];

  const q = debounced.trim().toLowerCase();
  const searching = q.length > 0;

  // Server đã lọc theo search + categoryId; phần dưới chỉ trình bày (phẳng / nhóm).
  const searchResults = all;

  // Nhóm theo danh mục (giữ thứ tự danh mục)
  const groups = categories
    .map((c) => ({ category: c, items: all.filter((p) => catOf(p) === c._id) }))
    .filter((g) => g.items.length > 0);
  const sections = activeCat ? groups.filter((g) => g.category._id === activeCat) : groups;

  // Tự tải trang kế khi cuộn tới cuối danh sách (sentinel + IntersectionObserver).
  const sentinelRef = useRef(null);
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-6">
      <MenuHero search={search} onSearch={setSearch} />

      {/* Chips danh mục — dính khi cuộn (full-bleed theo padding layout) */}
      <div className="sticky top-14 z-20 -mx-4 bg-bg/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <CategoryChips categories={categories} value={activeCat} onChange={setActiveCat} />
      </div>

      {/* Nội dung */}
      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không tải được thực đơn. Vui lòng thử lại.
        </div>
      ) : searching ? (
        searchResults.length ? (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Kết quả cho “{debounced}” ({totalCount})
            </h2>
            <ProductGrid>
              {searchResults.map((p) => (
                <ProductCard key={p._id} product={p} onSelect={setSelected} />
              ))}
            </ProductGrid>
          </section>
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="Không tìm thấy món"
            description={`Không có món nào khớp “${debounced}”. Thử từ khoá khác nhé.`}
          />
        )
      ) : sections.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Chưa có món" description="Thực đơn đang được cập nhật." />
      ) : (
        <div className="space-y-10">
          {/* Món nổi bật — chỉ khi xem tất cả */}
          {!activeCat && featured.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold text-gray-800">Món nổi bật</h2>
              </div>
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {featured.map((p) => (
                  <div key={p._id} className="w-40 flex-shrink-0 sm:w-48">
                    <ProductCard product={p} onSelect={setSelected} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.map((g) => (
            <CategorySection
              key={g.category._id}
              category={g.category}
              items={g.items}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Tải thêm: sentinel tự kích hoạt khi cuộn tới, kèm nút dự phòng + chỉ báo đang tải */}
      {!isLoading && !isError && all.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner className="h-4 w-4" /> Đang tải thêm món...
            </span>
          ) : hasNextPage ? (
            <Button variant="secondary" onClick={loadMore}>
              Xem thêm món
            </Button>
          ) : null}
        </div>
      )}

      <ProductDetailModal
        key={selected?._id}
        product={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
