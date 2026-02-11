import {
  Type, AlignLeft, CircleDot, CheckSquare, ChevronDown,
  Calendar, Upload, Hash, Mail, Phone,
} from "lucide-react";
import { FieldType, FIELD_TYPE_META } from "@/types/formField";

const iconMap: Record<FieldType, React.ElementType> = {
  short_text: Type,
  long_text: AlignLeft,
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  dropdown: ChevronDown,
  date: Calendar,
  file_upload: Upload,
  number: Hash,
  email: Mail,
  phone: Phone,
};

interface Props {
  onAdd: (type: FieldType) => void;
}

export default function AddFieldPanel({ onAdd }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {(Object.entries(FIELD_TYPE_META) as [FieldType, { label: string }][]).map(([key, meta]) => {
        const Icon = iconMap[key];
        return (
          <button
            key={key}
            onClick={() => onAdd(key)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm active:scale-[0.97]"
          >
            <Icon className="h-5 w-5 text-primary" />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
