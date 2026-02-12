import { FieldType, FIELD_TYPE_META } from "@/types/formField";

const iconMap: Record<FieldType, string> = {
  short_text: "bi-type",
  long_text: "bi-text-paragraph",
  single_choice: "bi-record-circle",
  multiple_choice: "bi-check-square",
  dropdown: "bi-chevron-down",
  date: "bi-calendar",
  file_upload: "bi-upload",
  number: "bi-hash",
  email: "bi-envelope",
  phone: "bi-phone",
};

interface Props {
  onAdd: (type: FieldType) => void;
}

export default function AddFieldPanel({ onAdd }: Props) {
  return (
    <div className="x-add-panel">
      {(Object.entries(FIELD_TYPE_META) as [FieldType, { label: string }][]).map(([key, meta]) => (
        <button key={key} className="x-add-btn" onClick={() => onAdd(key)}>
          <i className={`bi ${iconMap[key]}`} />
          {meta.label}
        </button>
      ))}
    </div>
  );
}
