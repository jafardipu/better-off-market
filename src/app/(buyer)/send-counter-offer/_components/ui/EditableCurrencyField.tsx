import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { blockNonDigitKeys, toWholeNumberText } from "@/utils/wholeNumberInput";

interface EditableCurrencyFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

export function EditableCurrencyField<T extends FieldValues>({
  control,
  name,
  label,
}: EditableCurrencyFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-primary-gray font-medium">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                {...field}
                type="text"
                inputMode="numeric"
                onKeyDown={blockNonDigitKeys}
                onChange={(e) => field.onChange(toWholeNumberText(e.target.value))}
                className="pl-7 border border-primary-border-color bg-[#F2F4F6] py-5"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
