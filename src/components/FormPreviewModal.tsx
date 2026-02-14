import { FormItem, FormGroup, FormSettings, isContentBlock, isFormField, DEFAULT_DATE_CONFIG, DEFAULT_PHONE_CONFIG, DEFAULT_RATING_MATRIX_CONFIG, COMMON_COUNTRY_CODES } from "@/types/formField";

interface Props {
  open: boolean;
  onClose: () => void;
  items: FormItem[];
  groups: FormGroup[];
  settings: FormSettings;
  questionNumberMap: Map<string, number>;
}

function renderField(item: FormItem, settings: FormSettings, questionNumberMap: Map<string, number>) {
  if (isContentBlock(item)) {
    if (item.style === "divider") {
      return <hr key={item.id} className={`xform-preview-divider xform-divider-${item.dividerStyle || "solid"}`} />;
    }
    if (item.style === "spacer") {
      return <div key={item.id} style={{ height: "2rem" }} />;
    }
    if (item.style === "section_title") {
      return <h3 key={item.id} className="xform-preview-section-title" dangerouslySetInnerHTML={{ __html: item.content }} />;
    }
    if (item.style === "quote") {
      return <blockquote key={item.id} className="xform-preview-quote" dangerouslySetInnerHTML={{ __html: item.content }} />;
    }
    if (item.style === "bordered_content") {
      return <div key={item.id} className="xform-preview-bordered" dangerouslySetInnerHTML={{ __html: item.content }} />;
    }
    return <div key={item.id} className="xform-preview-text" dangerouslySetInnerHTML={{ __html: item.content }} />;
  }

  if (isFormField(item)) {
    const qNum = settings.showQuestionNumbers ? questionNumberMap.get(item.id) : undefined;
    return (
      <div key={item.id} className="xform-preview-field">
        <label className="xform-preview-label">
          {qNum !== undefined && <span className="xform-preview-qnum">{qNum}. </span>}
          {item.label || "未命名欄位"}
          {item.required && <span className="xform-preview-required">*</span>}
        </label>
        {item.description && (
          <div className="xform-preview-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
        )}

        {item.type === "short_text" && (
          <input type="text" className="xform-preview-input" placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
        )}
        {item.type === "long_text" && (
          <textarea className="xform-preview-input xform-preview-textarea" rows={3} placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
        )}
        {item.type === "number" && (
          <input type="number" className="xform-preview-input" placeholder={item.placeholder} defaultValue={item.defaultValue} readOnly />
        )}
        {item.type === "email" && (
          <input type="email" className="xform-preview-input" placeholder={item.placeholder || "example@email.com"} readOnly />
        )}
        {item.type === "phone" && (() => {
          const pc = item.phoneConfig || DEFAULT_PHONE_CONFIG;
          const codes = pc.acceptAll ? COMMON_COUNTRY_CODES : COMMON_COUNTRY_CODES.filter(c => pc.allowedCodes.includes(c.code));
          const displayCodes = codes.length > 0 ? codes : COMMON_COUNTRY_CODES;
          return (
            <div className="xform-preview-phone-row">
              <select className="xform-preview-phone-code">
                {displayCodes.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <input type="tel" className="xform-preview-input xform-preview-phone-input" placeholder={item.placeholder || "手機號碼"} readOnly />
            </div>
          );
        })()}
        {item.type === "date" && (() => {
          const dc = item.dateConfig || DEFAULT_DATE_CONFIG;
          const yearOpts: number[] = [];
          if (dc.includeYear) {
            for (let y = dc.yearStart; y <= dc.yearEnd; y++) yearOpts.push(y);
          }
          const monthOpts = Array.from({ length: 12 }, (_, i) => i + 1);
          const dayOpts = Array.from({ length: 31 }, (_, i) => i + 1);
          return (
            <div className="xform-date-preview-row">
              {dc.includeYear && (
                <>
                  <select className="xform-preview-select xform-date-select">
                    <option>--</option>
                    {dc.allowNA && <option value="__na__">不適用</option>}
                    {yearOpts.map(y => <option key={y}>{y}</option>)}
                  </select>
                  <span className="xform-date-sep">年</span>
                </>
              )}
              {dc.includeMonth && (
                <>
                  <select className="xform-preview-select xform-date-select">
                    <option>--</option>
                    {dc.allowNA && <option value="__na__">不適用</option>}
                    {monthOpts.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <span className="xform-date-sep">月</span>
                </>
              )}
              {dc.includeDay && (
                <>
                  <select className="xform-preview-select xform-date-select">
                    <option>--</option>
                    {dc.allowNA && <option value="__na__">不適用</option>}
                    {dayOpts.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <span className="xform-date-sep">日</span>
                </>
              )}
            </div>
          );
        })()}
        {item.type === "file_upload" && (
          <div className="xform-preview-file-upload">
            <i className="bi bi-cloud-arrow-up" />
            <span>點擊或拖曳上傳檔案</span>
          </div>
        )}
        {item.type === "rating_matrix" && (() => {
          const rc = item.ratingMatrixConfig || DEFAULT_RATING_MATRIX_CONFIG;
          return (
            <div className="xform-rating-preview">
              <table className="xform-rating-table">
                <thead>
                  <tr>
                    <th></th>
                    {rc.ratingLevels.map((level, i) => (
                      <th key={i} className="xform-rating-th">{level}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rc.rows.filter(r => r.enabled).map((row) => (
                    <tr key={row.id}>
                      <td className="xform-rating-td-label">{row.label}</td>
                      {rc.ratingLevels.map((_, i) => (
                        <td key={i} className="xform-rating-td-radio">
                          <input type="radio" name={`preview-${row.id}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
        {item.type === "single_choice" && (
          <div className="xform-preview-options">
            {(item.options || []).map((opt) => (
              <div key={opt.id} className="xform-preview-radio-item">
                <input className="xform-preview-radio" type="radio" name={item.id} disabled />
                <label className="xform-preview-radio-label">{opt.label}</label>
              </div>
            ))}
          </div>
        )}
        {item.type === "multiple_choice" && (
          <div className="xform-preview-options">
            {(item.options || []).map((opt) => (
              <div key={opt.id} className="xform-preview-radio-item">
                <input className="xform-preview-checkbox" type="checkbox" disabled />
                <label className="xform-preview-radio-label">{opt.label}</label>
              </div>
            ))}
          </div>
        )}
        {item.type === "dropdown" && (
          <select className="xform-preview-select" disabled>
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
}

export default function FormPreviewModal({ open, onClose, items, groups, settings, questionNumberMap }: Props) {
  if (!open) return null;

  const enabledItems = items.filter((i) => i.enabled);

  const getGroupItems = (groupId: string) =>
    enabledItems.filter((i) => {
      if (isContentBlock(i)) return i.groupId === groupId;
      if (isFormField(i)) return i.groupId === groupId;
      return false;
    });

  const ungroupedItems = enabledItems.filter((i) => {
    if (isContentBlock(i)) return !i.groupId;
    if (isFormField(i)) return !i.groupId;
    return true;
  });

  const btnStyle: React.CSSProperties = settings.enableCustomButtonColor
    ? { backgroundColor: settings.buttonBgColor, color: settings.buttonTextColor, border: 'none' }
    : {};

  return (
    <div className="xform-modal-overlay" onClick={onClose}>
      <div className="xform-modal xform-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="xform-modal-header xform-preview-modal-header">
          <h2 className="xform-modal-title">表單預覽</h2>
          <button className="btn btn-sm btn-light" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="xform-modal-body xform-preview-modal-body">
          {enabledItems.length === 0 && (
            <p className="text-muted text-center py-4" style={{ fontSize: "0.85rem" }}>沒有啟用的欄位</p>
          )}

          {groups.map((group) => {
            const groupItems = getGroupItems(group.id);
            if (groupItems.length === 0) return null;
            return (
              <div key={group.id} className="xform-preview-group">
                <div className="xform-preview-group-header">
                  <h3 className="xform-preview-group-name">{group.name || "未命名分組"}</h3>
                  {group.description && (
                    <div className="xform-preview-group-desc" dangerouslySetInnerHTML={{ __html: group.description }} />
                  )}
                </div>
                <div className="xform-preview-group-items">
                  {groupItems.map((item) => renderField(item, settings, questionNumberMap))}
                </div>
              </div>
            );
          })}

          {ungroupedItems.map((item) => renderField(item, settings, questionNumberMap))}

          {enabledItems.length > 0 && (
            <div className="xform-preview-submit-wrap">
              <button
                className="xform-preview-submit-btn"
                style={btnStyle}
                onMouseEnter={(e) => {
                  if (settings.enableCustomButtonColor) {
                    e.currentTarget.style.backgroundColor = settings.buttonHoverBgColor;
                    e.currentTarget.style.color = settings.buttonHoverTextColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (settings.enableCustomButtonColor) {
                    e.currentTarget.style.backgroundColor = settings.buttonBgColor;
                    e.currentTarget.style.color = settings.buttonTextColor;
                  }
                }}
              >
                {settings.submitButtonText || "立即登記"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
