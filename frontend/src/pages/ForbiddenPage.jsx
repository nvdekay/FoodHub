import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-center">
      <p className="text-6xl font-bold text-red-500">403</p>
      <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
      <Link to="/">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  );
}
