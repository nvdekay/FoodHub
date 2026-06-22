import { Card } from "../components/ui";

/** Trang giữ chỗ cho các phase sau (F1+). */
export default function PlaceholderPage({ title = "Sắp ra mắt" }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">Màn hình này sẽ được xây dựng ở phase tiếp theo.</p>
    </Card>
  );
}
