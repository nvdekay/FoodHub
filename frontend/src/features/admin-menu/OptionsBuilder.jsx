import { Plus, Trash2 } from "lucide-react";
import { Input, Select, Button } from "../../components/ui";

const emptyChoice = () => ({ label: "", priceModifier: 0 });
const emptyGroup = () => ({ name: "", type: "single", required: false, choices: [emptyChoice()] });

/**
 * Trình xây nhóm tuỳ chọn của món (Size/Topping...).
 * value: mảng nhóm { name, type, required, choices:[{label, priceModifier}] }.
 */
export default function OptionsBuilder({ value = [], onChange }) {
  const groups = value;

  const updateGroup = (i, patch) =>
    onChange(groups.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  const removeGroup = (i) => onChange(groups.filter((_, idx) => idx !== i));
  const addGroup = () => onChange([...groups, emptyGroup()]);

  const updateChoice = (gi, ci, patch) =>
    updateGroup(gi, {
      choices: groups[gi].choices.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)),
    });
  const removeChoice = (gi, ci) =>
    updateGroup(gi, { choices: groups[gi].choices.filter((_, idx) => idx !== ci) });
  const addChoice = (gi) => updateGroup(gi, { choices: [...groups[gi].choices, emptyChoice()] });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Nhóm tuỳ chọn</span>
        <Button type="button" size="sm" variant="secondary" onClick={addGroup}>
          <Plus className="h-4 w-4" /> Thêm nhóm
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-gray-400">Chưa có nhóm tuỳ chọn (ví dụ: Size, Topping, Mức đường).</p>
      )}

      {groups.map((g, gi) => (
        <div key={gi} className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Tên nhóm (vd: Size)"
              value={g.name}
              onChange={(e) => updateGroup(gi, { name: e.target.value })}
            />
            <Select
              value={g.type}
              onChange={(e) => updateGroup(gi, { type: e.target.value })}
              className="!w-32 flex-shrink-0"
            >
              <option value="single">Chọn 1</option>
              <option value="multiple">Chọn nhiều</option>
            </Select>
            <button
              type="button"
              onClick={() => removeGroup(gi)}
              className="flex-shrink-0 rounded-lg px-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Xoá nhóm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={g.required}
              onChange={(e) => updateGroup(gi, { required: e.target.checked })}
              className="accent-primary"
            />
            Bắt buộc chọn
          </label>

          <div className="space-y-1.5">
            {g.choices.map((c, ci) => (
              <div key={ci} className="flex gap-2">
                <Input
                  placeholder="Tên lựa chọn (vd: Size L)"
                  value={c.label}
                  onChange={(e) => updateChoice(gi, ci, { label: e.target.value })}
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Phụ phí"
                  value={c.priceModifier}
                  onChange={(e) => updateChoice(gi, ci, { priceModifier: e.target.value })}
                  className="!w-28 flex-shrink-0"
                />
                <button
                  type="button"
                  onClick={() => removeChoice(gi, ci)}
                  disabled={g.choices.length <= 1}
                  className="flex-shrink-0 rounded-lg px-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Xoá lựa chọn"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" size="sm" variant="ghost" onClick={() => addChoice(gi)}>
              <Plus className="h-3.5 w-3.5" /> Thêm lựa chọn
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
