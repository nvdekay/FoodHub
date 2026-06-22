import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Badge, Select, Button, Skeleton, EmptyState, Pagination } from "../../components/ui";
import SearchBar from "../../features/menu/SearchBar";
import { useUsers, useUpdateUserStatus } from "../../hooks/useAdminUsers";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";

const LIMIT = 15;
const ROLES = ["customer", "staff", "admin"];
const ROLE_LABEL = { customer: "Khách", staff: "Nhân viên", admin: "Quản trị" };
const ROLE_BADGE = {
  customer: "bg-gray-100 text-gray-600",
  staff: "bg-blue-100 text-blue-700",
  admin: "bg-primary/10 text-primary",
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const params = {
    page,
    limit: LIMIT,
    ...(role ? { role } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data: res, isLoading, isError } = useUsers(params);
  const users = res?.data || [];
  const pagination = res?.pagination;
  const updateStatus = useUpdateUserStatus();

  const onRole = (v) => {
    setRole(v);
    setPage(1);
  };
  const onSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  const changeRole = (u, newRole) =>
    updateStatus.mutate(
      { id: u._id, role: newRole },
      {
        onSuccess: () => toast.success(`Đã đổi vai trò: ${ROLE_LABEL[newRole]}`),
        onError: (e) => toast.error(e.message || "Đổi vai trò thất bại"),
      }
    );

  const toggleLock = (u) =>
    updateStatus.mutate(
      { id: u._id, isActive: !u.isActive },
      {
        onSuccess: () => toast.success(u.isActive ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản"),
        onError: (e) => toast.error(e.message || "Thao tác thất bại"),
      }
    );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500">Khoá/mở khoá tài khoản & phân quyền</p>
      </div>

      {/* Lọc */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchBar value={search} onChange={onSearch} placeholder="Tìm theo tên, email, SĐT..." />
        </div>
        <Select value={role} onChange={(e) => onRole(e.target.value)} className="sm:max-w-xs">
          <option value="">Tất cả vai trò</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Không tải được danh sách người dùng" description="Vui lòng thử lại sau." />
      ) : users.length === 0 ? (
        <EmptyState title="Không có người dùng" description="Chưa có tài khoản khớp bộ lọc." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">SĐT</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === me?._id;
                return (
                  <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {u.fullName}
                      {isSelf && <span className="ml-1 text-xs text-gray-400">(bạn)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <Badge className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                          disabled={updateStatus.isPending}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Đã khoá</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant={u.isActive ? "danger" : "secondary"}
                          disabled={isSelf || updateStatus.isPending}
                          onClick={() => toggleLock(u)}
                        >
                          {u.isActive ? (
                            <><Lock className="h-3.5 w-3.5" /> Khoá</>
                          ) : (
                            <><Unlock className="h-3.5 w-3.5" /> Mở khoá</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      )}
    </div>
  );
}
