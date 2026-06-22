import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as userApi from "../api/userApi";

/** Danh sách người dùng (admin) — phân trang, lọc role, tìm kiếm. */
export const useUsers = (params) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.listUsers(params),
    placeholderData: keepPreviousData,
  });

/** Khoá/mở khoá hoặc đổi vai trò. */
export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => userApi.updateUserStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};
