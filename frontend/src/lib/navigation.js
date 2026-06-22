/** Trang chủ theo vai trò sau khi đăng nhập. */
export const homePathForRole = (role) => (role === "customer" ? "/" : "/admin");
