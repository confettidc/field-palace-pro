import { useState, useRef, useEffect } from "react";
import { FormSettings } from "@/types/formField";

interface Props {
  settings: FormSettings;
  onChange: (settings: FormSettings) => void;
}

export default function FormSettingsPanel({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"numbering" | "submit">("numbering");
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
              className={`xform-settings-tab ${activeTab === "numbering" ? "active" : ""}`}
              onClick={() => setActiveTab("numbering")}
            >
              編號
            </button>
            <button
              className={`xform-settings-tab ${activeTab === "submit" ? "active" : ""}`}
              onClick={() => setActiveTab("submit")}
            >
              送出按鈕
            </button>
          </div>

          <div className="xform-settings-dropdown-body">
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
