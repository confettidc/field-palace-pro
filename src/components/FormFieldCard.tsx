import { useState } from "react";
import { FormField, FieldType, FIELD_TYPE_META, FieldOption } from "@/types/formField";
import RichTextEditor from "./RichTextEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const iconMap: Record<FieldType, string> = {
  short_text: "bi-type",
  long_text: "bi-text-paragraph",
  single_choice: "bi-record-circle",
  multiple_choice: "bi-check-square",
  dropdown: "bi-chevron-down",
  date: "bi-calendar",
  file_upload: "bi-upload",
  number: "bi-hash",
  email: "bi-envelope",
  phone: "bi-phone",
};

type HintMode = "none" | "placeholder" | "default_value";

interface Props {
  field: FormField;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: FormField) => void;
  onDelete: (id: string) => void;
}

export default function FormFieldCard({ field, expanded, onToggleExpand, onUpdate, onDelete }: Props) {
  const [showDesc, setShowDesc] = useState(!!field.description);
  const [hintMode, setHintMode] = useState<HintMode>(
    field.defaultValue ? "default_value" : field.placeholder ? "placeholder" : "none"
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateField = (patch: Partial<FormField>) => onUpdate({ ...field, ...patch });

  const addOption = () => {
    const options = field.options || [];
    const newOpt: FieldOption = { id: crypto.randomUUID(), label: `選項 ${options.length + 1}` };
    updateField({ options: [...options, newOpt] });
  };

  const updateOption = (optId: string, label: string) => {
    updateField({
      options: (field.options || []).map((o) => (o.id === optId ? { ...o, label } : o)),
    });
  };

  const removeOption = (optId: string) => {
    updateField({ options: (field.options || []).filter((o) => o.id !== optId) });
  };

  const hasOptions = ["single_choice", "multiple_choice", "dropdown"].includes(field.type);
  const showHintSection = !hasOptions && field.type !== "file_upload";
  const displayLabel = field.label || "未命名欄位";

  const handleHintModeChange = (mode: HintMode) => {
    setHintMode(mode);
    if (mode === "none") {
      updateField({ placeholder: "", defaultValue: "" });
    } else if (mode === "placeholder") {
      updateField({ defaultValue: "" });
    } else {
      updateField({ placeholder: "" });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`xform-field-card ${!field.enabled ? "xform-field-disabled" : ""}`}
    >
      {/* Header */}
      <div className="xform-field-header" onClick={onToggleExpand} style={{ cursor: "pointer" }}>
        <div className="xform-drag-handle" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <i className="bi bi-grip-vertical" />
        </div>

        <span className="xform-field-label-text">{displayLabel}</span>

        <span className="xform-field-type-badge">
          <i className={`bi ${iconMap[field.type]}`} />
          {FIELD_TYPE_META[field.type].label}
        </span>

        <span className="xform-field-spacer" />

        <div className="xform-field-header-right" onClick={(e) => e.stopPropagation()}>
          <span className="xform-toggle-label">必填</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
            />
          </div>

          <span className="xform-toggle-label">啟用</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={field.enabled}
              onChange={(e) => {
                updateField({ enabled: e.target.checked });
                if (!e.target.checked && expanded) onToggleExpand();
              }}
            />
          </div>

          <button className="btn btn-sm btn-light text-danger" title="刪除" onClick={() => onDelete(field.id)}>
            <i className="bi bi-trash" />
          </button>

          <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} xform-expand-icon`} />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="xform-field-body">
          <div className="xform-form-group">
            <label className="xform-form-label">題目</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如：您的職位"
            />
          </div>

          {!showDesc ? (
            <div className="xform-form-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDesc(true)}
              >
                <i className="bi bi-plus me-1" />
                新增補充說明
              </button>
            </div>
          ) : (
            <div className="xform-form-group">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="xform-form-label mb-0">補充說明</label>
                <button
                  className="btn btn-sm btn-light text-muted"
                  title="移除說明"
                  onClick={() => {
                    updateField({ description: "" });
                    setShowDesc(false);
                  }}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
              <RichTextEditor
                content={field.description || ""}
                onChange={(html) => updateField({ description: html })}
              />
            </div>
          )}

          {showHintSection && (
            <div className="xform-form-group">
              <div className="xform-hint-mode-bar">
                <label className="xform-form-label mb-0">輸入提示</label>
                <div className="xform-hint-mode-btns">
                  <button
                    type="button"
                    className={`xform-hint-btn ${hintMode === "none" ? "active" : ""}`}
                    onClick={() => handleHintModeChange("none")}
                  >
                    不使用
                  </button>
                  <button
                    type="button"
                    className={`xform-hint-btn ${hintMode === "placeholder" ? "active" : ""}`}
                    onClick={() => handleHintModeChange("placeholder")}
                  >
                    提示文字
                  </button>
                  <button
                    type="button"
                    className={`xform-hint-btn ${hintMode === "default_value" ? "active" : ""}`}
                    onClick={() => handleHintModeChange("default_value")}
                  >
                    預設值
                  </button>
                </div>
              </div>
              {hintMode === "placeholder" && (
                <input
                  type="text"
                  className="form-control form-control-sm mt-2"
                  value={field.placeholder || ""}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  placeholder="例如：請輸入..."
                />
              )}
              {hintMode === "default_value" && (
                <input
                  type="text"
                  className="form-control form-control-sm mt-2"
                  value={field.defaultValue || ""}
                  onChange={(e) => updateField({ defaultValue: e.target.value })}
                  placeholder="例如：預設內容"
                />
              )}
            </div>
          )}

          {hasOptions && (
            <div className="xform-form-group">
              <label className="xform-form-label">選項</label>
              {(field.options || []).map((opt, i) => (
                <div key={opt.id} className="xform-option-row">
                  <span className="xform-option-num">{i + 1}.</span>
                  <input
                    type="text"
                    className="form-control form-control-sm flex-grow-1"
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-light text-danger"
                    onClick={() => removeOption(opt.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              ))}
              <button className="btn btn-outline-secondary btn-sm mt-1" onClick={addOption}>
                + 新增選項
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
