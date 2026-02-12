import { useState } from "react";
import { FormSettings } from "@/types/formField";

interface Props {
  settings: FormSettings;
  onChange: (settings: FormSettings) => void;
}

export default function FormSettingsPanel({ settings, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<FormSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="xform-settings-panel">
      <div className="xform-settings-header" onClick={() => setExpanded(!expanded)}>
        <h3 className="xform-settings-title">
          <i className="bi bi-gear me-2" />
          表單設定
        </h3>
        <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} xform-expand-icon`} />
      </div>

      {expanded && (
        <div className="xform-settings-body">
          {/* Submit Button Text */}
          <div className="xform-settings-section">
            <label className="xform-form-label">送出按鈕文字</label>
            <input
              className="form-control form-control-sm"
              value={settings.submitButtonText}
              onChange={(e) => update({ submitButtonText: e.target.value })}
              placeholder="立即登記"
              maxLength={20}
            />
            <span className="xform-settings-hint">建議不超過 6 個字</span>
          </div>

          {/* Button Color */}
          <div className="xform-settings-section">
            <div className="xform-settings-section-header">
              <label className="xform-form-label mb-0">按鈕顏色</label>
              <label className="xform-settings-toggle" onClick={() => update({ enableCustomButtonColor: !settings.enableCustomButtonColor })}>
                <span className="xform-settings-toggle-text">開啟自訂顏色</span>
                <span className={`xform-toggle-switch ${settings.enableCustomButtonColor ? "active" : ""}`}>
                  <span className="xform-toggle-knob" />
                </span>
              </label>
            </div>

            {settings.enableCustomButtonColor && (
              <div className="xform-color-grid">
                <div className="xform-color-group">
                  <span className="xform-color-group-label">一般狀態樣式</span>
                  <div className="xform-color-row">
                    <div className="xform-color-item">
                      <label>按鈕底色</label>
                      <div className="xform-color-input-wrap">
                        <input
                          type="color"
                          value={settings.buttonBgColor}
                          onChange={(e) => update({ buttonBgColor: e.target.value })}
                        />
                        <span>{settings.buttonBgColor.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="xform-color-item">
                      <label>文字顏色</label>
                      <div className="xform-color-input-wrap">
                        <input
                          type="color"
                          value={settings.buttonTextColor}
                          onChange={(e) => update({ buttonTextColor: e.target.value })}
                        />
                        <span>{settings.buttonTextColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="xform-color-group">
                  <span className="xform-color-group-label">
                    <i className="bi bi-cursor me-1" />
                    滑鼠懸停效果<span className="xform-color-group-sub">(滑鼠移到按鈕上時)</span>
                  </span>
                  <div className="xform-color-row">
                    <div className="xform-color-item">
                      <label>懸停時底色</label>
                      <div className="xform-color-input-wrap">
                        <input
                          type="color"
                          value={settings.buttonHoverBgColor}
                          onChange={(e) => update({ buttonHoverBgColor: e.target.value })}
                        />
                        <span>{settings.buttonHoverBgColor.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="xform-color-item">
                      <label>懸停時文字顏色</label>
                      <div className="xform-color-input-wrap">
                        <input
                          type="color"
                          value={settings.buttonHoverTextColor}
                          onChange={(e) => update({ buttonHoverTextColor: e.target.value })}
                        />
                        <span>{settings.buttonHoverTextColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="xform-btn-preview">
                  <span className="xform-form-label">預覽</span>
                  <button
                    className="xform-btn-preview-button"
                    style={{
                      backgroundColor: settings.buttonBgColor,
                      color: settings.buttonTextColor,
                      border: 'none',
                      padding: '0.55rem 2rem',
                      borderRadius: '0.45rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = settings.buttonHoverBgColor;
                      e.currentTarget.style.color = settings.buttonHoverTextColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = settings.buttonBgColor;
                      e.currentTarget.style.color = settings.buttonTextColor;
                    }}
                  >
                    {settings.submitButtonText || "立即登記"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question Numbers */}
          <div className="xform-settings-section">
            <label
              className="xform-settings-toggle"
              onClick={() => update({ showQuestionNumbers: !settings.showQuestionNumbers })}
            >
              <span className="xform-settings-toggle-text">在表單頁面顯示問題編號</span>
              <span className={`xform-toggle-switch ${settings.showQuestionNumbers ? "active" : ""}`}>
                <span className="xform-toggle-knob" />
              </span>
            </label>
            <span className="xform-settings-hint">勾選後僅限問題類型欄位顯示編號，拖曳調整順序會自動重新編號</span>
          </div>
        </div>
      )}
    </div>
  );
}
