import { useState } from "react";
import { useCategories, useProducts } from "../hooks/useMenu";
import { useDebounce } from "../hooks/useDebounce";
import CategoryChips from "../features/menu/CategoryChips";
import SearchBar from "../features/menu/SearchBar";
import ProductGrid from "../features/menu/ProductGrid";
import ProductDetailModal from "../features/menu/ProductDetailModal";
import { Pagination } from "../components/ui";

const LIMIT = 12;

export default function MenuPage() {
  const [categoryId, setCategoryId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data: categories = [] } = useCategories();
  const params = {
    page,
    limit: LIMIT,
    ...(categoryId ? { categoryId } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data: res, isLoading, isError } = useProducts(params);
  const products = res?.data || [];
  const pagination = res?.pagination;

  // Đổi bộ lọc -> về trang 1
  const onCategory = (id) => {
    setCategoryId(id);
    setPage(1);
  };
  const onSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Thực đơn</h1>
        <p className="text-sm text-gray-500">Chọn món yêu thích và thêm vào giỏ</p>
      </div>

      <div className="sm:max-w-sm">
        <SearchBar value={search} onChange={onSearch} />
      </div>

      <CategoryChips categories={categories} value={categoryId} onChange={onCategory} />

      <ProductGrid
        products={products}
        isLoading={isLoading}
        isError={isError}
        onSelect={setSelected}
      />

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
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
