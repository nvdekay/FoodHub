import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Card, Input, Button, Skeleton } from "../components/ui";
import { useMe, useUpdateProfile } from "../hooks/useProfile";
import { useAuth } from "../context/AuthContext";

const profileSchema = z.object({
  fullName: z.string().min(1, "Nhập họ tên"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu 0)"),
  avatarUrl: z.string().trim().url("Link ảnh không hợp lệ").or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu mới"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const { updateUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: me?.fullName || "",
      phone: me?.phone || "",
      avatarUrl: me?.avatarUrl || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Đồng bộ tên header khi me tải xong (phòng khi context cũ)
  useEffect(() => {
    if (me) updateUser({ ...me });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?._id]);

  const onSaveProfile = (v) => {
    updateProfile.mutate(
      { fullName: v.fullName, phone: v.phone, avatarUrl: v.avatarUrl || null },
      {
        onSuccess: (data) => {
          updateUser({ ...data });
          toast.success("Cập nhật hồ sơ thành công");
        },
        onError: (e) => toast.error(e.message || "Cập nhật thất bại"),
      }
    );
  };

  const onChangePassword = (v) => {
    updateProfile.mutate(
      { currentPassword: v.currentPassword, newPassword: v.newPassword },
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công");
          passwordForm.reset();
        },
        onError: (e) => toast.error(e.message || "Đổi mật khẩu thất bại"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ</h1>
        <p className="text-sm text-gray-500">Quản lý thông tin cá nhân & mật khẩu</p>
      </div>

      {/* Thông tin cá nhân */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-4">
          {me?.avatarUrl ? (
            <img
              src={me.avatarUrl}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {me?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-800">{me?.fullName}</p>
            <p className="truncate text-sm text-gray-500">{me?.email}</p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <Input label="Họ tên" error={profileForm.formState.errors.fullName?.message} {...profileForm.register("fullName")} />
          <Input label="Số điện thoại" error={profileForm.formState.errors.phone?.message} {...profileForm.register("phone")} />
          <Input
            label="Link ảnh đại diện"
            placeholder="https://..."
            error={profileForm.formState.errors.avatarUrl?.message}
            {...profileForm.register("avatarUrl")}
          />
          <p className="text-xs text-gray-400">Email không thể thay đổi.</p>
          <div className="flex justify-end">
            <Button type="submit" loading={updateProfile.isPending}>
              Lưu hồ sơ
            </Button>
          </div>
        </form>
      </Card>

      {/* Đổi mật khẩu */}
      <Card className="space-y-4 p-5">
        <h2 className="font-semibold text-gray-800">Đổi mật khẩu</h2>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <Input
            label="Nhập lại mật khẩu mới"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" loading={updateProfile.isPending}>
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
