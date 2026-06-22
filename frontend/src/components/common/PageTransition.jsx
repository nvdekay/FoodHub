import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Bọc nội dung trang để chạy hiệu ứng trượt-mờ mỗi khi đổi route,
 * đồng thời cuộn về đầu trang cho trải nghiệm mượt.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page">
      {children}
    </div>
  );
}
