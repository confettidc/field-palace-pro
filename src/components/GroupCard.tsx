import { useState, useRef, useEffect } from "react";
import { FormGroup, FormItem, isContentBlock, isFormField } from "@/types/formField";
import FormFieldCard from "./FormFieldCard";
import ContentBlockCard from "./ContentBlockCard";
import RichTextEditor from "./RichTextEditor";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  group: FormGroup;
  items: FormItem[];
  expandedId: string | null;
  isLastGroup?: boolean;
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

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  return (
    <div
      ref={setDropRef}
      className={`xform-group-card ${isOver ? "xform-group-drop-over" : ""}`}
    >
      <div className="xform-group-header">
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
            />
          ) : (
            <h3
              className="xform-group-name"
              onClick={() => setEditingName(true)}
              title="點擊編輯分頁名稱"
            >
              {group.name || "未命名分頁"}
              <i className="bi bi-pencil xform-group-edit-icon" />
            </h3>
          )}
        </div>
        <div className="xform-group-header-right">
          {showDeleteConfirm ? (
            <div className="xform-group-delete-confirm">
              <span className="xform-group-delete-msg">確定刪除此分頁？</span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  onDeleteGroup(group.id);
                  setShowDeleteConfirm(false);
                }}
              >
                確定
              </button>
              <button
                className="btn btn-sm btn-light"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-light text-muted"
              title="刪除分頁（保留欄位）"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <i className="bi bi-folder-minus" />
            </button>
          )}
        </div>
      </div>

      {!showDesc ? (
        <button
          className="btn btn-sm xform-add-desc-btn xform-group-add-desc"
          onClick={() => setShowDesc(true)}
        >
          + 分頁說明
        </button>
      ) : (
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
            <div className="xform-desc-hint" style={{ borderTop: '1px solid #dee2e6' }}>
              Shift + Enter = 下一行
            </div>
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
    </div>
  );
}
