export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "date"
  | "file_upload"
  | "number"
  | "email"
  | "phone";

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
}

export const DEFAULT_PHONE_CONFIG: PhoneConfig = {
  acceptAll: true,
  allowedCodes: [],
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

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  enabled: boolean;
  options?: FieldOption[];
  dateConfig?: DateConfig;
  choiceConfig?: ChoiceAdvancedConfig;
  phoneConfig?: PhoneConfig;
  groupId?: string;
}

export interface FormGroup {
  id: string;
  name: string;
  description?: string;
}

export interface FormSettings {
  submitButtonText: string;
  enableCustomButtonColor: boolean;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonHoverBgColor: string;
  buttonHoverTextColor: string;
  showQuestionNumbers: boolean;
}

export type DividerLineStyle = "solid" | "dashed" | "dotted" | "double";

export type SpacerSize = "small" | "medium" | "large";

export interface ContentBlock {
  id: string;
  kind: "content_block";
  style: ContentBlockStyle;
  content: string;
  enabled: boolean;
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

export const FIELD_TYPE_META: Record<FieldType, { label: string; icon: string }> = {
  short_text: { label: "簡答題", icon: "Type" },
  long_text: { label: "段落題", icon: "AlignLeft" },
  single_choice: { label: "單選題", icon: "CircleDot" },
  multiple_choice: { label: "勾選方格", icon: "CheckSquare" },
  dropdown: { label: "下拉式選單", icon: "ChevronDown" },
  date: { label: "日期", icon: "Calendar" },
  file_upload: { label: "檔案上傳", icon: "Upload" },
  number: { label: "數字", icon: "Hash" },
  email: { label: "電子郵件", icon: "Mail" },
  phone: { label: "手機", icon: "Phone" },
};

export const CONTENT_BLOCK_META: Record<ContentBlockStyle, { label: string; icon: string }> = {
  section_title: { label: "分組標題", icon: "bi-card-heading" },
  body_text: { label: "內文補充", icon: "bi-text-paragraph" },
  bordered_content: { label: "框線 + 內容", icon: "bi-bounding-box" },
  quote: { label: "引言", icon: "bi-chat-quote" },
  divider: { label: "分隔橫線", icon: "bi-dash-lg" },
  spacer: { label: "空白間距", icon: "bi-distribute-vertical" },
  plain_text: { label: "純文字", icon: "bi-fonts" },
};
