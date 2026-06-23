import { useLayoutEffect, useRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Chips chọn danh mục (cuộn ngang trên mobile) với pill trượt mượt sau chip
 * đang chọn. Vị trí pill được tính trực tiếp từ DOM trong useLayoutEffect
 * (ghi style imperative, không setState) nên không gây render thừa.
 */
export default function CategoryChips({ categories = [], value, onChange }) {
  const trackRef = useRef(null);
  const pillRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const pill = pillRef.current;
    const active = track?.querySelector('[data-active="true"]');
    if (!track || !pill || !active) return;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.height = `${active.offsetHeight}px`;
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    pill.style.opacity = "1";
  }, [value, categories]);

  const chip = (active) =>
    cn(
      "relative z-10 shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      active ? "text-white" : "text-gray-600 hover:text-gray-900"
    );

  return (
    <div ref={trackRef} className="relative flex gap-2 overflow-x-auto pb-1">
      {/* Pill nền trượt theo chip đang chọn */}
      <span
        ref={pillRef}
        aria-hidden="true"
        className="absolute left-0 top-0 rounded-full bg-primary opacity-0 transition-all duration-300 ease-out"
      />
      <button data-active={!value} className={chip(!value)} onClick={() => onChange(null)}>
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          data-active={value === c._id}
          className={chip(value === c._id)}
          onClick={() => onChange(c._id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
