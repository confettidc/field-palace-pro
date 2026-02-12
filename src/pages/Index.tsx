import { useState } from "react";
import { FormField, FieldType, ContentBlock, ContentBlockStyle, FormItem, FormGroup, isContentBlock, isFormField, DEFAULT_DATE_CONFIG, DEFAULT_PHONE_CONFIG } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import ContentBlockCard from "@/components/ContentBlockCard";
import GroupCard from "@/components/GroupCard";
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
let groupCounter = 0;

const createField = (type: FieldType, groupId?: string): FormField => {
  fieldCounter++;
  const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(type);
  return {
    id: crypto.randomUUID(),
    type,
    label: `欄位 ${fieldCounter}`,
    required: false,
    enabled: true,
    groupId,
    options: needsOptions
      ? [{ id: crypto.randomUUID(), label: "選項 1" }]
      : undefined,
    dateConfig: type === "date" ? { ...DEFAULT_DATE_CONFIG } : undefined,
    phoneConfig: type === "phone" ? { ...DEFAULT_PHONE_CONFIG } : undefined,
  };
};

const createContentBlock = (style: ContentBlockStyle, groupId?: string): ContentBlock => ({
  id: crypto.randomUUID(),
  kind: "content_block",
  style,
  content: "",
  enabled: true,
  groupId,
});

export default function Index() {
  const [items, setItems] = useState<FormItem[]>([]);
  const [groups, setGroups] = useState<FormGroup[]>([]);
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

  // Determine which group new items should go into (last group, or none)
  const activeGroupId = groups.length > 0 ? groups[groups.length - 1].id : undefined;

  const addField = (type: FieldType) => {
    const f = createField(type, activeGroupId);
    setItems((prev) => [...prev, f]);
    setExpandedId(f.id);
    setShowPanel(false);
  };

  const addContentBlock = (style: ContentBlockStyle) => {
    const b = createContentBlock(style, activeGroupId);
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
    console.log("Saved items:", items, "Groups:", groups);
    toast.success(`已儲存 ${items.length} 個項目`);
  };

  const handleShowPanel = () => {
    setExpandedId(null);
    setShowPanel(true);
  };

  // Group management
  const handleCreateGroup = () => {
    groupCounter++;
    const newGroup: FormGroup = {
      id: crypto.randomUUID(),
      name: `分組 ${groupCounter}`,
    };

    if (groups.length === 0 && items.length > 0) {
      // First group: move all existing ungrouped items into this group
      setItems((prev) => prev.map((item) => {
        if (isContentBlock(item)) return { ...item, groupId: newGroup.id };
        return { ...item, groupId: newGroup.id };
      }));
    }

    setGroups((prev) => [...prev, newGroup]);
    toast.success(`已建立「${newGroup.name}」`);
  };

  const updateGroup = (updated: FormGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deleteGroup = (groupId: string) => {
    // Remove group but keep items (ungroup them)
    setItems((prev) => prev.map((item) => {
      if (isContentBlock(item) && item.groupId === groupId) return { ...item, groupId: undefined };
      if (isFormField(item) && item.groupId === groupId) return { ...item, groupId: undefined };
      return item;
    }));
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast("已解散分組（欄位已保留）");
  };

  const disabledCount = items.filter((i) => !i.enabled).length;
  const visibleItems = hideDisabled ? items.filter((i) => i.enabled) : items;

  // Separate ungrouped items from grouped items
  const ungroupedItems = visibleItems.filter((i) => {
    if (isContentBlock(i)) return !i.groupId;
    if (isFormField(i)) return !i.groupId;
    return true;
  });

  const getGroupItems = (groupId: string) =>
    visibleItems.filter((i) => {
      if (isContentBlock(i)) return i.groupId === groupId;
      if (isFormField(i)) return i.groupId === groupId;
      return false;
    });

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

        {items.length > 0 && (
          <div className="xform-filter-bar">
            <button
              className="btn btn-sm xform-group-create-btn"
              onClick={handleCreateGroup}
            >
              <i className="bi bi-folder-plus me-1" />
              新增分組
            </button>
            <label className="xform-filter-toggle-label" onClick={() => setHideDisabled(!hideDisabled)}>
              <span className="xform-filter-toggle-text">
                {hideDisabled && disabledCount > 0
                  ? `隱藏關閉項目 (${disabledCount})`
                  : "隱藏關閉項目"}
              </span>
              <span className={`xform-toggle-switch ${hideDisabled ? "active" : ""}`}>
                <span className="xform-toggle-knob" />
              </span>
            </label>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {/* Render groups */}
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              items={getGroupItems(group.id)}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onUpdateGroup={updateGroup}
              onDeleteGroup={deleteGroup}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
            />
          ))}

          {/* Render ungrouped items */}
          {ungroupedItems.length > 0 && (
            <SortableContext items={ungroupedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div>
                {ungroupedItems.map((item) =>
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
          )}
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
        groups={groups}
      />
    </div>
  );
}
