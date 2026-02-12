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
