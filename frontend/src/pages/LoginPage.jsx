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

const schema = z.object({
  email: z.string().min(1, "Nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data);
      toast.success("Đăng nhập thành công");
      navigate(homePathForRole(data.user.role), { replace: true });
    },
    onError: (err) => toast.error(err.message || "Đăng nhập thất bại"),
  });

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại 👋"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Đăng nhập
        </Button>
      </form>
    </AuthLayout>
  );
}
