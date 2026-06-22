import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Coffee } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  StatusPill,
  Spinner,
  Skeleton,
  EmptyState,
  Modal,
  Pagination,
} from "../components/ui";
import { formatVND, formatDate } from "../lib/format";
import { ORDER_STATUS } from "../lib/constants";

/** Khối section dùng lại trong trang demo. */
function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <Card className="p-5">{children}</Card>
    </section>
  );
}

/** Trang demo design system (F0) — tạm thời để kiểm tra component & tokens. */
export default function DesignSystemPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">FoodHub — Design System</h1>
        <p className="text-sm text-gray-500">
          Trang demo (Phase F0). Sẽ thay bằng trang Menu ở Phase F2.
        </p>
      </div>

      <Section title="Bảng màu">
        <div className="flex flex-wrap gap-3">
          {[
            ["primary", "bg-primary"],
            ["primary-dark", "bg-primary-dark"],
            ["accent", "bg-accent"],
            ["bg", "bg-bg border border-gray-200"],
            ["surface", "bg-surface border border-gray-200"],
          ].map(([name, cls]) => (
            <div key={name} className="text-center">
              <div className={`h-16 w-24 rounded-lg ${cls}`} />
              <span className="text-xs text-gray-500">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Đang xử lý</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Họ tên" placeholder="Nguyễn Văn A" />
          <Input label="Email" placeholder="email@example.com" error="Email không hợp lệ" />
          <Select label="Bàn">
            <option>B01</option>
            <option>B02</option>
          </Select>
          <Textarea label="Ghi chú" placeholder="Ít đá..." />
        </div>
      </Section>

      <Section title="Status pills (đơn hàng)">
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUS.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill type="payment" status="unpaid" />
          <StatusPill type="payment" status="paid" />
          <StatusPill type="table" status="available" />
          <StatusPill type="table" status="occupied" />
          <Badge className="bg-accent/15 text-accent">Nổi bật</Badge>
        </div>
      </Section>

      <Section title="Tiện ích & trạng thái">
        <div className="space-y-4">
          <p className="text-sm">
            Tiền: <strong>{formatVND(80000)}</strong> · Ngày: {formatDate(new Date())}
          </p>
          <div className="flex items-center gap-3">
            <Spinner className="text-primary" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <EmptyState
            icon={ShoppingCart}
            title="Giỏ hàng trống"
            description="Thêm món từ thực đơn để bắt đầu đặt."
            action={<Button size="sm">Xem thực đơn</Button>}
          />
        </div>
      </Section>

      <Section title="Modal & Pagination & Toast">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setOpen(true)}>Mở modal</Button>
          <Button variant="secondary" onClick={() => toast.success("Thành công!")}>
            Toast thành công
          </Button>
          <Button variant="secondary" onClick={() => toast.error("Có lỗi xảy ra")}>
            Toast lỗi
          </Button>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={5} onChange={setPage} />
        </div>
        <Modal open={open} onClose={() => setOpen(false)} title="Trà sữa trân châu">
          <div className="flex items-start gap-4">
            <Coffee className="h-12 w-12 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Đây là nội dung modal mẫu.</p>
              <p className="mt-2 font-semibold text-primary">{formatVND(35000)}</p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => setOpen(false)}>Thêm vào giỏ</Button>
          </div>
        </Modal>
      </Section>
    </div>
  );
}
