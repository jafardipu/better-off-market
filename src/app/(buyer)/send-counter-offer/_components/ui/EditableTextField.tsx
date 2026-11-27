import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OriginalHint } from "./OriginalHint";
import { blockNonDigitKeys, toWholeNumberText } from "@/utils/wholeNumberInput";

interface EditableTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  originalValue: string;
  /** "number" accepts whole numbers only. */
  type?: "text" | "number" | "date";
  placeholder?: string;
}

export function EditableTextField<T extends FieldValues>({
  control,
  name,
  label,
  originalValue,
  type = "text",
  placeholder,
}: EditableTextFieldProps<T>) {
  const wholeNumber = type === "number";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-primary-gray font-medium">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={wholeNumber ? "text" : type}
              inputMode={wholeNumber ? "numeric" : undefined}
              onKeyDown={wholeNumber ? blockNonDigitKeys : undefined}
              onChange={
                wholeNumber
                  ? (e) => field.onChange(toWholeNumberText(e.target.value))
                  : field.onChange
              }
              placeholder={placeholder}
              className="border border-primary-border-color bg-[#F2F4F6] py-5"
            />
          </FormControl>
          <OriginalHint value={originalValue} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
