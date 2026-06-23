import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui";

/**
 * Bắt lỗi render/lazy-load ở cấp ứng dụng để tránh trắng màn hình.
 * Error boundary bắt buộc là class component (React chưa có bản hook tương đương).
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Giữ log để tiện debug; có thể thay bằng dịch vụ tracking sau này.
    console.error("Lỗi không bắt được:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Đã có lỗi xảy ra</h1>
            <p className="mt-1 text-sm text-gray-500">
              Ứng dụng gặp sự cố ngoài ý muốn. Vui lòng tải lại trang.
            </p>
          </div>
          <Button onClick={this.handleReload}>Tải lại trang</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
