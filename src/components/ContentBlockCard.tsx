import { ContentBlock, CONTENT_BLOCK_META } from "@/types/formField";
import RichTextEditor from "./RichTextEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  block: ContentBlock;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
}

export default function ContentBlockCard({ block, expanded, onToggleExpand, onUpdate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = CONTENT_BLOCK_META[block.style];
  const displayLabel = block.style === "divider" || block.style === "spacer"
    ? meta.label
    : (block.content ? "圖文方塊" : "未輸入內容");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`xform-field-card ${!block.enabled ? "xform-field-disabled" : ""}`}
    >
      <div className="xform-field-header" onClick={onToggleExpand} style={{ cursor: "pointer" }}>
        <div className="xform-drag-handle" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <i className="bi bi-grip-vertical" />
        </div>

        <span className="xform-field-label-text">{displayLabel}</span>

        <span className="xform-field-type-badge xform-badge-content">
          <i className={`bi ${meta.icon}`} />
          {meta.label}
        </span>

        <span className="xform-field-spacer" />

        <div className="xform-field-header-right" onClick={(e) => e.stopPropagation()}>
          <span className="xform-toggle-label">啟用</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={block.enabled}
              onChange={(e) => {
                onUpdate({ ...block, enabled: e.target.checked });
                if (!e.target.checked && expanded) onToggleExpand();
              }}
            />
          </div>

          <button className="btn btn-sm btn-light text-danger" title="刪除" onClick={() => onDelete(block.id)}>
            <i className="bi bi-trash" />
          </button>

          <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} xform-expand-icon`} />
        </div>
      </div>

      {expanded && (
        <div className="xform-field-body">
          <div className="xform-form-group">
            <label className="xform-form-label">內容</label>
            <RichTextEditor
              content={block.content || ""}
              onChange={(html) => onUpdate({ ...block, content: html })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
