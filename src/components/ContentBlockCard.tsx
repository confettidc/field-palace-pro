import { ContentBlock, ContentBlockStyle, CONTENT_BLOCK_META, DividerLineStyle, SpacerSize } from "@/types/formField";
import RichTextEditor from "./RichTextEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DIVIDER_STYLES: { value: DividerLineStyle; label: string }[] = [
  { value: "solid", label: "實線" },
  { value: "dashed", label: "虛線" },
  { value: "dotted", label: "點線" },
  { value: "double", label: "雙線" },
];

const SPACER_SIZES: { value: SpacerSize; label: string; height: string }[] = [
  { value: "small", label: "小", height: "16px" },
  { value: "medium", label: "中", height: "32px" },
  { value: "large", label: "大", height: "64px" },
];

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
    : (block.content ? "內容區塊" : "未輸入內容");

  const isDivider = block.style === "divider";
  const isSpacer = block.style === "spacer";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`xform-field-card ${!block.enabled ? "xform-field-dimmed" : ""}`}
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
          <div className="form-check form-switch xform-switch-green mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={block.enabled}
              onChange={(e) => onUpdate({ ...block, enabled: e.target.checked })}
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
              <label className="xform-form-label">間距大小</label>
              <div className="xform-divider-styles">
                {SPACER_SIZES.map((ss) => (
                  <button
                    key={ss.value}
                    className={`xform-divider-style-btn ${(block.spacerSize || "medium") === ss.value ? "active" : ""}`}
                    onClick={() => onUpdate({ ...block, spacerSize: ss.value })}
                  >
                    <div className="xform-spacer-preview" style={{ height: ss.height }} />
                    <span>{ss.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="xform-form-group">
              <label className="xform-form-label">內容</label>
              <RichTextEditor
                content={block.content || ""}
                onChange={(html) => onUpdate({ ...block, content: html })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
