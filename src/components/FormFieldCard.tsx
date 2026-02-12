import { useState } from "react";
import { FormField, FieldType, FIELD_TYPE_META, FieldOption, DateConfig, DEFAULT_DATE_CONFIG, ChoiceAdvancedConfig } from "@/types/formField";
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

const DEFAULT_CHOICE_CONFIG: ChoiceAdvancedConfig = {
  allowOther: false,
  otherLabel: "以上皆非，我的答案是",
  showTags: false,
  showDefaultSelection: false,
};

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateField = (patch: Partial<FormField>) => onUpdate({ ...field, ...patch });

  const addOption = () => {
    const options = field.options || [];
    // Find the highest existing option number and increment
    let maxNum = 0;
    for (const o of options) {
      const match = o.label.match(/^選項\s*(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    }
    const newOpt: FieldOption = { id: crypto.randomUUID(), label: `選項 ${maxNum + 1}` };
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
  const isDate = field.type === "date";
  const showHintSection = !hasOptions && !isDate && field.type !== "file_upload";
  const dateConfig = field.dateConfig || DEFAULT_DATE_CONFIG;
  const choiceConfig = field.choiceConfig || DEFAULT_CHOICE_CONFIG;
  const displayLabel = field.label || "未命名欄位";

  const toggleChoiceConfig = (key: keyof ChoiceAdvancedConfig) => {
    const current = field.choiceConfig || DEFAULT_CHOICE_CONFIG;
    updateField({ choiceConfig: { ...current, [key]: !current[key] } });
  };

  const setDefaultOption = (optId: string) => {
    const options = (field.options || []).map(o => ({ ...o, isDefault: o.id === optId ? !o.isDefault : (field.type === "single_choice" ? false : o.isDefault) }));
    updateField({ options });
  };

  const addTagToOption = (optId: string, tag: string) => {
    if (!tag.trim()) return;
    updateField({
      options: (field.options || []).map(o =>
        o.id === optId ? { ...o, tags: [...(o.tags || []), tag.trim()] } : o
      ),
    });
  };

  const removeTagFromOption = (optId: string, tagIndex: number) => {
    updateField({
      options: (field.options || []).map(o =>
        o.id === optId ? { ...o, tags: (o.tags || []).filter((_, i) => i !== tagIndex) } : o
      ),
    });
  };

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

  // Check if any advanced config is active
  const hasActiveAdvanced = choiceConfig.allowOther || choiceConfig.showDefaultSelection || choiceConfig.showTags;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`xform-field-card ${!field.enabled ? "xform-field-dimmed" : ""}`}
    >
      {/* Header */}
      <div className="xform-field-header" onClick={onToggleExpand} style={{ cursor: "pointer" }}>
        <div className="xform-drag-handle" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <i className="bi bi-grip-vertical" />
        </div>

        <span
          className="xform-field-label-text"
          data-tip={displayLabel.length > 20 ? displayLabel : undefined}
        >
          {displayLabel}
        </span>

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
          <div className="form-check form-switch xform-switch-green mb-0">
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

          <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} xform-expand-icon`} />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="xform-field-body">
          <div className="xform-form-group">
            <label className="xform-form-label">題目</label>
            <div className="xform-textarea-wrap">
              <textarea
                className="form-control form-control-sm xform-auto-resize"
                value={field.label}
                onChange={(e) => {
                  updateField({ label: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="例如：您的職位"
                rows={1}
              />
              <div className="xform-textarea-hint">Shift + Enter = 下一行</div>
            </div>
          </div>

          {!showDesc ? (
            <div className="xform-form-group">
               <button
                className="btn btn-sm xform-add-desc-btn"
                onClick={() => setShowDesc(true)}
              >
                + 補充說明
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
              <div className="xform-desc-editor-wrap">
                <RichTextEditor
                  content={field.description || ""}
                  onChange={(html) => updateField({ description: html })}
                />
                <div className="xform-desc-hint" style={{ borderTop: '1px solid #dee2e6' }}>Shift + Enter = 下一行</div>
              </div>
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
                <div className="xform-textarea-wrap mt-2">
                  <textarea
                    className="form-control form-control-sm xform-auto-resize"
                    value={field.placeholder || ""}
                    onChange={(e) => {
                      updateField({ placeholder: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="例如：請輸入..."
                    rows={1}
                  />
                  <div className="xform-textarea-hint">Shift + Enter = 下一行</div>
                </div>
              )}
              {hintMode === "default_value" && (
                <div className="xform-textarea-wrap mt-2">
                  <textarea
                    className="form-control form-control-sm xform-auto-resize"
                    value={field.defaultValue || ""}
                    onChange={(e) => {
                      updateField({ defaultValue: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="例如：預設內容"
                    rows={1}
                  />
                  <div className="xform-textarea-hint">Shift + Enter = 下一行</div>
                </div>
              )}
            </div>
          )}

          {isDate && (
            <div className="xform-form-group">
              <label className="xform-form-label">日期項目</label>
              <div className="xform-date-top-row">
                <div className="xform-date-checks">
                  <label className="xform-date-check-label">
                    <input type="checkbox" checked={dateConfig.includeYear}
                      onChange={(e) => updateField({ dateConfig: { ...dateConfig, includeYear: e.target.checked } })} />
                    <span>需輸入年份</span>
                  </label>
                  <label className="xform-date-check-label">
                    <input type="checkbox" checked={dateConfig.includeMonth}
                      onChange={(e) => updateField({ dateConfig: { ...dateConfig, includeMonth: e.target.checked } })} />
                    <span>需輸入月份</span>
                  </label>
                  <label className="xform-date-check-label">
                    <input type="checkbox" checked={dateConfig.includeDay}
                      onChange={(e) => updateField({ dateConfig: { ...dateConfig, includeDay: e.target.checked } })} />
                    <span>需輸入日子</span>
                  </label>
                </div>

                {dateConfig.includeYear && (
                  <div className="xform-date-year-range-inline">
                    <span className="xform-date-range-label">年份範圍</span>
                    <input type="number" className="form-control form-control-sm xform-year-input"
                      value={dateConfig.yearStart}
                      onChange={(e) => updateField({ dateConfig: { ...dateConfig, yearStart: parseInt(e.target.value) || 1950 } })} />
                    <span className="xform-date-range-sep">～</span>
                    <input type="number" className="form-control form-control-sm xform-year-input"
                      value={dateConfig.yearEnd}
                      onChange={(e) => updateField({ dateConfig: { ...dateConfig, yearEnd: parseInt(e.target.value) || new Date().getFullYear() } })} />
                  </div>
                )}
              </div>

              <div className="xform-date-na-option">
                <label className="xform-date-check-label">
                  <input type="checkbox" checked={dateConfig.allowNA}
                    onChange={(e) => updateField({ dateConfig: { ...dateConfig, allowNA: e.target.checked } })} />
                  <span>為每個項目增加「不適用」選項</span>
                </label>
              </div>

              {/* Mini preview */}
              <div className="xform-date-preview-box">
                <span className="xform-form-label">預覽</span>
                <div className="xform-date-preview-row">
                  {dateConfig.includeYear && (
                    <>
                      <select className="form-select form-select-sm xform-date-select" disabled>
                        <option>--</option>
                      </select>
                      <span className="xform-date-sep">年</span>
                    </>
                  )}
                  {dateConfig.includeMonth && (
                    <>
                      <select className="form-select form-select-sm xform-date-select" disabled>
                        <option>--</option>
                      </select>
                      <span className="xform-date-sep">月</span>
                    </>
                  )}
                  {dateConfig.includeDay && (
                    <>
                      <select className="form-select form-select-sm xform-date-select" disabled>
                        <option>--</option>
                      </select>
                      <span className="xform-date-sep">日</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasOptions && (
            <div className="xform-form-group">
              <div className="xform-options-header">
                <label className="xform-form-label mb-0">選項</label>
                <div
                  className={`xform-advanced-toggle-inline ${hasActiveAdvanced ? 'has-active' : ''}`}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <i className={`bi bi-gear`} />
                  <span>{hasActiveAdvanced ? '進階設定 (已選用)' : '進階設定'}</span>
                  <i className={`bi ${showAdvanced ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ fontSize: "0.65rem" }} />
                </div>
              </div>

              {showAdvanced && (
                <div className="xform-choice-advanced-body">
                  <div className="xform-choice-toolbar">
                    <button
                      type="button"
                      className={`xform-choice-toggle ${choiceConfig.allowOther ? "active" : ""}`}
                      onClick={() => toggleChoiceConfig("allowOther")}
                    >
                      <i className="bi bi-chat-dots" />
                      允許其他
                    </button>
                    <button
                      type="button"
                      className={`xform-choice-toggle ${choiceConfig.showDefaultSelection ? "active" : ""}`}
                      onClick={() => toggleChoiceConfig("showDefaultSelection")}
                    >
                      <i className="bi bi-check2-circle" />
                      設定預選答案
                    </button>
                    <button
                      type="button"
                      className={`xform-choice-toggle ${choiceConfig.showTags ? "active" : ""}`}
                      onClick={() => toggleChoiceConfig("showTags")}
                    >
                      <i className="bi bi-tags" />
                      為選項加標籤
                    </button>
                  </div>
                </div>
              )}

              {/* Option rows */}
              {(field.options || []).map((opt, i) => (
                <div key={opt.id} className="xform-option-item">
                  <div className="xform-option-row">
                    {choiceConfig.showDefaultSelection && (
                      <input
                        type={field.type === "multiple_choice" ? "checkbox" : "radio"}
                        className="xform-option-default-radio"
                        checked={!!opt.isDefault}
                        onChange={() => setDefaultOption(opt.id)}
                        title="設為預選"
                      />
                    )}
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
                  {choiceConfig.showTags && (
                    <div className="xform-option-tags">
                      {(opt.tags || []).map((tag, ti) => (
                        <span key={ti} className="xform-tag">
                          {tag}
                          <button onClick={() => removeTagFromOption(opt.id, ti)}>×</button>
                        </span>
                      ))}
                      <span
                        className="xform-tag-add-btn"
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          if (input) input.focus();
                        }}
                      >
                        <i className="bi bi-plus" />
                        <input
                          type="text"
                          className="xform-tag-inline-input"
                          placeholder="輸入標籤"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value;
                              if (val.trim()) {
                                addTagToOption(opt.id, val);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const val = e.target.value;
                            if (val.trim()) {
                              addTagToOption(opt.id, val);
                              e.target.value = "";
                            }
                          }}
                        />
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* "Others" free-text option – above add button */}
              {choiceConfig.allowOther && (
                <div className="xform-other-row">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ maxWidth: "280px" }}
                    value={choiceConfig.otherLabel}
                    onChange={(e) => updateField({ choiceConfig: { ...choiceConfig, otherLabel: e.target.value } })}
                  />
                  <span className="xform-other-row-label">用戶填答區</span>
                </div>
              )}

              <button className="btn btn-sm xform-add-option-btn mt-1" onClick={addOption}>
                + 選項
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
