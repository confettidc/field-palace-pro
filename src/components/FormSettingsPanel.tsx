import { useState, useRef, useEffect } from "react";
import { FormSettings, ProfileFieldKey, PROFILE_FIELDS } from "@/types/formField";

interface Props {
  settings: FormSettings;
  onChange: (settings: FormSettings) => void;
  onProfileToggle: (key: ProfileFieldKey, checked: boolean) => void;
}

export default function FormSettingsPanel({ settings, onChange, onProfileToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "submit" | "numbering">("profile");
  const panelRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<FormSettings>) => onChange({ ...settings, ...patch });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="xform-settings-popover-wrap" ref={panelRef}>
      <button
        className="btn btn-sm xform-settings-gear-btn"
        onClick={() => setOpen(!open)}
        title="表單設定"
      >
        <i className="bi bi-gear" />
      </button>

      {open && (
        <div className="xform-settings-dropdown">
          <div className="xform-settings-dropdown-header">
            <i className="bi bi-gear me-2" />
            表單設定
          </div>

          {/* Tabs */}
          <div className="xform-settings-tabs">
            <button
              className={`xform-settings-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              用戶輪廓
            </button>
            <button
              className={`xform-settings-tab ${activeTab === "submit" ? "active" : ""}`}
              onClick={() => setActiveTab("submit")}
            >
              送出按鈕
            </button>
            <button
              className={`xform-settings-tab ${activeTab === "numbering" ? "active" : ""}`}
              onClick={() => setActiveTab("numbering")}
            >
              編號
            </button>
          </div>

          <div className="xform-settings-dropdown-body">
            {activeTab === "profile" && (
              <div className="xform-profile-tab">
                <p className="xform-profile-desc">
                  輪廓欄位用來建立用戶的基本屬性；用戶填寫後，內容會寫入並更新到該用戶的個人資料，作為其身分與輪廓資訊的一部分。
                </p>
                <div className="xform-profile-list">
                  {PROFILE_FIELDS.map((pf) => {
                    const checked = settings.profileFields.includes(pf.key);
                    return (
                      <label key={pf.key} className="xform-profile-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => onProfileToggle(pf.key, e.target.checked)}
                        />
                        <i className={`bi ${pf.icon} xform-profile-item-icon`} />
                        <span>{pf.label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="xform-profile-hint">
                  <i className="bi bi-info-circle me-1" />
                  至少需勾選「電郵」或「手機」其中一項
                </p>
              </div>
            )}

            {activeTab === "numbering" && (
              <label
                className="xform-settings-simple-toggle"
                onClick={() => update({ showQuestionNumbers: !settings.showQuestionNumbers })}
              >
                <span className={`xform-toggle-switch ${settings.showQuestionNumbers ? "active" : ""}`}>
                  <span className="xform-toggle-knob" />
                </span>
                <span className="xform-settings-simple-toggle-text">順序列出問題編號</span>
              </label>
            )}

            {activeTab === "submit" && (
              <>
                {/* Button Text */}
                <div className="xform-settings-field">
                  <label className="xform-settings-field-label">按鈕文字</label>
                  <input
                    className="form-control form-control-sm"
                    value={settings.submitButtonText}
                    onChange={(e) => update({ submitButtonText: e.target.value })}
                    placeholder="立即登記"
                    maxLength={20}
                  />
                </div>

                {/* Color section - always visible, no toggle */}
                <div className="xform-settings-color-section">
                  <div className="xform-settings-section-label">
                    自訂顏色
                  </div>
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

                  {/* Preview - always shown */}
                  <div className="xform-btn-preview">
                    <button
                      className="xform-btn-preview-button"
                      style={{
                        backgroundColor: settings.buttonBgColor,
                        color: settings.buttonTextColor,
                        border: 'none',
                        padding: '0.4rem 1.5rem',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
