import { useState, useCallback } from "react";
import { FormField, FieldType, FIELD_TYPE_META, FieldOption, DateConfig, DEFAULT_DATE_CONFIG, ChoiceAdvancedConfig, PhoneConfig, DEFAULT_PHONE_CONFIG, COMMON_COUNTRY_CODES, RatingMatrixConfig, DEFAULT_RATING_MATRIX_CONFIG, RatingMatrixRow, SubscribeConfig, DEFAULT_SUBSCRIBE_CONFIG, TermsConfig, DEFAULT_TERMS_CONFIG, FileUploadConfig, DEFAULT_FILE_UPLOAD_CONFIG } from "@/types/formField";
import RichTextEditor from "./RichTextEditor";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

const iconMap: Record<FieldType, string> = {
  short_text: "bi-type",
  long_text: "bi-text-paragraph",
  single_choice: "bi-record-circle",
  multiple_choice: "bi-check-square",
  dropdown: "bi-chevron-down",
  rating_matrix: "bi-bar-chart-steps",
  date: "bi-calendar",
  file_upload: "bi-upload",
  number: "bi-hash",
  email: "bi-envelope",
  phone: "bi-phone",
  subscribe_invite: "bi-bell",
  terms_conditions: "bi-file-earmark-text",
};

type HintMode = "none" | "placeholder";

const DEFAULT_CHOICE_CONFIG: ChoiceAdvancedConfig = {
  allowOther: false,
  otherLabel: "以上皆非，我的答案是",
  showTags: false,
  showDefaultSelection: false,
};

interface Props {
  field: FormField;
  expanded: boolean;
  questionNumber?: number;
  onToggleExpand: () => void;
  onUpdate: (field: FormField) => void;
  onDelete: (id: string) => void;
}

