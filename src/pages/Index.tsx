import { useState } from "react";
import { FormField, FieldType, ContentBlock, ContentBlockStyle, FormItem, isContentBlock, isFormField } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import ContentBlockCard from "@/components/ContentBlockCard";
import AddFieldPanel from "@/components/AddFieldPanel";
import "@/styles/form-builder.css";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

const createContentBlock = (style: ContentBlockStyle): ContentBlock => ({
  id: crypto.randomUUID(),
  kind: "content_block",
  style,
  content: "",
  enabled: true,
});

export default function Index() {
  const [items, setItems] = useState<FormItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const toggleExpand = (id: string) => {
    // Don't expand disabled items
    const item = items.find((i) => i.id === id);
    if (item && !item.enabled) return;
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const addField = (type: FieldType) => {
    const f = createField(type);
    setItems((prev) => [...prev, f]);
    setExpandedId(f.id);
    setShowPanel(false);
  };

  const addContentBlock = (style: ContentBlockStyle) => {
    const b = createContentBlock(style);
    setItems((prev) => [...prev, b]);
    setExpandedId(b.id);
    setShowPanel(false);
  };

  const updateItem = (updated: FormItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast("已刪除");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const fields = items.filter(isFormField);
    const empty = fields.filter((f) => !f.label.trim());
    if (empty.length) {
      toast.error("有欄位尚未填寫題目名稱");
      return;
    }
    console.log("Saved items:", items);
    toast.success(`已儲存 ${items.length} 個項目`);
  };

  return (
    <div className="xform-page">
      <div className="xform-container">
        <div className="xform-header">
          <div>
            <h1 className="xform-header-title">表單欄位設定</h1>
            <p className="xform-header-desc">新增與編輯表單欄位，拖曳調整順序</p>
          </div>
          <button className="btn btn-primary xform-save-btn" onClick={handleSave} disabled={items.length === 0}>
            儲存
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div>
              {items.map((item) =>
                isContentBlock(item) ? (
                  <ContentBlockCard
                    key={item.id}
                    block={item}
                    expanded={expandedId === item.id}
                    onToggleExpand={() => toggleExpand(item.id)}
                    onUpdate={(b) => updateItem(b)}
                    onDelete={deleteItem}
                  />
                ) : (
                  <FormFieldCard
                    key={item.id}
                    field={item}
                    expanded={expandedId === item.id}
                    onToggleExpand={() => toggleExpand(item.id)}
                    onUpdate={(f) => updateItem(f)}
                    onDelete={deleteItem}
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && !showPanel && (
          <div className="xform-empty-state">
            <i className="bi bi-inbox xform-empty-icon" />
            <p className="xform-empty-text">尚未新增任何欄位</p>
            <button className="btn btn-primary" onClick={() => setShowPanel(true)}>
              <i className="bi bi-plus me-1" />
              新增欄位
            </button>
          </div>
        )}

        {showPanel && (
          <div className="mt-3">
            <AddFieldPanel
              onAddField={addField}
              onAddContentBlock={addContentBlock}
              onCancel={() => setShowPanel(false)}
            />
          </div>
        )}

        {items.length > 0 && !showPanel && (
          <button
            className="xform-add-more-btn"
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
