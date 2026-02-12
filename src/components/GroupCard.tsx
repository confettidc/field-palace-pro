import { useState, useRef, useEffect } from "react";
import { FormGroup, FormItem, isContentBlock, isFormField } from "@/types/formField";
import FormFieldCard from "./FormFieldCard";
import ContentBlockCard from "./ContentBlockCard";
import RichTextEditor from "./RichTextEditor";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  group: FormGroup;
  items: FormItem[];
  expandedId: string | null;
  isLastGroup?: boolean;
  isDraggingGroup?: boolean;
  showQuestionNumbers?: boolean;
  questionNumberMap?: Map<string, number>;
  onToggleExpand: (id: string) => void;
  onUpdateGroup: (group: FormGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateItem: (item: FormItem) => void;
  onDeleteItem: (id: string) => void;
  children?: React.ReactNode;
}

export default function GroupCard({
  group,
  items,
  expandedId,
  isLastGroup,
  isDraggingGroup,
  showQuestionNumbers,
  questionNumberMap,
  onToggleExpand,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateItem,
  onDeleteItem,
  children,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [showDesc, setShowDesc] = useState(!!group.description);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `group-drop-${group.id}`,
    data: { groupId: group.id },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `group-sort-${group.id}`,
    data: { type: "group", groupId: group.id },
  });

  const sortStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  const isCollapsed = isDraggingGroup && !isDragging;

  return (
    <div
      ref={(node) => {
        setSortRef(node);
        setDropRef(node);
      }}
      style={sortStyle}
      className={`xform-group-card ${isOver ? "xform-group-drop-over" : ""} ${isDragging ? "xform-group-dragging" : ""} ${isCollapsed ? "xform-group-collapsed" : ""}`}
    >
      {/* Entire header row is the drag handle */}
      <div
        className="xform-group-header"
        style={{ cursor: isDraggingGroup || !editingName ? "grab" : undefined }}
        {...attributes}
        {...listeners}
      >
        <div className="xform-group-header-left">
          {editingName ? (
            <input
              ref={nameRef}
              className="xform-group-name-input"
              value={group.name}
              onChange={(e) => onUpdateGroup({ ...group, name: e.target.value })}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingName(false);
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              className="xform-group-name"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingName(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              title="點擊編輯分頁名稱"
            >
              {group.name || "未命名分頁"}
              <i className="bi bi-pencil xform-group-edit-icon" />
            </h3>
          )}
          {isDraggingGroup && !isDragging && (
            <span className="xform-group-item-count">
              {items.length} 個欄位
            </span>
          )}
        </div>
        <div className="xform-group-header-right" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {!isDraggingGroup && (
            <>
              {!showDesc && (
                <button
                  className="btn btn-sm xform-add-desc-btn xform-group-add-desc-inline"
                  onClick={() => setShowDesc(true)}
                >
                  + 分頁說明
                </button>
              )}
              <button
                className="btn btn-sm btn-light text-danger"
                title="刪除分頁（保留欄位）"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-folder-x" />
              </button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          message="確定刪除此分頁？（欄位將被保留）"
          onConfirm={() => { onDeleteGroup(group.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {!isDraggingGroup && (
        <>
          {showDesc && (
            <div className="xform-group-desc-section">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="xform-form-label mb-0" style={{ fontSize: '0.8rem' }}>分頁說明</label>
                <button
                  className="btn btn-sm btn-light text-muted"
                  onClick={() => {
                    onUpdateGroup({ ...group, description: "" });
                    setShowDesc(false);
                  }}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
              <div className="xform-desc-editor-wrap">
                <RichTextEditor
                  content={group.description || ""}
                  onChange={(html) => onUpdateGroup({ ...group, description: html })}
                />
              </div>
            </div>
          )}

          <div className="xform-group-items">
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) =>
                isContentBlock(item) ? (
                  <ContentBlockCard
                    key={item.id}
                    block={item}
                    expanded={expandedId === item.id}
                    onToggleExpand={() => onToggleExpand(item.id)}
                    onUpdate={(b) => onUpdateItem(b)}
                    onDelete={onDeleteItem}
                  />
                ) : (
                  <FormFieldCard
                    key={item.id}
                    field={item}
                    expanded={expandedId === item.id}
                    questionNumber={showQuestionNumbers ? questionNumberMap?.get(item.id) : undefined}
                    onToggleExpand={() => onToggleExpand(item.id)}
                    onUpdate={(f) => onUpdateItem(f)}
                    onDelete={onDeleteItem}
                  />
                )
              )}
            </SortableContext>
            {items.length === 0 && !isLastGroup && (
              <div className="xform-group-empty">
                <span>此分頁尚無欄位</span>
              </div>
            )}
            {children}
          </div>
        </>
      )}
    </div>
  );
}
