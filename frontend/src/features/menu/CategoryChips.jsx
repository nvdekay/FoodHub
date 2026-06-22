import { cn } from "../../lib/cn";

/** Chips chọn danh mục (cuộn ngang trên mobile). */
export default function CategoryChips({ categories = [], value, onChange }) {
  const chip = (active) =>
    cn(
      "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
      active ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button className={chip(!value)} onClick={() => onChange(null)}>
        Tất cả
      </button>
      {categories.map((c) => (
        <button key={c._id} className={chip(value === c._id)} onClick={() => onChange(c._id)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}
