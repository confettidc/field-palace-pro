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
}

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
}

export type DividerLineStyle = "solid" | "dashed" | "dotted" | "double";

export interface ContentBlock {
  id: string;
  kind: "content_block";
  style: ContentBlockStyle;
  content: string;
  enabled: boolean;
  dividerStyle?: DividerLineStyle;
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
  phone: { label: "電話", icon: "Phone" },
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
