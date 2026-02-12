import { FormItem, isContentBlock, isFormField, FIELD_TYPE_META, CONTENT_BLOCK_META } from "@/types/formField";

interface Props {
  open: boolean;
  onClose: () => void;
  items: FormItem[];
}

export default function FormPreviewModal({ open, onClose, items }: Props) {
  if (!open) return null;

  const enabledItems = items.filter((i) => i.enabled);

  return (
    <div className="xform-modal-overlay" onClick={onClose}>
      <div className="xform-modal" onClick={(e) => e.stopPropagation()}>
        <div className="xform-modal-header">
          <h2 className="xform-modal-title">表單預覽</h2>
          <button className="btn btn-sm btn-light" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="xform-modal-body">
          {enabledItems.length === 0 && (
            <p className="text-muted text-center py-4" style={{ fontSize: "0.85rem" }}>沒有啟用的欄位</p>
          )}
          {enabledItems.map((item) => {
            if (isContentBlock(item)) {
              if (item.style === "divider") {
                return <hr key={item.id} className={`xform-preview-divider xform-divider-${item.dividerStyle || "solid"}`} />;
              }
              if (item.style === "spacer") {
                return <div key={item.id} style={{ height: "2rem" }} />;
              }
              if (item.style === "section_title") {
                return (
                  <h3 key={item.id} className="xform-preview-section-title" dangerouslySetInnerHTML={{ __html: item.content }} />
                );
              }
              if (item.style === "quote") {
                return (
                  <blockquote key={item.id} className="xform-preview-quote" dangerouslySetInnerHTML={{ __html: item.content }} />
                );
              }
              if (item.style === "bordered_content") {
                return (
                  <div key={item.id} className="xform-preview-bordered" dangerouslySetInnerHTML={{ __html: item.content }} />
                );
              }
              return (
                <div key={item.id} className="xform-preview-text" dangerouslySetInnerHTML={{ __html: item.content }} />
              );
            }

            if (isFormField(item)) {
              const hasOptions = ["single_choice", "multiple_choice", "dropdown"].includes(item.type);
              return (
                <div key={item.id} className="xform-preview-field">
                  <label className="xform-preview-label">
                    {item.label || "未命名欄位"}
                    {item.required && <span className="xform-preview-required">*</span>}
                  </label>
                  {item.description && (
                    <div className="xform-preview-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
                  )}

                  {item.type === "short_text" && (
                    <input type="text" className="form-control form-control-sm" placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
                  )}
                  {item.type === "long_text" && (
                    <textarea className="form-control form-control-sm" rows={3} placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
                  )}
                  {item.type === "number" && (
                    <input type="number" className="form-control form-control-sm" placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
                  )}
                  {item.type === "email" && (
                    <input type="email" className="form-control form-control-sm" placeholder={item.placeholder || "example@email.com"} readOnly />
                  )}
                  {item.type === "phone" && (
                    <input type="tel" className="form-control form-control-sm" placeholder={item.placeholder || "0912-345-678"} readOnly />
                  )}
                  {item.type === "date" && (
                    <input type="date" className="form-control form-control-sm" readOnly />
                  )}
                  {item.type === "file_upload" && (
                    <div className="xform-preview-file-upload">
                      <i className="bi bi-cloud-arrow-up" />
                      <span>點擊或拖曳上傳檔案</span>
                    </div>
                  )}
                  {item.type === "single_choice" && (
                    <div className="xform-preview-options">
                      {(item.options || []).map((opt) => (
                        <div key={opt.id} className="form-check">
                          <input className="form-check-input" type="radio" name={item.id} disabled />
                          <label className="form-check-label">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === "multiple_choice" && (
                    <div className="xform-preview-options">
                      {(item.options || []).map((opt) => (
                        <div key={opt.id} className="form-check">
                          <input className="form-check-input" type="checkbox" disabled />
                          <label className="form-check-label">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === "dropdown" && (
                    <select className="form-select form-select-sm" disabled>
                      <option>請選擇...</option>
                      {(item.options || []).map((opt) => (
                        <option key={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
