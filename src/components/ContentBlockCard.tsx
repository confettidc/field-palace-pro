import { useState } from "react";
import { ContentBlock, ContentBlockStyle, CONTENT_BLOCK_META, DividerLineStyle, SpacerSize } from "@/types/formField";
import RichTextEditor from "./RichTextEditor";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DIVIDER_STYLES: { value: DividerLineStyle; label: string }[] = [
  { value: "solid", label: "實線" },
];

const SPACER_SIZES: { value: SpacerSize; label: string }[] = [
  { value: "10px", label: "10px" },
  { value: "20px", label: "20px" },
  { value: "30px", label: "30px" },
  { value: "40px", label: "40px" },
];

interface Props {
  block: ContentBlock;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
}

export default function ContentBlockCard({ block, expanded, onToggleExpand, onUpdate, onDelete }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = CONTENT_BLOCK_META[block.style];
  const displayLabel = block.style === "divider" || block.style === "spacer"
    ? meta.label
    : (block.content ? block.defaultLabel : block.defaultLabel);

  const isDivider = block.style === "divider";
  const isSpacer = block.style === "spacer";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`xform-field-card ${!block.enabled ? "xform-field-dimmed" : ""}`}
    >
      <div className="xform-field-header">
        <div className="xform-drag-handle" {...attributes} {...listeners}>
          <i className="bi bi-grip-vertical" />
        </div>
        <div className="xform-field-header-main" onClick={onToggleExpand}>
          <span className="xform-field-label-text">{displayLabel}</span>

          <span className="xform-field-type-badge xform-badge-content">
            <i className={`bi ${meta.icon}`} />
            {meta.label}
          </span>
        </div>

        <div className="xform-field-header-right">
          <span className="xform-toggle-label">啟用</span>
          <div className="form-check form-switch xform-switch-green mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={block.enabled}
              onChange={(e) => onUpdate({ ...block, enabled: e.target.checked })}
            />
          </div>

          <button className="btn btn-sm xform-delete-icon-btn" title="刪除" onClick={() => setShowDeleteConfirm(true)}>
            <i className="bi bi-trash" />
          </button>

          <i
            className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} xform-expand-icon`}
            onClick={onToggleExpand}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          message="確定刪除此內容區塊？"
          onConfirm={() => { onDelete(block.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {expanded && (
        <div className="xform-field-body">
          {isDivider ? (
            <div className="xform-form-group">
              <label className="xform-form-label">線條樣式</label>
              <div className="xform-divider-styles">
                {DIVIDER_STYLES.map((ds) => (
                  <button
                    key={ds.value}
                    className={`xform-divider-style-btn ${(block.dividerStyle || "solid") === ds.value ? "active" : ""}`}
                    onClick={() => onUpdate({ ...block, dividerStyle: ds.value })}
                  >
                    <hr className={`xform-divider-preview xform-divider-${ds.value}`} />
                    <span>{ds.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : isSpacer ? (
            <div className="xform-form-group">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label className="xform-form-label" style={{ marginBottom: 0, whiteSpace: "nowrap" }}>間距大小</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "100px" }}
                  value={block.spacerSize || "10px"}
                  onChange={(e) => onUpdate({ ...block, spacerSize: e.target.value as SpacerSize })}
                >
                  {SPACER_SIZES.map((ss) => (
                    <option key={ss.value} value={ss.value}>{ss.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="xform-form-group">
              <label className="xform-form-label">內容</label>
              <div className="xform-desc-editor-wrap">
                <RichTextEditor
                  content={block.content || ""}
                  onChange={(html) => onUpdate({ ...block, content: html })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
