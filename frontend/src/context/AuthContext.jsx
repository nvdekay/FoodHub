import { createContext, useContext, useEffect, useState } from "react";

const TOKEN_KEY = "foodhub_token";
const USER_KEY = "foodhub_user";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong <AuthProvider>");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // localStorage có thể chứa JSON hỏng (ghi dở, bản cũ, sửa tay). Nếu parse lỗi
    // thì coi như chưa đăng nhập thay vì để app trắng màn hình ngay khi khởi tạo.
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = ({ user: u, token: t }) => {
    setUser(u);
    setToken(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Phiên hết hạn (axiosClient bắt 401) phát "foodhub:unauthorized" → đăng xuất mềm.
  // Clear state ngay trong tab hiện tại; ProtectedRoute sẽ tự điều hướng về /login,
  // không cần reload toàn trang nên không mất state/form đang nhập ở trang công khai.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener("foodhub:unauthorized", onUnauthorized);
    return () => window.removeEventListener("foodhub:unauthorized", onUnauthorized);
  }, []);

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isCustomer: user?.role === "customer",
    isStaff: user?.role === "staff" || user?.role === "admin",
    isAdmin: user?.role === "admin",
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
