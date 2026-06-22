import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userApi from "../api/userApi";

/** Hồ sơ người dùng hiện tại. */
export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: userApi.getMe,
    staleTime: 60 * 1000,
  });

/** Cập nhật hồ sơ và/hoặc đổi mật khẩu. */
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: (data) => qc.setQueryData(["me"], data),
  });
};
