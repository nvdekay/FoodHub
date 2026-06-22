import { useState } from "react";
import { Plus, Pencil, EyeOff, Eye, BookmarkPlus, BookmarkMinus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Button, Badge, Select, StatusPill, Skeleton, EmptyState, ConfirmDialog } from "../../components/ui";
import { useTables } from "../../hooks/useTables";
import { useUpdateTable, useDeleteTable } from "../../hooks/useAdminTables";
import { TABLE_STATUS } from "../../lib/constants";
import { TABLE_STATUS_CONFIG } from "../../lib/statusConfig";
import { cn } from "../../lib/cn";
import TableFormModal from "../../features/admin-tables/TableFormModal";

export default function AdminTablesPage() {
  const { data: tables = [], isLoading, isError } = useTables();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [toDelete, setToDelete] = useState(null);

  const list = statusFilter ? tables.filter((t) => t.status === statusFilter) : tables;

  const setReserved = (t, reserved) =>
    updateTable.mutate(
      { id: t._id, status: reserved ? "reserved" : "available" },
      {
        onSuccess: () => toast.success(reserved ? "Đã đặt giữ bàn" : "Đã bỏ đặt giữ"),
        onError: (e) => toast.error(e.message || "Thao tác thất bại"),
      }
    );

  const setActive = (t, active) =>
    updateTable.mutate(
      { id: t._id, isActive: active },
      {
        onSuccess: () => toast.success(active ? "Đã hiện lại bàn" : "Đã ẩn bàn"),
        onError: (e) => toast.error(e.message || "Thao tác thất bại"),
      }
    );

  const doDelete = () =>
    deleteTable.mutate(toDelete._id, {
      onSuccess: () => {
        toast.success("Đã ẩn bàn");
        setToDelete(null);
      },
      onError: (e) => {
        // 409 TABLE_HAS_ACTIVE_ORDERS
        toast.error(e.message || "Không thể ẩn bàn");
        setToDelete(null);
      },
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bàn</h1>
          <p className="text-sm text-gray-500">Thêm, sửa bàn & theo dõi trạng thái sử dụng</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Thêm bàn
        </Button>
      </div>

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="sm:max-w-xs"
      >
        <option value="">Tất cả trạng thái</option>
        {TABLE_STATUS.map((s) => (
          <option key={s} value={s}>{TABLE_STATUS_CONFIG[s].label}</option>
        ))}
      </Select>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Không tải được danh sách bàn" description="Vui lòng thử lại sau." />
      ) : list.length === 0 ? (
        <EmptyState title="Không có bàn nào" description="Thêm bàn hoặc đổi bộ lọc trạng thái." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => (
            <Card key={t._id} className={cn("p-4", !t.isActive && "opacity-60")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">Bàn {t.tableNumber}</p>
                  {t.capacity ? (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5" /> {t.capacity} chỗ
                    </p>
                  ) : null}
                </div>
                <StatusPill status={t.status} type="table" />
              </div>

              {!t.isActive && (
                <Badge className="mt-2 bg-gray-100 text-gray-500">Đã ẩn</Badge>
              )}

              <div className="mt-3 flex flex-wrap gap-1 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setEditing(t)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-100"
                >
                  <Pencil className="h-3.5 w-3.5" /> Sửa
                </button>

                {t.status === "available" && (
                  <button
                    onClick={() => setReserved(t, true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-amber-600 transition hover:bg-amber-50"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" /> Đặt giữ
                  </button>
                )}
                {t.status === "reserved" && (
                  <button
                    onClick={() => setReserved(t, false)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-100"
                  >
                    <BookmarkMinus className="h-3.5 w-3.5" /> Bỏ giữ
                  </button>
                )}

                {t.isActive ? (
                  <button
                    onClick={() => setToDelete(t)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                  >
                    <EyeOff className="h-3.5 w-3.5" /> Ẩn
                  </button>
                ) : (
                  <button
                    onClick={() => setActive(t, true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary transition hover:bg-primary/5"
                  >
                    <Eye className="h-3.5 w-3.5" /> Hiện lại
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <TableFormModal
          key={editing?._id || "new"}
          table={editing}
          open
          onClose={() => setEditing(undefined)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={doDelete}
        title="Ẩn bàn"
        message={`Ẩn bàn "${toDelete?.tableNumber}"? Bàn còn đơn đang phục vụ sẽ không thể ẩn.`}
        confirmText="Ẩn bàn"
        loading={deleteTable.isPending}
      />
    </div>
  );
}
