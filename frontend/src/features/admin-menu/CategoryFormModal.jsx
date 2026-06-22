import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button, Input, Textarea } from "../../components/ui";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useAdminMenu";

/** Form thêm/sửa danh mục. Truyền key={category?._id || "new"} để reset state. */
export default function CategoryFormModal({ category, open, onClose }) {
  const editing = !!category;
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [error, setError] = useState("");

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const saving = createCat.isPending || updateCat.isPending;

  const submit = () => {
    if (!name.trim()) {
      setError("Tên danh mục là bắt buộc");
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || null,
      displayOrder: Number(displayOrder) || 0,
      isActive,
    };
    const mutation = editing ? updateCat : createCat;
    const vars = editing ? { id: category._id, ...payload } : payload;
    mutation.mutate(vars, {
      onSuccess: () => {
        toast.success(editing ? "Đã cập nhật danh mục" : "Đã thêm danh mục");
        onClose();
      },
      onError: (e) => toast.error(e.message || "Lưu thất bại"),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Sửa danh mục" : "Thêm danh mục"}>
      <div className="space-y-4">
        <Input
          label="Tên danh mục *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
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
        <Input
          label="Thứ tự hiển thị"
          type="number"
          min="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-primary"
          />
          Đang hiển thị (hoạt động)
        </label>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Huỷ bỏ
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? "Lưu thay đổi" : "Thêm danh mục"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
