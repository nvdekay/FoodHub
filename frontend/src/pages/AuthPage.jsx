import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import * as authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/navigation";
import { Button, Input, PasswordInput } from "../components/ui";
import { cn } from "../lib/cn";

const loginSchema = z.object({
  email: z.string().min(1, "Nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

const registerSchema = z
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

/**
 * Trang xác thực split-screen: ảnh thương hiệu + form.
 * Login ↔ Register chuyển bằng tab (pill trượt) + hiệu ứng trượt form.
 */
export default function AuthPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRegister = pathname.startsWith("/register");
  const mode = isRegister ? "register" : "login";

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(registerSchema) });

  const loginMut = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data);
      toast.success("Đăng nhập thành công");
      navigate(homePathForRole(data.user.role), { replace: true });
    },
    onError: (e) => toast.error(e.message || "Đăng nhập thất bại"),
  });

  const registerMut = useMutation({
    mutationFn: ({ fullName, email, phone, password }) =>
      authApi.register({ fullName, email, phone, password }),
    onSuccess: (data) => {
      login(data);
      toast.success("Đăng ký thành công");
      navigate(homePathForRole(data.user.role), { replace: true });
    },
    onError: (e) => toast.error(e.message || "Đăng ký thất bại"),
  });

  if (isAuthenticated) return <Navigate to={homePathForRole(user?.role)} replace />;

  // Đổi tab: điều hướng route (AuthPage giữ nguyên instance nên pill + form vẫn trượt mượt)
  const switchTo = (m) => navigate(m === "register" ? "/register" : "/login");

  return (
    <div className="flex min-h-screen">
      {/* Ảnh thương hiệu (ẩn trên mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="/auth/Login.jpg"
          alt="FoodHub"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-black/45 to-black/25" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl">🍵</span> FoodHub
          </Link>
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold leading-tight drop-shadow">
              Đặt món tại quán,
              <br />
              nhanh &amp; dễ dàng.
            </h2>
            <p className="mt-4 max-w-sm text-white/85">
              Cà phê, trà sữa, món ngon — chọn món, đặt bàn và theo dõi đơn ngay trên điện thoại.
            </p>
          </div>
          <p className="text-sm text-white/60">© 2026 FoodHub · Hệ thống quản lý đặt món</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
              <span className="text-3xl">🍵</span> FoodHub
            </Link>
          </div>

          {/* Tab switcher với pill trượt */}
          <div className="relative mb-7 flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
            <span
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out",
                isRegister && "translate-x-full"
              )}
            />
            <button
              onClick={() => switchTo("login")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 transition-colors",
                !isRegister ? "text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => switchTo("register")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 transition-colors",
                isRegister ? "text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Đăng ký
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {isRegister ? "Tạo tài khoản" : "Chào mừng trở lại 👋"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isRegister ? "Đăng ký để bắt đầu đặt món" : "Đăng nhập để tiếp tục đặt món"}
            </p>
          </div>

          {/* Vùng form có animation trượt theo hướng */}
          <div key={mode} className={isRegister ? "animate-auth-right" : "animate-auth-left"}>
            {isRegister ? (
              <form
                onSubmit={registerForm.handleSubmit((v) => registerMut.mutate(v))}
                className="space-y-4"
              >
                <Input
                  label="Họ tên"
                  placeholder="Nguyễn Văn A"
                  error={registerForm.formState.errors.fullName?.message}
                  {...registerForm.register("fullName")}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register("email")}
                />
                <Input
                  label="Số điện thoại"
                  placeholder="0912345678"
                  error={registerForm.formState.errors.phone?.message}
                  {...registerForm.register("phone")}
                />
                <PasswordInput
                  label="Mật khẩu"
                  placeholder="••••••"
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register("password")}
                />
                <PasswordInput
                  label="Nhập lại mật khẩu"
                  placeholder="••••••"
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register("confirmPassword")}
                />
                <Button type="submit" size="lg" className="w-full" loading={registerMut.isPending}>
                  Đăng ký
                </Button>
              </form>
            ) : (
              <form
                onSubmit={loginForm.handleSubmit((v) => loginMut.mutate(v))}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email")}
                />
                <PasswordInput
                  label="Mật khẩu"
                  placeholder="••••••"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register("password")}
                />
                <Button type="submit" size="lg" className="w-full" loading={loginMut.isPending}>
                  Đăng nhập
                </Button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isRegister ? (
              <>
                Đã có tài khoản?{" "}
                <button
                  onClick={() => switchTo("login")}
                  className="font-medium text-primary hover:underline"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <>
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => switchTo("register")}
                  className="font-medium text-primary hover:underline"
                >
                  Đăng ký ngay
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
