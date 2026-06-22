import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Button, Badge, Skeleton, EmptyState, ConfirmDialog } from "../../components/ui";
import { useCategories } from "../../hooks/useMenu";
import { useDeleteCategory } from "../../hooks/useAdminMenu";
import CategoryFormModal from "../../features/admin-menu/CategoryFormModal";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories({ all: true });
  const deleteCat = useDeleteCategory();
  const [editing, setEditing] = useState(undefined); // undefined=đóng, null=thêm mới, obj=sửa
  const [toDelete, setToDelete] = useState(null);

  const doDelete = () =>
    deleteCat.mutate(toDelete._id, {
      onSuccess: (res) => {
        toast.success(res?.softDeleted ? "Đã ẩn danh mục (còn món)" : "Đã xoá danh mục");
        setToDelete(null);
      },
      onError: (e) => {
        toast.error(e.message || "Xoá thất bại");
        setToDelete(null);
      },
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500">Thêm, sửa, ẩn danh mục thực đơn</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Không tải được danh mục" description="Vui lòng thử lại sau." />
      ) : categories.length === 0 ? (
        <EmptyState title="Chưa có danh mục" description="Tạo danh mục đầu tiên để phân loại món." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Tên</th>
                <th className="px-4 py-3 font-medium">Mô tả</th>
                <th className="px-4 py-3 font-medium">Thứ tự</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{c.description || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.displayOrder}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <Badge className="bg-green-100 text-green-700">Hiển thị</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">Đã ẩn</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setToDelete(c)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Xoá"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editing !== undefined && (
        <CategoryFormModal
          key={editing?._id || "new"}
          category={editing}
          open
          onClose={() => setEditing(undefined)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={doDelete}
        title="Xoá danh mục"
        message={`Xoá danh mục "${toDelete?.name}"? Nếu còn món, danh mục sẽ được ẩn thay vì xoá hẳn.`}
        confirmText="Xoá"
        loading={deleteCat.isPending}
      />
    </div>
  );
}
