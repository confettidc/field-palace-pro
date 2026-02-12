import { useState } from "react";
import { FormField, FieldType, FIELD_TYPE_META, FieldOption } from "@/types/formField";

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

interface Props {
  field: FormField;
  index: number;
  onUpdate: (field: FormField) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function FormFieldCard({ field, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showDesc, setShowDesc] = useState(!!field.description);

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
  const displayLabel = field.label || `未命名欄位`;

  return (
    <div className={`x-field-card ${!field.enabled ? "x-field-disabled" : ""}`}>
      {/* Header (collapsed view) */}
      <div className="x-field-header" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        {/* Move buttons */}
        <div className="x-field-move-btns" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-sm btn-light x-move-btn"
            disabled={isFirst}
            title="上移"
            onClick={() => onMoveUp(field.id)}
          >
            <i className="bi bi-chevron-up" />
          </button>
          <button
            className="btn btn-sm btn-light x-move-btn"
            disabled={isLast}
            title="下移"
            onClick={() => onMoveDown(field.id)}
          >
            <i className="bi bi-chevron-down" />
          </button>
        </div>

        {/* Field label */}
        <span className="x-field-label-text">{displayLabel}</span>

        {/* Type badge */}
        <span className="x-field-type-badge">
          <i className={`bi ${iconMap[field.type]}`} />
          {FIELD_TYPE_META[field.type].label}
        </span>

        <span className="x-field-spacer" />

        {/* Toggles + actions in collapsed */}
        <div className="x-field-header-right" onClick={(e) => e.stopPropagation()}>
          <span className="x-toggle-label">必填</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
            />
          </div>

          <span className="x-toggle-label">啟用</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={field.enabled}
              onChange={(e) => updateField({ enabled: e.target.checked })}
            />
          </div>

          <button className="btn btn-sm btn-light text-danger" title="刪除" onClick={() => onDelete(field.id)}>
            <i className="bi bi-trash" />
          </button>

          <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} x-expand-icon`} />
        </div>
      </div>

      {/* Body (expanded view) */}
      {expanded && (
        <div className="x-field-body">
          {/* Label */}
          <div className="x-form-group">
            <label className="x-form-label">題目</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如：您的職位"
            />
          </div>

          {/* Description (optional, toggle to show) */}
          {!showDesc ? (
            <div className="x-form-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDesc(true)}
              >
                <i className="bi bi-plus me-1" />
                新增補充說明
              </button>
            </div>
          ) : (
            <div className="x-form-group">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="x-form-label mb-0">補充說明</label>
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
              <textarea
                className="form-control form-control-sm"
                value={field.description || ""}
                onChange={(e) => updateField({ description: e.target.value })}
                placeholder="為題目加入額外說明..."
                rows={2}
              />
            </div>
          )}

          {/* Placeholder */}
          {!hasOptions && field.type !== "file_upload" && (
            <div className="x-form-group">
              <label className="x-form-label">提示文字</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={field.placeholder || ""}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="例如：請輸入..."
              />
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div className="x-form-group">
              <label className="x-form-label">選項</label>
              {(field.options || []).map((opt, i) => (
                <div key={opt.id} className="x-option-row">
                  <span className="x-option-num">{i + 1}.</span>
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
