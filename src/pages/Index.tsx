import { useState, useMemo } from "react";
import { FormField, FieldType, ContentBlock, ContentBlockStyle, FormItem, FormGroup, FormSettings, isContentBlock, isFormField, DEFAULT_DATE_CONFIG, DEFAULT_PHONE_CONFIG } from "@/types/formField";
import FormFieldCard from "@/components/FormFieldCard";
import ContentBlockCard from "@/components/ContentBlockCard";
import GroupCard from "@/components/GroupCard";
import AddFieldPanel from "@/components/AddFieldPanel";
import FormPreviewModal from "@/components/FormPreviewModal";
import FormSettingsPanel from "@/components/FormSettingsPanel";
import "@/styles/form-builder.css";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

let fieldCounter = 0;

const DEFAULT_SETTINGS: FormSettings = {
  submitButtonText: "立即登記",
  enableCustomButtonColor: false,
  buttonBgColor: "#4a5da8",
  buttonTextColor: "#ffffff",
  buttonHoverBgColor: "#3d4e8f",
  buttonHoverTextColor: "#ffffff",
  showQuestionNumbers: false,
};

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
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [formSettings, setFormSettings] = useState<FormSettings>(DEFAULT_SETTINGS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    if (activeId.startsWith("group-sort-")) {
      const groupContainers = args.droppableContainers.filter((c) =>
        String(c.id).startsWith("group-sort-")
      );
      return rectIntersection({ ...args, droppableContainers: groupContainers });
    }
    return closestCenter(args);
  };

  // Build question number map
  const questionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!formSettings.showQuestionNumbers) return map;
    let num = 1;
    for (const item of items) {
      if (isFormField(item) && item.enabled) {
        map.set(item.id, num++);
      }
    }
    return map;
  }, [items, formSettings.showQuestionNumbers]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (showPanel) setShowPanel(false);
  };

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

  // Track which item was expanded before drag to restore after
  const [preDragExpandedId, setPreDragExpandedId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    if (activeId.startsWith("group-sort-")) {
      setIsDraggingGroup(true);
    }
    // Collapse expanded item during drag, remember it
    if (expandedId) {
      setPreDragExpandedId(expandedId);
      setExpandedId(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    if (activeId.startsWith("group-sort-")) return;

    const activeItem = items.find((i) => i.id === active.id);
    if (!activeItem) return;

    const overId = String(over.id);
    if (overId.startsWith("group-drop-")) {
      const targetGroupId = overId.replace("group-drop-", "");
      const currentGroupId = isContentBlock(activeItem) ? activeItem.groupId : (activeItem as FormField).groupId;
      if (currentGroupId !== targetGroupId) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== active.id) return item;
            if (isContentBlock(item)) return { ...item, groupId: targetGroupId };
            return { ...item, groupId: targetGroupId };
          })
        );
      }
      return;
    }

    const overItem = items.find((i) => i.id === over.id);
    if (!overItem) return;

    const activeGroupId2 = isContentBlock(activeItem) ? activeItem.groupId : (activeItem as FormField).groupId;
    const overGroupId = isContentBlock(overItem) ? overItem.groupId : (overItem as FormField).groupId;

    if (activeGroupId2 !== overGroupId) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== active.id) return item;
          if (isContentBlock(item)) return { ...item, groupId: overGroupId };
          return { ...item, groupId: overGroupId };
        })
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeId = String(active.id);
    if (activeId.startsWith("group-sort-")) {
      setIsDraggingGroup(false);
      // Restore expanded item after group drag
      if (preDragExpandedId) {
        setExpandedId(preDragExpandedId);
        setPreDragExpandedId(null);
      }
      if (!over) return;
      const overId = String(over.id);
      if (!overId.startsWith("group-sort-")) return;

      const activeGroupId2 = activeId.replace("group-sort-", "");
      const overGroupId = overId.replace("group-sort-", "");

      if (activeGroupId2 !== overGroupId) {
        setGroups((prev) => {
          const oldIndex = prev.findIndex((g) => g.id === activeGroupId2);
          const newIndex = prev.findIndex((g) => g.id === overGroupId);
          if (oldIndex === -1 || newIndex === -1) return prev;
          const reordered = arrayMove(prev, oldIndex, newIndex);
          return renameGroupsByOrder(reordered);
        });
      }
      return;
    }

    if (over && active.id !== over.id) {
      const overId = String(over.id);
      if (overId.startsWith("group-drop-") || overId.startsWith("group-sort-")) return;

      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    // Restore expanded item after item drag
    if (preDragExpandedId) {
      setExpandedId(preDragExpandedId);
      setPreDragExpandedId(null);
    }
  };

  const handleDragCancel = () => {
    setIsDraggingGroup(false);
    if (preDragExpandedId) {
      setExpandedId(preDragExpandedId);
      setPreDragExpandedId(null);
    }
  };

  const handleSave = () => {
    const fields = items.filter(isFormField);
    const empty = fields.filter((f) => !f.label.trim());
    if (empty.length) {
      toast.error("有欄位尚未填寫題目名稱");
      return;
    }
    console.log("Saved items:", items, "Groups:", groups, "Settings:", formSettings);
    toast.success(`已儲存 ${items.length} 個項目`);
  };

  const handleShowPanel = () => {
    setExpandedId(null);
    setShowPanel(true);
  };

  const renameGroupsByOrder = (groupList: FormGroup[]): FormGroup[] =>
    groupList.map((g, i) => ({ ...g, name: `第 ${i + 1} 頁` }));

  const handleCreateGroup = () => {
    const newGroup: FormGroup = {
      id: crypto.randomUUID(),
      name: `第 ${groups.length + 1} 頁`,
    };

    if (groups.length === 0 && items.length > 0) {
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
    const remainingGroups = groups.filter((g) => g.id !== groupId);
    const fallbackGroupId = remainingGroups.length > 0 ? remainingGroups[0].id : undefined;

    setItems((prev) => prev.map((item) => {
      if (isContentBlock(item) && item.groupId === groupId) return { ...item, groupId: fallbackGroupId };
      if (isFormField(item) && item.groupId === groupId) return { ...item, groupId: fallbackGroupId };
      return item;
    }));
    setGroups(renameGroupsByOrder(remainingGroups));
    toast("已刪除分頁（欄位已保留）");
  };

  const disabledCount = items.filter((i) => !i.enabled).length;
  const visibleItems = hideDisabled ? items.filter((i) => i.enabled) : items;

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

  const groupSortIds = groups.map((g) => `group-sort-${g.id}`);

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
            <div className="xform-filter-bar-left">
              <button
                className="btn btn-sm xform-group-create-btn"
                onClick={handleCreateGroup}
              >
                <i className="bi bi-folder-plus me-1" />
                新增分頁
              </button>
              <FormSettingsPanel
                settings={formSettings}
                onChange={setFormSettings}
              />
            </div>
            {disabledCount > 0 && (
              <label className="xform-filter-toggle-label" onClick={() => setHideDisabled(!hideDisabled)}>
                <span className="xform-filter-toggle-text">
                  {hideDisabled
                    ? "顯示所有項目"
                    : `隱藏關閉項目 (${disabledCount})`}
                </span>
                <span className={`xform-toggle-switch ${hideDisabled ? "active" : ""}`}>
                  <span className="xform-toggle-knob" />
                </span>
              </label>
            )}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={groupSortIds} strategy={verticalListSortingStrategy}>
            {groups.map((group, idx) => (
              <GroupCard
                key={group.id}
                group={group}
                items={getGroupItems(group.id)}
                expandedId={expandedId}
                isLastGroup={idx === groups.length - 1}
                isDraggingGroup={isDraggingGroup}
                showQuestionNumbers={formSettings.showQuestionNumbers}
                questionNumberMap={questionNumberMap}
                onToggleExpand={toggleExpand}
                onUpdateGroup={updateGroup}
                onDeleteGroup={deleteGroup}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onShowAddPanel={handleShowPanel}
              >
                {idx === groups.length - 1 && !showPanel && items.length > 0 && (
                  <button
                    className="xform-add-more-btn"
                    onClick={handleShowPanel}
                  >
                    <i className="bi bi-plus me-1" />
                    新增欄位 / 內容區塊
                  </button>
                )}
                {idx === groups.length - 1 && showPanel && (
                  <div className="mt-3">
                    <AddFieldPanel
                      onAddField={addField}
                      onAddContentBlock={addContentBlock}
                      onCancel={() => setShowPanel(false)}
                    />
                  </div>
                )}
              </GroupCard>
            ))}

            {ungroupedItems.length > 0 && (
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
                      questionNumber={formSettings.showQuestionNumbers ? questionNumberMap.get(item.id) : undefined}
                      onToggleExpand={() => toggleExpand(item.id)}
                      onUpdate={(f) => updateItem(f)}
                      onDelete={deleteItem}
                    />
                  )
                )}
              </div>
            )}
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

        {showPanel && groups.length === 0 && (
          <div className="mt-3">
            <AddFieldPanel
              onAddField={addField}
              onAddContentBlock={addContentBlock}
              onCancel={() => setShowPanel(false)}
            />
          </div>
        )}

        {items.length > 0 && !showPanel && groups.length === 0 && (
          <button
            className="xform-add-more-btn"
            onClick={handleShowPanel}
          >
            <i className="bi bi-plus me-1" />
            新增欄位 / 內容區塊
          </button>
        )}

        {/* Form settings now in filter bar gear icon */}
      </div>

      <FormPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        items={items}
        groups={groups}
        settings={formSettings}
        questionNumberMap={questionNumberMap}
      />
    </div>
  );
}
