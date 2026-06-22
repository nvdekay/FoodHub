import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button, Input, Textarea, Select } from "../../components/ui";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useAdminMenu";
import OptionsBuilder from "./OptionsBuilder";

const catId = (c) => (typeof c === "object" && c !== null ? c._id : c) || "";

// Kiểm tra options giống rule BE (mỗi nhóm có tên + ≥1 lựa chọn có label).
const validateOptions = (groups) => {
  for (const g of groups) {
    if (!g.name.trim()) return "Mỗi nhóm tuỳ chọn cần có tên";
    if (!g.choices.length) return `Nhóm '${g.name}' cần ít nhất 1 lựa chọn`;
    for (const c of g.choices) {
      if (!c.label.trim()) return `Nhóm '${g.name}' có lựa chọn chưa nhập tên`;
      if (Number(c.priceModifier) < 0) return "Phụ phí không được âm";
    }
  }
  return null;
};

/** Form thêm/sửa món. Truyền key={product?._id || "new"} để reset state. */
export default function ProductFormModal({ product, categories = [], open, onClose }) {
  const editing = !!product;
  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState(catId(product?.categoryId));
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [options, setOptions] = useState(() =>
    (product?.options || []).map((g) => ({
      name: g.name,
      type: g.type,
      required: !!g.required,
      choices: (g.choices || []).map((c) => ({ label: c.label, priceModifier: c.priceModifier })),
    }))
  );
  const [errors, setErrors] = useState({});

  const createPro = useCreateProduct();
  const updatePro = useUpdateProduct();
  const saving = createPro.isPending || updatePro.isPending;

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = "Nhập tên món";
    if (!categoryId) e.categoryId = "Chọn danh mục";
    if (basePrice === "" || Number(basePrice) < 0) e.basePrice = "Giá phải là số ≥ 0";
    setErrors(e);
    if (Object.keys(e).length) return;

    const optErr = validateOptions(options);
    if (optErr) {
      toast.error(optErr);
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      basePrice: Number(basePrice),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || null,
      isAvailable,
      isFeatured,
      options: options.map((g) => ({
        name: g.name.trim(),
        type: g.type,
        required: !!g.required,
        choices: g.choices.map((c) => ({
          label: c.label.trim(),
          priceModifier: Number(c.priceModifier) || 0,
        })),
      })),
    };

    const mutation = editing ? updatePro : createPro;
    const vars = editing ? { id: product._id, ...payload } : payload;
    mutation.mutate(vars, {
      onSuccess: () => {
        toast.success(editing ? "Đã cập nhật món" : "Đã thêm món");
        onClose();
      },
      onError: (err) => toast.error(err.message || "Lưu thất bại"),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Sửa món" : "Thêm món"}>
      <div className="space-y-4">
        <Input
          label="Tên món *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Select
          label="Danh mục *"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
              {c.isActive === false ? " (ẩn)" : ""}
            </option>
          ))}
        </Select>
        <Input
          label="Giá gốc (đ) *"
          type="number"
          min="0"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          error={errors.basePrice}
        />
        <Textarea
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Link ảnh"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="accent-primary"
            />
            Còn bán
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-primary"
            />
            Nổi bật
          </label>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <OptionsBuilder value={options} onChange={setOptions} />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Huỷ bỏ
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? "Lưu thay đổi" : "Thêm món"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
