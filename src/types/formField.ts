export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "rating_matrix"
  | "date"
  | "file_upload"
  | "number"
  | "email"
  | "phone"
  | "subscribe_invite"
  | "terms_conditions";

export type ContentBlockStyle =
  | "section_title"
  | "body_text"
  | "bordered_content"
  | "quote"
  | "divider"
  | "spacer"
  | "plain_text";

export interface FieldOption {
  id: string;
  label: string;
  tags?: string[];
  isDefault?: boolean;
}

export interface ChoiceAdvancedConfig {
  allowOther: boolean;
  otherLabel: string;
  showTags: boolean;
  showDefaultSelection: boolean;
}

export interface DateConfig {
  includeYear: boolean;
  includeMonth: boolean;
  includeDay: boolean;
  yearStart: number;
  yearEnd: number;
  allowNA: boolean;
}

export const DEFAULT_DATE_CONFIG: DateConfig = {
  includeYear: true,
  includeMonth: true,
  includeDay: true,
  yearStart: 1950,
  yearEnd: new Date().getFullYear(),
  allowNA: false,
};

export interface PhoneConfig {
  acceptAll: boolean;
  allowedCodes: string[];
  requireVerification: boolean;
}

export const DEFAULT_PHONE_CONFIG: PhoneConfig = {
  acceptAll: true,
  allowedCodes: [],
  requireVerification: false,
};

export const COMMON_COUNTRY_CODES = [
  { code: "886", label: "台灣 +886" },
  { code: "86", label: "中國 +86" },
  { code: "852", label: "香港 +852" },
  { code: "853", label: "澳門 +853" },
  { code: "81", label: "日本 +81" },
  { code: "82", label: "韓國 +82" },
  { code: "65", label: "新加坡 +65" },
  { code: "60", label: "馬來西亞 +60" },
  { code: "1", label: "美國/加拿大 +1" },
  { code: "44", label: "英國 +44" },
  { code: "61", label: "澳洲 +61" },
  { code: "49", label: "德國 +49" },
  { code: "33", label: "法國 +33" },
  { code: "66", label: "泰國 +66" },
  { code: "63", label: "菲律賓 +63" },
  { code: "84", label: "越南 +84" },
  { code: "62", label: "印尼 +62" },
  { code: "91", label: "印度 +91" },
];

/* ===== File Upload ===== */
export interface FileUploadCategory {
  enabled: boolean;
  maxSizeMB: number;
}

export interface FileUploadConfig {
  image: FileUploadCategory;   // JPG/JPEG, GIF, PNG
  document: FileUploadCategory; // PDF
  video: FileUploadCategory;   // MP4, MOV
}

export const DEFAULT_FILE_UPLOAD_CONFIG: FileUploadConfig = {
  image: { enabled: true, maxSizeMB: 5 },
  document: { enabled: false, maxSizeMB: 2 },
  video: { enabled: false, maxSizeMB: 200 },
};

/* ===== Subscribe Invite ===== */
export interface SubscribeConfig {
  showTitle: boolean;
  subscribeText: string;
  defaultChecked: boolean;
}

export const DEFAULT_SUBSCRIBE_CONFIG: SubscribeConfig = {
  showTitle: false,
  subscribeText: "我願意訂閱及收取【夢想科技】的最新活動及資訊",
  defaultChecked: false,
};

/* ===== Terms & Conditions ===== */
export interface TermsConfig {
  termsText: string;
  termsWindowContent: string;
}

export const DEFAULT_TERMS_CONFIG: TermsConfig = {
  termsText: '本人同意此網站或參與此活動的<u>條款及細則</u>',
  termsWindowContent: '【夢想科技】 平台的使用受以下條款和條件約束。使用者必須遵守相關法律規定並尊重他人的權利。禁止發布非法、侵權、虛假或誤導性的內容。平台保留隨時修改服務、終止賬戶或限制訪問的權利。使用者應對其賬戶安全負責，並承擔因使用平台而產生的所有風險。透過使用本平台，使用者同意受這些條款的約束。所有權利、條款和條件可以在平台的官方網站上查閱詳細信息。',
};

/* ===== Rating Matrix ===== */
export interface RatingMatrixRow {
  id: string;
  label: string;
  enabled: boolean;
}

export interface RatingMatrixConfig {
  ratingLevels: string[];
  rows: RatingMatrixRow[];
  allowMultipleRatings: boolean;
}

