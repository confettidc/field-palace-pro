import { useState } from "react";
import {
  Type, AlignLeft, CircleDot, CheckSquare, ChevronDown,
  Calendar, Upload, Hash, Mail, Phone, GripVertical,
  Trash2, Copy, MoreHorizontal, ChevronUp,
} from "lucide-react";
import { FormField, FieldType, FIELD_TYPE_META, FieldOption } from "@/types/formField";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function FormFieldCard({ field, onUpdate, onDelete, onDuplicate }: Props) {
  const [expanded, setExpanded] = useState(true);
  const Icon = iconMap[field.type];

  const updateField = (patch: Partial<FormField>) => onUpdate({ ...field, ...patch });

  const addOption = () => {
    const options = field.options || [];
    const newOpt: FieldOption = { id: crypto.randomUUID(), label: `選項 ${options.length + 1}` };
    updateField({ options: [...options, newOpt] });
  };

  const updateOption = (optId: string, label: string) => {
    updateField({
      options: (field.options || []).map((o) => (o.id === optId ? { ...o, label } : o)),
    });
  };

  const removeOption = (optId: string) => {
    updateField({ options: (field.options || []).filter((o) => o.id !== optId) });
  };

  const hasOptions = ["single_choice", "multiple_choice", "dropdown"].includes(field.type);

  return (
    <div className="group rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
        <div className="flex items-center gap-2 rounded-md bg-accent/60 px-2.5 py-1">
          <Icon className="h-3.5 w-3.5 text-accent-foreground" />
          <span className="text-xs font-medium text-accent-foreground">
            {FIELD_TYPE_META[field.type].label}
          </span>
        </div>

        <div className="flex-1" />

        <Select
          value={field.type}
          onValueChange={(v) => {
            const newType = v as FieldType;
            const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(newType);
            updateField({
              type: newType,
              options: needsOptions && !field.options?.length
                ? [{ id: crypto.randomUUID(), label: "選項 1" }]
                : needsOptions ? field.options : undefined,
            });
          }}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(FIELD_TYPE_META) as [FieldType, { label: string }][]).map(
              ([key, meta]) => {
                const I = iconMap[key];
                return (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <I className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </SelectItem>
                );
              }
            )}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(field.id)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(field.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
            <ChevronUp className={`h-3.5 w-3.5 transition-transform ${expanded ? "" : "rotate-180"}`} />
          </Button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">題目名稱</label>
            <Input
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如：您的職位"
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">補充說明（選填）</label>
            <Textarea
              value={field.description || ""}
              onChange={(e) => updateField({ description: e.target.value })}
              placeholder="為題目加入額外說明..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Placeholder */}
          {!hasOptions && field.type !== "file_upload" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">提示文字</label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="例如：請輸入..."
                className="text-sm"
              />
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">選項</label>
              {(field.options || []).map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <Input
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeOption(opt.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="text-xs mt-1">
                + 新增選項
              </Button>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground">必填</span>
            <Switch
              checked={field.required}
              onCheckedChange={(v) => updateField({ required: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
