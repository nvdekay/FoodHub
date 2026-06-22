import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/navigation";
import AuthLayout from "../components/layout/AuthLayout";
import { Button, Input } from "../components/ui";

const schema = z
  .object({
    fullName: z.string().min(1, "Nhập họ tên"),
    email: z.string().min(1, "Nhập email").email("Email không hợp lệ"),
    phone: z.string().regex(/^0\d{9}$/, "SĐT không hợp lệ (10 số, bắt đầu bằng 0)"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ fullName, email, phone, password }) =>
      authApi.register({ fullName, email, phone, password }),
    onSuccess: (data) => {
      login(data); // tự đăng nhập sau khi đăng ký
      toast.success("Đăng ký thành công");
      navigate(homePathForRole(data.user.role), { replace: true });
    },
    onError: (err) => toast.error(err.message || "Đăng ký thất bại"),
  });

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký để bắt đầu đặt món"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Input label="Họ tên" placeholder="Nguyễn Văn A" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email" type="email" placeholder="email@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Số điện thoại" placeholder="0912345678" error={errors.phone?.message} {...register("phone")} />
        <Input label="Mật khẩu" type="password" placeholder="••••••" error={errors.password?.message} {...register("password")} />
        <Input label="Nhập lại mật khẩu" type="password" placeholder="••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Đăng ký
        </Button>
      </form>
    </AuthLayout>
  );
}
