import { useState } from "react";
import { FormField, FieldType } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import AddFieldPanel from "@/components/AddFieldPanel";
import "@/styles/form-builder.css";
import { toast } from "sonner";

const createField = (type: FieldType): FormField => {
  const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(type);
  return {
    id: crypto.randomUUID(),
    type,
    label: "",
    required: false,
    enabled: true,
    options: needsOptions
      ? [{ id: crypto.randomUUID(), label: "選項 1" }]
      : undefined,
  };
};

export default function Index() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const addField = (type: FieldType) => {
    setFields((prev) => [...prev, createField(type)]);
    setShowPanel(false);
  };

  const updateField = (updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast("已刪除欄位");
  };

  const duplicateField = (id: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: crypto.randomUUID() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    toast("已複製欄位");
  };

  const handleSave = () => {
    const empty = fields.filter((f) => !f.label.trim());
    if (empty.length) {
      toast.error("有欄位尚未填寫題目名稱");
      return;
    }
    console.log("Saved fields:", fields);
    toast.success(`已儲存 ${fields.length} 個欄位`);
  };

  return (
    <div className="x-page">
      <div className="x-container">
        {/* Title */}
        <div className="x-header">
          <div>
            <h1 className="x-header-title">表單欄位設定</h1>
            <p className="x-header-desc">新增與編輯表單欄位，拖曳調整順序</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={fields.length === 0}>
            儲存
          </button>
        </div>

        {/* Fields */}
        <div>
          {fields.map((field, index) => (
            <FormFieldCard
              key={field.id}
              field={field}
              index={index + 1}
              onUpdate={updateField}
              onDelete={deleteField}
              onDuplicate={duplicateField}
            />
          ))}
        </div>

        {/* Empty state */}
        {fields.length === 0 && !showPanel && (
          <div className="x-empty-state">
            <p className="x-empty-text">尚未新增任何欄位</p>
            <button className="btn btn-outline-primary" onClick={() => setShowPanel(true)}>
              <i className="bi bi-plus me-1" />
              新增欄位
            </button>
          </div>
        )}

        {/* Add field panel */}
        {showPanel && (
          <div className="mt-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 style={{ fontSize: "0.9rem", fontWeight: 500, margin: 0 }}>選擇欄位類型</h2>
              <button className="btn btn-sm btn-light" onClick={() => setShowPanel(false)}>
                取消
              </button>
            </div>
            <AddFieldPanel onAdd={addField} />
          </div>
        )}

        {/* Add more button */}
        {fields.length > 0 && !showPanel && (
          <button
            className="btn btn-outline-secondary w-100 mt-2"
            style={{ borderStyle: "dashed" }}
            onClick={() => setShowPanel(true)}
          >
            <i className="bi bi-plus me-1" />
            新增欄位
          </button>
        )}
      </div>
    </div>
  );
}
