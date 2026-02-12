import { useState } from "react";
import { FormField, FieldType, ContentBlock, ContentBlockStyle, FormItem, isContentBlock, isFormField, FIELD_TYPE_META, CONTENT_BLOCK_META, DEFAULT_DATE_CONFIG } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import ContentBlockCard from "@/components/ContentBlockCard";
import AddFieldPanel from "@/components/AddFieldPanel";
import FormPreviewModal from "@/components/FormPreviewModal";
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

let fieldCounter = 0;

const createField = (type: FieldType): FormField => {
  fieldCounter++;
  const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(type);
  return {
    id: crypto.randomUUID(),
    type,
    label: `欄位 ${fieldCounter}`,
    required: false,
    enabled: true,
    options: needsOptions
      ? [{ id: crypto.randomUUID(), label: "選項 1" }]
      : undefined,
    dateConfig: type === "date" ? { ...DEFAULT_DATE_CONFIG } : undefined,
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
  const [showPreview, setShowPreview] = useState(false);
  const [hideDisabled, setHideDisabled] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (showPanel) setShowPanel(false);
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

  const handleShowPanel = () => {
    setExpandedId(null);
    setShowPanel(true);
  };

  const disabledCount = items.filter((i) => !i.enabled).length;
  const visibleItems = hideDisabled ? items.filter((i) => i.enabled) : items;

  return (
    <div className="xform-page">
      <div className="xform-container">
        <div className="xform-header">
          <div>
            <h1 className="xform-header-title">表單欄位設定</h1>
            <p className="xform-header-desc">新增與編輯表單欄位，拖曳調整順序</p>
          </div>
          <div className="xform-header-actions">
            <button className="btn btn-outline-secondary xform-preview-btn" onClick={() => setShowPreview(true)} disabled={items.length === 0}>
              <i className="bi bi-eye me-1" />
              預覽
            </button>
            <button className="btn btn-primary xform-save-btn" onClick={handleSave} disabled={items.length === 0}>
              儲存
            </button>
          </div>
        </div>

        {items.length > 0 && disabledCount > 0 && (
          <div className="xform-filter-bar">
            <button
              className={`xform-filter-toggle ${hideDisabled ? "active" : ""}`}
              onClick={() => setHideDisabled(!hideDisabled)}
            >
              <i className={`bi ${hideDisabled ? "bi-eye-slash" : "bi-eye"}`} />
              {hideDisabled ? `已隱藏 ${disabledCount} 個停用項目` : "隱藏停用項目"}
            </button>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div>
              {visibleItems.map((item) =>
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
            <button className="btn btn-primary" onClick={handleShowPanel}>
            <i className="bi bi-plus me-1" />
            新增欄位 / 內容區塊
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
            onClick={handleShowPanel}
          >
            <i className="bi bi-plus me-1" />
            新增欄位 / 內容區塊
          </button>
        )}
      </div>

      <FormPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        items={items}
      />
    </div>
  );
}