export const DEFAULT_RATING_MATRIX_CONFIG: RatingMatrixConfig = {
  ratingLevels: ["非常不滿意", "不滿意", "普通", "滿意", "非常滿意"],
  rows: [
    { id: crypto.randomUUID(), label: "項目 1", enabled: true },
  ],
  allowMultipleRatings: false,
};

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultLabel: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  enabled: boolean;
  options?: FieldOption[];
  dateConfig?: DateConfig;
  choiceConfig?: ChoiceAdvancedConfig;
  phoneConfig?: PhoneConfig;
  ratingMatrixConfig?: RatingMatrixConfig;
  subscribeConfig?: SubscribeConfig;
  termsConfig?: TermsConfig;
  fileUploadConfig?: FileUploadConfig;
  groupId?: string;
  profileKey?: ProfileFieldKey;
}

export type PageNextAction =
  | { type: "next" }          // go to next page in order (default)
  | { type: "page"; pageId: string }  // jump to specific page
  | { type: "submit" };       // submit the form

export interface FormGroup {
  id: string;
  name: string;
  defaultName: string;
  description?: string;
  nextAction?: PageNextAction;
}

export type ProfileFieldKey = "name" | "email" | "phone" | "gender";

export interface ProfileFieldDef {
  key: ProfileFieldKey;
  label: string;
  fieldType: FieldType;
  icon: string;
}

export const PROFILE_FIELDS: ProfileFieldDef[] = [
  { key: "name", label: "姓名", fieldType: "short_text", icon: "bi-person" },
  { key: "email", label: "電郵", fieldType: "email", icon: "bi-envelope" },
  { key: "phone", label: "手機", fieldType: "phone", icon: "bi-phone" },
  { key: "gender", label: "性別", fieldType: "single_choice", icon: "bi-gender-ambiguous" },
];

export interface FormSettings {
  submitButtonText: string;
  enableCustomButtonColor: boolean;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonHoverBgColor: string;
  buttonHoverTextColor: string;
  showQuestionNumbers: boolean;
  profileFields: ProfileFieldKey[];
}

export type DividerLineStyle = "solid" | "dashed" | "dotted" | "double";

export type SpacerSize = "small" | "medium" | "large";

export interface ContentBlock {
  id: string;
  kind: "content_block";
  style: ContentBlockStyle;
  content: string;
  enabled: boolean;
  defaultLabel: string;
  dividerStyle?: DividerLineStyle;
  spacerSize?: SpacerSize;
  groupId?: string;
}

export type FormItem = FormField | ContentBlock;

export function isContentBlock(item: FormItem): item is ContentBlock {
  return "kind" in item && item.kind === "content_block";
}

export function isFormField(item: FormItem): item is FormField {
  return !isContentBlock(item);
}

/** All field types including internal ones (email, phone, number used by profile fields) */
export const FIELD_TYPE_META: Record<FieldType, { label: string; icon: string }> = {
  short_text: { label: "簡答題", icon: "Type" },
  long_text: { label: "段落題", icon: "AlignLeft" },
  single_choice: { label: "單選題", icon: "CircleDot" },
  multiple_choice: { label: "勾選題", icon: "CheckSquare" },
  dropdown: { label: "下拉式選單", icon: "ChevronDown" },
  rating_matrix: { label: "量表題", icon: "BarChart" },
  date: { label: "日期", icon: "Calendar" },
  file_upload: { label: "檔案上傳", icon: "Upload" },
  number: { label: "數字", icon: "Hash" },
  email: { label: "電子郵件", icon: "Mail" },
  phone: { label: "手機", icon: "Phone" },
  subscribe_invite: { label: "邀請訂閱", icon: "Bell" },
  terms_conditions: { label: "條款及細則", icon: "FileText" },
};

/** Field types available for admin to add (excludes internal-only types) */
export const ADDABLE_FIELD_TYPES: FieldType[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "dropdown",
  "rating_matrix",
  "date",
  "file_upload",
  "subscribe_invite",
  "terms_conditions",
];

export const CONTENT_BLOCK_META: Record<ContentBlockStyle, { label: string; icon: string }> = {
  section_title: { label: "分組標題", icon: "bi-card-heading" },
  body_text: { label: "內文補充", icon: "bi-text-paragraph" },
  bordered_content: { label: "框線 + 內容", icon: "bi-bounding-box" },
  quote: { label: "引言", icon: "bi-chat-quote" },
  divider: { label: "分隔橫線", icon: "bi-dash-lg" },
  spacer: { label: "空白間距", icon: "bi-distribute-vertical" },
  plain_text: { label: "純文字", icon: "bi-fonts" },
};
