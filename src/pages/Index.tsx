import { useState } from "react";
import { Plus } from "lucide-react";
import { FormField, FieldType } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import AddFieldPanel from "@/components/AddFieldPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const createField = (type: FieldType): FormField => {
  const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(type);
  return {
    id: crypto.randomUUID(),
    type,
    label: "",
    required: false,
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
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">表單欄位設定</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              新增與編輯表單欄位，拖曳調整順序
            </p>
          </div>
          <Button onClick={handleSave} disabled={fields.length === 0}>
            儲存
          </Button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map((field) => (
            <FormFieldCard
              key={field.id}
              field={field}
              onUpdate={updateField}
              onDelete={deleteField}
              onDuplicate={duplicateField}
            />
          ))}
        </div>

        {/* Empty state */}
        {fields.length === 0 && !showPanel && (
          <div className="rounded-lg border-2 border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground mb-3">尚未新增任何欄位</p>
            <Button variant="outline" onClick={() => setShowPanel(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              新增欄位
            </Button>
          </div>
        )}

        {/* Add field panel */}
        {showPanel && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">選擇欄位類型</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
                取消
              </Button>
            </div>
            <AddFieldPanel onAdd={addField} />
          </div>
        )}

        {/* Add more button */}
        {fields.length > 0 && !showPanel && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowPanel(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            新增欄位
          </Button>
        )}
      </div>
    </div>
  );
}