export default function FormFieldCard({ field, expanded, questionNumber, onToggleExpand, onUpdate, onDelete }: Props) {
  const [showDesc, setShowDesc] = useState(!!field.description);
  const [hintMode, setHintMode] = useState<HintMode>(
    field.placeholder ? "placeholder" : "none"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ratingTab, setRatingTab] = useState<"items" | "levels">("items");
  

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const optionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleOptionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const options = field.options || [];
    const oldIdx = options.findIndex(o => o.id === active.id);
    const newIdx = options.findIndex(o => o.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onUpdate({ ...field, options: arrayMove(options, oldIdx, newIdx) });
  }, [field, onUpdate]);

  const handleRatingRowDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const rc = field.ratingMatrixConfig || DEFAULT_RATING_MATRIX_CONFIG;
    const oldIdx = rc.rows.findIndex(r => r.id === active.id);
    const newIdx = rc.rows.findIndex(r => r.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onUpdate({ ...field, ratingMatrixConfig: { ...rc, rows: arrayMove(rc.rows, oldIdx, newIdx) } });
  }, [field, onUpdate]);

  const handleRatingLevelDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const rc = field.ratingMatrixConfig || DEFAULT_RATING_MATRIX_CONFIG;
    const oldIdx = rc.ratingLevels.findIndex((_, i) => `level-${i}` === active.id);
    const newIdx = rc.ratingLevels.findIndex((_, i) => `level-${i}` === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onUpdate({ ...field, ratingMatrixConfig: { ...rc, ratingLevels: arrayMove(rc.ratingLevels, oldIdx, newIdx) } });
  }, [field, onUpdate]);

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
  const isPhone = field.type === "phone";
  const isRatingMatrix = field.type === "rating_matrix";
  const isFileUpload = field.type === "file_upload";
  const isSubscribe = field.type === "subscribe_invite";
  const isTerms = field.type === "terms_conditions";
  const isSpecialField = isSubscribe || isTerms;
  const showHintSection = !hasOptions && !isDate && !isPhone && !isRatingMatrix && !isFileUpload && !isSpecialField;
  const showTitleField = !isSpecialField;
  const showDescSection = !isSpecialField;
  const dateConfig = field.dateConfig || DEFAULT_DATE_CONFIG;
  const choiceConfig = field.choiceConfig || DEFAULT_CHOICE_CONFIG;
  const phoneConfig = field.phoneConfig || DEFAULT_PHONE_CONFIG;
  const ratingConfig = field.ratingMatrixConfig || DEFAULT_RATING_MATRIX_CONFIG;
  const displayLabel = field.label || field.defaultLabel;
  const subscribeConfig = field.subscribeConfig || DEFAULT_SUBSCRIBE_CONFIG;
  const termsConfig = field.termsConfig || DEFAULT_TERMS_CONFIG;
  const fileUploadConfig = field.fileUploadConfig || DEFAULT_FILE_UPLOAD_CONFIG;

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
      <div className="xform-field-header">
        <div className="xform-drag-handle" {...attributes} {...listeners}>
          <i className="bi bi-grip-vertical" />
        </div>
        <div className="xform-field-header-main" onClick={onToggleExpand}>
          {questionNumber !== undefined && (
            <span className="xform-question-number">{questionNumber}.</span>
          )}

          <span
            className="xform-field-label-text"
            data-tip={displayLabel.length > 20 ? displayLabel : undefined}
          >
            {displayLabel}
          </span>

           <span className={`xform-field-type-badge ${field.profileKey ? "xform-badge-profile" : ""}`}>
            <i className={`bi ${iconMap[field.type]}`} />
            {FIELD_TYPE_META[field.type].label}
          </span>
        </div>

        <div className="xform-field-header-right">
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
          message={`確定刪除「${displayLabel}」？`}
          onConfirm={() => { onDelete(field.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Body */}
      {expanded && (
        <div className="xform-field-body">
          {showTitleField && (
          <div className="xform-form-group">
            <label className="xform-form-label">題目</label>
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
          </div>
          )}

          {isSubscribe && (
            <>
              <div className="xform-form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="xform-form-label mb-0">訂閱說明</label>
                  <label className="xform-date-check-label mb-0" style={{ fontSize: "0.85rem" }}>
                    <input
                      type="checkbox"
                      checked={subscribeConfig.defaultChecked}
                      onChange={(e) => updateField({ subscribeConfig: { ...subscribeConfig, defaultChecked: e.target.checked } })}
                    />
                    <span>預設勾選</span>
                  </label>
                </div>
                <div className="xform-desc-editor-wrap mt-2">
                  <RichTextEditor
                    content={subscribeConfig.subscribeText}
                    onChange={(html) => updateField({ subscribeConfig: { ...subscribeConfig, subscribeText: html } })}
                  />
                </div>
              </div>
            </>
          )}

          {isTerms && (
            <>
              <div className="xform-form-group">
                <label className="xform-form-label">條款說明</label>
                <div className="xform-desc-editor-wrap">
                  <RichTextEditor
                    content={termsConfig.termsText}
                    onChange={(html) => updateField({ termsConfig: { ...termsConfig, termsText: html } })}
                  />
                </div>
              </div>

              <div className="xform-form-group">
                <label className="xform-form-label">條款視窗</label>
                <div className="xform-desc-editor-wrap">
                  <RichTextEditor
                    content={termsConfig.termsWindowContent}
                    onChange={(html) => updateField({ termsConfig: { ...termsConfig, termsWindowContent: html } })}
                  />
                </div>
              </div>
            </>
          )}

          {showDescSection && !showDesc && (
            <div className="xform-form-group">
               <button
                className="btn btn-sm xform-add-desc-btn"
                onClick={() => setShowDesc(true)}
              >
                + 補充說明
              </button>
            </div>
          )}
          {showDescSection && showDesc && (
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

                {dateConfig.includeYear && (() => {
                  const yearOptions = [];
                  for (let y = 1950; y <= new Date().getFullYear(); y++) yearOptions.push(y);
                  return (
                    <div className="xform-date-year-range-inline">
                      <span className="xform-date-range-label">年份範圍</span>
                      <select className="form-control form-control-sm xform-year-input"
                        value={dateConfig.yearStart}
                        onChange={(e) => updateField({ dateConfig: { ...dateConfig, yearStart: parseInt(e.target.value) } })}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <span className="xform-date-range-sep">～</span>
                      <select className="form-control form-control-sm xform-year-input"
                        value={dateConfig.yearEnd}
                        onChange={(e) => updateField({ dateConfig: { ...dateConfig, yearEnd: parseInt(e.target.value) } })}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  );
                })()}
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
                  {dateConfig.includeYear && (() => {
                    const yOpts: number[] = [];
                    for (let y = dateConfig.yearStart; y <= dateConfig.yearEnd; y++) yOpts.push(y);
                    return (
                      <>
                        <select className="form-select form-select-sm xform-date-select">
                          <option>--</option>
                          {dateConfig.allowNA && <option value="__na__">不適用</option>}
                          {yOpts.map(y => <option key={y}>{y}</option>)}
                        </select>
                        <span className="xform-date-sep">年</span>
                      </>
                    );
                  })()}
                  {dateConfig.includeMonth && (
                    <>
                      <select className="form-select form-select-sm xform-date-select">
                        <option>--</option>
                        {dateConfig.allowNA && <option value="__na__">不適用</option>}
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                      </select>
                      <span className="xform-date-sep">月</span>
                    </>
                  )}
                  {dateConfig.includeDay && (
                    <>
                      <select className="form-select form-select-sm xform-date-select">
                        <option>--</option>
                        {dateConfig.allowNA && <option value="__na__">不適用</option>}
                        {Array.from({ length: 31 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                      </select>
                      <span className="xform-date-sep">日</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isPhone && (
            <div className="xform-form-group">
              <label className="xform-form-label">進階設定</label>
              <div className="xform-phone-config">
                <div className="xform-phone-mode-select">
                  <label className="xform-phone-mode-option" onClick={() => updateField({ phoneConfig: { ...phoneConfig, acceptAll: true, allowedCodes: [] } })}>
                    <input type="radio" checked={phoneConfig.acceptAll} readOnly />
                    <span>預設（接受全球區碼登記）</span>
                  </label>
                  <label className="xform-phone-mode-option" onClick={() => updateField({ phoneConfig: { ...phoneConfig, acceptAll: false, allowedCodes: phoneConfig.allowedCodes.length ? phoneConfig.allowedCodes : ["886"] } })}>
                    <input type="radio" checked={!phoneConfig.acceptAll} readOnly />
                    <span>只接受以下區碼登記</span>
                  </label>
                </div>
                {!phoneConfig.acceptAll && (
                  <div className="xform-phone-codes">
                    {phoneConfig.allowedCodes.map((code, idx) => {
                      const found = COMMON_COUNTRY_CODES.find(c => c.code === code);
                      return (
                        <div key={idx} className="xform-phone-code-row">
                          <select
                            className="form-select form-select-sm"
                            value={code}
                            onChange={(e) => {
                              const newCodes = [...phoneConfig.allowedCodes];
                              newCodes[idx] = e.target.value;
                              updateField({ phoneConfig: { ...phoneConfig, allowedCodes: newCodes } });
                            }}
                          >
                            {COMMON_COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                          </select>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => {
                            const newCodes = phoneConfig.allowedCodes.filter((_, i) => i !== idx);
                            updateField({ phoneConfig: { ...phoneConfig, allowedCodes: newCodes.length ? newCodes : ["886"], acceptAll: newCodes.length === 0 } });
                          }}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      );
                    })}
                    <button className="btn btn-sm xform-add-option-btn" onClick={() => {
                      updateField({ phoneConfig: { ...phoneConfig, allowedCodes: [...phoneConfig.allowedCodes, "886"] } });
                    }}>
                      + 新增
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isFileUpload && (
            <div className="xform-form-group">
              <label className="xform-form-label">允許上傳的檔案類型</label>
              <div className="xform-file-upload-config">
                <label className="xform-file-upload-row">
                  <input
                    type="checkbox"
                    checked={fileUploadConfig.image.enabled}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, image: { ...fileUploadConfig.image, enabled: e.target.checked } } })}
                  />
                  <span className="xform-file-upload-label">圖像 (JPG/JPEG、GIF、PNG)，不能大於</span>
                  <input
                    type="number"
                    className="form-control form-control-sm xform-file-size-input"
                    value={fileUploadConfig.image.maxSizeMB}
                    min={1}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, image: { ...fileUploadConfig.image, maxSizeMB: parseInt(e.target.value) || 1 } } })}
                  />
                  <span className="xform-file-upload-unit">MB</span>
                </label>
                <label className="xform-file-upload-row">
                  <input
                    type="checkbox"
                    checked={fileUploadConfig.document.enabled}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, document: { ...fileUploadConfig.document, enabled: e.target.checked } } })}
                  />
                  <span className="xform-file-upload-label">文件 (PDF)，限制不能大於</span>
                  <input
                    type="number"
                    className="form-control form-control-sm xform-file-size-input"
                    value={fileUploadConfig.document.maxSizeMB}
                    min={1}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, document: { ...fileUploadConfig.document, maxSizeMB: parseInt(e.target.value) || 1 } } })}
                  />
                  <span className="xform-file-upload-unit">MB</span>
                </label>
                <label className="xform-file-upload-row">
                  <input
                    type="checkbox"
                    checked={fileUploadConfig.video.enabled}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, video: { ...fileUploadConfig.video, enabled: e.target.checked } } })}
                  />
                  <span className="xform-file-upload-label">影片 (MP4、MOV)，不能大於</span>
                  <input
                    type="number"
                    className="form-control form-control-sm xform-file-size-input"
                    value={fileUploadConfig.video.maxSizeMB}
                    min={1}
                    onChange={(e) => updateField({ fileUploadConfig: { ...fileUploadConfig, video: { ...fileUploadConfig.video, maxSizeMB: parseInt(e.target.value) || 1 } } })}
                  />
                  <span className="xform-file-upload-unit">MB</span>
                </label>
              </div>
            </div>
          )}

          {isRatingMatrix && (
            <div className="xform-form-group">
              {/* Tabs for 評分項目 / 評分等級 */}
              <div className="xform-rating-tabs">
                <button
                  type="button"
                  className={`xform-rating-tab ${ratingTab === "items" ? "active" : ""}`}
                  onClick={() => setRatingTab("items")}
                >
                  評分項目
                </button>
                <button
                  type="button"
                  className={`xform-rating-tab ${ratingTab === "levels" ? "active" : ""}`}
                  onClick={() => setRatingTab("levels")}
                >
                  評分等級
                </button>
              </div>

              {/* Tab content: 評分項目 */}
              {ratingTab === "items" && (
                <div className="xform-rating-tab-content">
                  <DndContext sensors={optionSensors} collisionDetection={closestCenter} onDragEnd={handleRatingRowDragEnd}>
                    <SortableContext items={ratingConfig.rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                      {ratingConfig.rows.map((row, i) => (
                        <SortableRatingRow key={row.id} row={row} index={i}
                          onUpdateRow={(id, label) => {
                            const newRows = ratingConfig.rows.map(r => r.id === id ? { ...r, label } : r);
                            updateField({ ratingMatrixConfig: { ...ratingConfig, rows: newRows } });
                          }}
                          onDeleteRow={(id) => {
                            if (ratingConfig.rows.length <= 1) return;
                            const newRows = ratingConfig.rows.filter(r => r.id !== id);
                            updateField({ ratingMatrixConfig: { ...ratingConfig, rows: newRows } });
                          }}
                          disableDelete={ratingConfig.rows.length <= 1}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <button className="btn btn-sm xform-add-option-btn mt-1" onClick={() => {
                    let maxNum = 0;
                    for (const r of ratingConfig.rows) {
                      const match = r.label.match(/^項目\s*(\d+)$/);
                      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
                    }
                    const newRow: RatingMatrixRow = { id: crypto.randomUUID(), label: `項目 ${maxNum + 1}`, enabled: true };
                    updateField({ ratingMatrixConfig: { ...ratingConfig, rows: [...ratingConfig.rows, newRow] } });
                  }}>
                    + 項目
                  </button>
                </div>
              )}

              {/* Tab content: 評分等級 */}
              {ratingTab === "levels" && (
                <div className="xform-rating-tab-content">
                  <DndContext sensors={optionSensors} collisionDetection={closestCenter} onDragEnd={handleRatingLevelDragEnd}>
                    <SortableContext items={ratingConfig.ratingLevels.map((_, i) => `level-${i}`)} strategy={verticalListSortingStrategy}>
                      {ratingConfig.ratingLevels.map((level, i) => (
                        <SortableRatingLevel key={`level-${i}`} id={`level-${i}`} level={level} index={i}
                          onUpdateLevel={(idx, val) => {
                            const newLevels = [...ratingConfig.ratingLevels];
                            newLevels[idx] = val;
                            updateField({ ratingMatrixConfig: { ...ratingConfig, ratingLevels: newLevels } });
                          }}
                          onDeleteLevel={(idx) => {
                            if (ratingConfig.ratingLevels.length <= 2) return;
                            const newLevels = ratingConfig.ratingLevels.filter((_, j) => j !== idx);
                            updateField({ ratingMatrixConfig: { ...ratingConfig, ratingLevels: newLevels } });
                          }}
                          disableDelete={ratingConfig.ratingLevels.length <= 2}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <button className="btn btn-sm xform-add-option-btn mt-1" onClick={() => {
                    const newLevels = [...ratingConfig.ratingLevels, `等級 ${ratingConfig.ratingLevels.length + 1}`];
                    updateField({ ratingMatrixConfig: { ...ratingConfig, ratingLevels: newLevels } });
                  }}>
                    + 等級
                  </button>
                </div>
              )}

              {/* Preview area */}
              <div className="xform-rating-preview-area">
                <div className="xform-rating-preview-header">
                  <label className="xform-form-label mb-0">預覽</label>
                  <div className="form-check ms-auto">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`rating-unique-${field.id}`}
                      checked={ratingConfig.allowMultipleRatings}
                      onChange={(e) => updateField({ ratingMatrixConfig: { ...ratingConfig, allowMultipleRatings: e.target.checked } })}
                    />
                    <label className="form-check-label small" htmlFor={`rating-unique-${field.id}`}>
                      特別限制 : 在此題目裡，同一等級只能選一次
                    </label>
                  </div>
                </div>
                <div className="xform-rating-preview">
                  <table className="xform-rating-table">
                    <thead>
                      <tr>
                        <th></th>
                        {ratingConfig.ratingLevels.map((level, i) => (
                          <th key={i} className="xform-rating-th">{level}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ratingConfig.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="xform-rating-td-label">{row.label}</td>
                          {ratingConfig.ratingLevels.map((_, i) => (
                            <td key={i} className="xform-rating-td-radio">
                              <input type="radio" disabled name={`preview-${row.id}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <DndContext sensors={optionSensors} collisionDetection={closestCenter} onDragEnd={handleOptionDragEnd}>
                <SortableContext items={(field.options || []).map(o => o.id)} strategy={verticalListSortingStrategy}>
                  {(field.options || []).map((opt, i) => (
                    <SortableOptionRow key={opt.id} opt={opt} index={i} field={field} choiceConfig={choiceConfig}
                      onUpdateOption={updateOption} onRemoveOption={removeOption} onSetDefault={setDefaultOption}
                      onAddTag={addTagToOption} onRemoveTag={removeTagFromOption} />
                  ))}
                </SortableContext>
              </DndContext>

              {/* "Others" free-text option – above add button */}
              {choiceConfig.allowOther && (
                <div className="xform-other-row">
                  <span className="xform-option-num">{(field.options || []).length + 1}.</span>
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

/* ===== Sortable Option Row ===== */
function SortableOptionRow({ opt, index, field, choiceConfig, onUpdateOption, onRemoveOption, onSetDefault, onAddTag, onRemoveTag }: {
  opt: FieldOption; index: number; field: FormField; choiceConfig: ChoiceAdvancedConfig;
  onUpdateOption: (id: string, label: string) => void; onRemoveOption: (id: string) => void;
  onSetDefault: (id: string) => void; onAddTag: (id: string, tag: string) => void; onRemoveTag: (id: string, idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opt.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="xform-option-item">
      <div className="xform-option-row">
        {choiceConfig.showDefaultSelection && (
          <input
            type={field.type === "multiple_choice" ? "checkbox" : "radio"}
            className="xform-option-default-radio"
            checked={!!opt.isDefault}
            onChange={() => onSetDefault(opt.id)}
            title="設為預選"
          />
        )}
        <span className="xform-option-num">{index + 1}.</span>
        <input
          type="text"
          className="form-control form-control-sm flex-grow-1"
          value={opt.label}
          onChange={(e) => onUpdateOption(opt.id, e.target.value)}
        />
        <button className="btn btn-sm xform-option-action-btn xform-option-move-btn" title="拖曳排序" {...attributes} {...listeners}>
          <i className="bi bi-arrows-move" />
        </button>
        <button className="btn btn-sm xform-option-action-btn xform-delete-icon-btn" onClick={() => onRemoveOption(opt.id)}>
          <i className="bi bi-trash" />
        </button>
      </div>
      {choiceConfig.showTags && (
        <div className="xform-option-tags" style={choiceConfig.showDefaultSelection ? { paddingLeft: 'calc(16px + 18px + 1rem)' } : undefined}>
          {(opt.tags || []).map((tag, ti) => (
            <span key={ti} className="xform-tag">
              {tag}
              <button onClick={() => onRemoveTag(opt.id, ti)}>×</button>
            </span>
          ))}
          <span className="xform-tag-add-btn" onClick={(e) => { const input = e.currentTarget.querySelector('input'); if (input) input.focus(); }}>
            <i className="bi bi-plus" />
            <input
              type="text"
              className="xform-tag-inline-input"
              placeholder="輸入標籤"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) { onAddTag(opt.id, val); (e.target as HTMLInputElement).value = ""; }
                }
              }}
              onBlur={(e) => { const val = e.target.value; if (val.trim()) { onAddTag(opt.id, val); e.target.value = ""; } }}
            />
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== Sortable Rating Row ===== */
function SortableRatingRow({ row, index, onUpdateRow, onDeleteRow, disableDelete }: {
  row: RatingMatrixRow; index: number;
  onUpdateRow: (id: string, label: string) => void;
  onDeleteRow: (id: string) => void;
  disableDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="xform-rating-row-item">
      <div className="xform-option-row">
        <span className="xform-option-num">{index + 1}.</span>
        <input type="text" className="form-control form-control-sm flex-grow-1" value={row.label}
          onChange={(e) => onUpdateRow(row.id, e.target.value)} />
        <button className="btn btn-sm xform-option-action-btn xform-option-move-btn" title="拖曳排序" {...attributes} {...listeners}>
          <i className="bi bi-arrows-move" />
        </button>
        <button className="btn btn-sm xform-option-action-btn xform-delete-icon-btn"
          onClick={() => onDeleteRow(row.id)} disabled={disableDelete}>
          <i className="bi bi-trash" />
        </button>
      </div>
    </div>
  );
}

/* ===== Sortable Rating Level ===== */
function SortableRatingLevel({ id, level, index, onUpdateLevel, onDeleteLevel, disableDelete }: {
  id: string; level: string; index: number;
  onUpdateLevel: (idx: number, val: string) => void;
  onDeleteLevel: (idx: number) => void;
  disableDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="xform-rating-level-row">
      <span className="xform-option-num">{index + 1}.</span>
      <input type="text" className="form-control form-control-sm flex-grow-1" value={level}
        onChange={(e) => onUpdateLevel(index, e.target.value)} />
      <button className="btn btn-sm xform-option-action-btn xform-option-move-btn" title="拖曳排序" {...attributes} {...listeners}>
        <i className="bi bi-arrows-move" />
      </button>
      <button className="btn btn-sm xform-option-action-btn xform-delete-icon-btn"
        onClick={() => onDeleteLevel(index)} disabled={disableDelete}>
        <i className="bi bi-trash" />
      </button>
    </div>
  );
}
