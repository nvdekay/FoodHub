import { useState } from "react";
import { Plus, Pencil, EyeOff, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  Button,
  Badge,
  Select,
  Skeleton,
  EmptyState,
  Pagination,
  ConfirmDialog,
} from "../../components/ui";
import SearchBar from "../../features/menu/SearchBar";
import { useCategories, useProducts } from "../../hooks/useMenu";
import { useDeleteProduct } from "../../hooks/useAdminMenu";
import { useDebounce } from "../../hooks/useDebounce";
import { formatVND } from "../../lib/format";
import ProductFormModal from "../../features/admin-menu/ProductFormModal";

const LIMIT = 12;

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(undefined);
  const [toDelete, setToDelete] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data: categories = [] } = useCategories({ all: true });

  const params = {
    page,
    limit: LIMIT,
    ...(categoryId ? { categoryId } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data: res, isLoading, isError } = useProducts(params);
  const products = res?.data || [];
  const pagination = res?.pagination;
  const deletePro = useDeleteProduct();

  const onSearch = (v) => {
    setSearch(v);
    setPage(1);
  };
  const onCategory = (v) => {
    setCategoryId(v);
    setPage(1);
  };

  const doDelete = () =>
    deletePro.mutate(toDelete._id, {
      onSuccess: () => {
        toast.success("Đã ẩn món");
        setToDelete(null);
      },
      onError: (e) => {
        toast.error(e.message || "Thao tác thất bại");
        setToDelete(null);
      },
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý món</h1>
          <p className="text-sm text-gray-500">Thêm, sửa, ẩn món & cấu hình tuỳ chọn</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Thêm món
        </Button>
      </div>

      {/* Lọc */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchBar value={search} onChange={onSearch} />
        </div>
        <Select value={categoryId} onChange={(e) => onCategory(e.target.value)} className="sm:max-w-xs">
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Không tải được danh sách món" description="Vui lòng thử lại sau." />
      ) : products.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Không có món nào" description="Chưa có món khớp bộ lọc." />
      ) : (
        <>
          {/* Mobile/tablet: danh sách thẻ */}
          <div className="space-y-3 lg:hidden">
            {products.map((p) => (
              <Card key={p._id} className="flex items-center gap-3 p-3">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                    <UtensilsCrossed className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-800">{p.name}</p>
                  <p className="truncate text-xs text-gray-500">{p.categoryId?.name || "—"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-primary">{formatVND(p.basePrice)}</span>
                    {p.isAvailable ? (
                      <Badge className="bg-green-100 text-green-700">Còn bán</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">Đã ẩn</Badge>
                    )}
                    {p.isFeatured && <Badge className="bg-lime-100 text-lime-700">Nổi bật</Badge>}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col gap-1">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                    aria-label="Sửa"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setToDelete(p)}
                    disabled={!p.isAvailable}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Ẩn món"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Laptop/PC: bảng */}
          <Card className="hidden overflow-x-auto p-0 lg:block">
            <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Món</th>
                <th className="px-4 py-3 font-medium">Danh mục</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                          <UtensilsCrossed className="h-4 w-4" />
                        </span>
                      )}
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.categoryId?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatVND(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isAvailable ? (
                        <Badge className="bg-green-100 text-green-700">Còn bán</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500">Đã ẩn</Badge>
                      )}
                      {p.isFeatured && <Badge className="bg-lime-100 text-lime-700">Nổi bật</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setToDelete(p)}
                        disabled={!p.isAvailable}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Ẩn món"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </Card>
        </>
      )}

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      )}

      {editing !== undefined && (
        <ProductFormModal
          key={editing?._id || "new"}
          product={editing}
          categories={categories}
          open
          onClose={() => setEditing(undefined)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={doDelete}
        title="Ẩn món"
        message={`Ẩn món "${toDelete?.name}"? Món sẽ không hiển thị với khách (có thể bật lại khi sửa).`}
        confirmText="Ẩn món"
        loading={deletePro.isPending}
      />
    </div>
  );
}
