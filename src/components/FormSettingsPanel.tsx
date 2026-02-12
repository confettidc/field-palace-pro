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
          {/* Section 1: Submit Button */}
          <div className="xform-settings-card">
            <div className="xform-settings-card-header">
              <i className="bi bi-cursor-fill" />
              <span>送出按鈕</span>
            </div>
            <div className="xform-settings-card-body">
              {/* Button Text */}
              <div className="xform-settings-row">
                <label className="xform-settings-row-label">按鈕文字</label>
                <div className="xform-settings-row-control">
                  <input
                    className="form-control form-control-sm"
                    value={settings.submitButtonText}
                    onChange={(e) => update({ submitButtonText: e.target.value })}
                    placeholder="立即登記"
                    maxLength={20}
                  />
                  <span className="xform-settings-hint">建議不超過 6 個字</span>
                </div>
              </div>

              {/* Button Color Toggle */}
              <div className="xform-settings-row">
                <label className="xform-settings-row-label">自訂顏色</label>
                <div className="xform-settings-row-control">
                  <label
                    className="xform-settings-toggle"
                    onClick={() => update({ enableCustomButtonColor: !settings.enableCustomButtonColor })}
                  >
                    <span className={`xform-toggle-switch ${settings.enableCustomButtonColor ? "active" : ""}`}>
                      <span className="xform-toggle-knob" />
                    </span>
                  </label>
                </div>
              </div>

              {settings.enableCustomButtonColor && (
                <div className="xform-settings-color-section">
                  <div className="xform-color-pair-row">
                    <div className="xform-color-pair">
                      <label>底色</label>
                      <div className="xform-color-input-wrap">
                        <input type="color" value={settings.buttonBgColor} onChange={(e) => update({ buttonBgColor: e.target.value })} />
                        <span>{settings.buttonBgColor.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="xform-color-pair">
                      <label>文字</label>
                      <div className="xform-color-input-wrap">
                        <input type="color" value={settings.buttonTextColor} onChange={(e) => update({ buttonTextColor: e.target.value })} />
                        <span>{settings.buttonTextColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="xform-color-hover-label">
                    <i className="bi bi-cursor me-1" />
                    懸停效果
                  </div>
                  <div className="xform-color-pair-row">
                    <div className="xform-color-pair">
                      <label>底色</label>
                      <div className="xform-color-input-wrap">
                        <input type="color" value={settings.buttonHoverBgColor} onChange={(e) => update({ buttonHoverBgColor: e.target.value })} />
                        <span>{settings.buttonHoverBgColor.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="xform-color-pair">
                      <label>文字</label>
                      <div className="xform-color-input-wrap">
                        <input type="color" value={settings.buttonHoverTextColor} onChange={(e) => update({ buttonHoverTextColor: e.target.value })} />
                        <span>{settings.buttonHoverTextColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="xform-btn-preview">
                    <button
                      className="xform-btn-preview-button"
                      style={{
                        backgroundColor: settings.buttonBgColor,
                        color: settings.buttonTextColor,
                        border: 'none',
                        padding: '0.5rem 2rem',
                        borderRadius: '0.45rem',
                        fontWeight: 600,
                        fontSize: '0.92rem',
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
          </div>

          {/* Section 2: Display Options */}
          <div className="xform-settings-card">
            <div className="xform-settings-card-header">
              <i className="bi bi-layout-text-sidebar" />
              <span>顯示選項</span>
            </div>
            <div className="xform-settings-card-body">
              <div className="xform-settings-row">
                <label className="xform-settings-row-label">問題編號</label>
                <div className="xform-settings-row-control xform-settings-row-inline">
                  <span className="xform-settings-desc">在表單頁面顯示問題編號</span>
                  <label
                    className="xform-settings-toggle"
                    onClick={() => update({ showQuestionNumbers: !settings.showQuestionNumbers })}
                  >
                    <span className={`xform-toggle-switch ${settings.showQuestionNumbers ? "active" : ""}`}>
                      <span className="xform-toggle-knob" />
                    </span>
                  </label>
                </div>
              </div>
              <span className="xform-settings-hint">僅限問題類型欄位顯示，拖曳調整順序會自動重新編號</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
