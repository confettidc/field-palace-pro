import { useState } from "react";
import { FieldType, FIELD_TYPE_META, ADDABLE_FIELD_TYPES, ContentBlockStyle, CONTENT_BLOCK_META } from "@/types/formField";

const fieldIconMap: Record<FieldType, string> = {
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

type AddCategory = "field" | "content_block";

const SINGLETON_FIELD_TYPES: FieldType[] = ["subscribe_invite", "terms_conditions"];

interface Props {
  onAddField: (type: FieldType) => void;
  onAddContentBlock: (style: ContentBlockStyle) => void;
  onCancel: () => void;
  existingFieldTypes?: FieldType[];
}

export default function AddFieldPanel({ onAddField, onAddContentBlock, onCancel, existingFieldTypes = [] }: Props) {
  const [category, setCategory] = useState<AddCategory>("field");

  return (
    <div className="xform-add-panel-wrapper">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="xform-add-panel-title">新增項目</h2>
        <button className="btn btn-sm btn-light" onClick={onCancel}>取消</button>
      </div>

      {/* Category tabs */}
      <div className="xform-category-tabs">
        <button
          className={`xform-category-tab ${category === "field" ? "active" : ""}`}
          onClick={() => setCategory("field")}
        >
          <i className="bi bi-input-cursor-text me-1" />
          表單欄位
        </button>
        <button
          className={`xform-category-tab ${category === "content_block" ? "active" : ""}`}
          onClick={() => setCategory("content_block")}
        >
          <i className="bi bi-layout-text-window me-1" />
          內容區塊
        </button>
      </div>

      {/* Field types */}
      {category === "field" && (
        <div className="xform-add-grid">
          {ADDABLE_FIELD_TYPES.map((key) => {
            const isSingleton = SINGLETON_FIELD_TYPES.includes(key);
            const isDisabled = isSingleton && existingFieldTypes.includes(key);
            return (
              <button
                key={key}
                className={`xform-add-btn ${isDisabled ? "xform-add-btn-disabled" : ""}`}
                onClick={() => !isDisabled && onAddField(key)}
                disabled={isDisabled}
              >
                <i className={`bi ${fieldIconMap[key]}`} />
                {FIELD_TYPE_META[key].label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content block styles */}
      {category === "content_block" && (
        <div className="xform-add-grid">
          {(Object.entries(CONTENT_BLOCK_META) as [ContentBlockStyle, { label: string; icon: string }][]).map(([key, meta]) => (
            <button key={key} className="xform-add-btn" onClick={() => onAddContentBlock(key)}>
              <i className={`bi ${meta.icon}`} />
              {meta.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
