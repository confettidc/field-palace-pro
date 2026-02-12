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
  onDuplicate: (id: string) => void;
}

export default function FormFieldCard({ field, index, onUpdate, onDelete, onDuplicate }: Props) {
  const [expanded, setExpanded] = useState(true);

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

  return (
    <div className={`x-field-card ${!field.enabled ? "x-field-disabled" : ""}`}>
      {/* Header */}
      <div className="x-field-header">
        <i className="bi bi-grip-vertical text-secondary" style={{ cursor: "grab" }} />
        <span className="x-field-index">{index}.</span>

        {/* Enable toggle */}
        <div className="form-check form-switch x-toggle mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={field.enabled}
            onChange={(e) => updateField({ enabled: e.target.checked })}
          />
        </div>

        <span className="x-field-type-badge">
          <i className={`bi ${iconMap[field.type]}`} />
          {FIELD_TYPE_META[field.type].label}
        </span>

        <span className="x-field-spacer" />

        {/* Type selector */}
        <select
          className="form-select form-select-sm"
          style={{ width: 140, fontSize: "0.78rem" }}
          value={field.type}
          onChange={(e) => {
            const newType = e.target.value as FieldType;
            const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(newType);
            updateField({
              type: newType,
              options: needsOptions && !field.options?.length
                ? [{ id: crypto.randomUUID(), label: "選項 1" }]
                : needsOptions ? field.options : undefined,
            });
          }}
        >
          {(Object.entries(FIELD_TYPE_META) as [FieldType, { label: string }][]).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>

        {/* Action buttons */}
        <div className="x-field-actions">
          <button className="btn btn-sm btn-light" title="複製" onClick={() => onDuplicate(field.id)}>
            <i className="bi bi-copy" />
          </button>
          <button className="btn btn-sm btn-light text-danger" title="刪除" onClick={() => onDelete(field.id)}>
            <i className="bi bi-trash" />
          </button>
          <button className="btn btn-sm btn-light" onClick={() => setExpanded(!expanded)}>
            <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="x-field-body">
          {/* Label */}
          <div className="x-form-group">
            <label className="x-form-label">題目名稱</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如：您的職位"
            />
          </div>

          {/* Description */}
          <div className="x-form-group">
            <label className="x-form-label">補充說明（選填）</label>
            <textarea
              className="form-control form-control-sm"
              value={field.description || ""}
              onChange={(e) => updateField({ description: e.target.value })}
              placeholder="為題目加入額外說明..."
              rows={2}
            />
          </div>

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

          {/* Required toggle */}
          <div className="x-field-footer">
            <span className="x-form-label mb-0">必填</span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={field.required}
                onChange={(e) => updateField({ required: e.target.checked })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
