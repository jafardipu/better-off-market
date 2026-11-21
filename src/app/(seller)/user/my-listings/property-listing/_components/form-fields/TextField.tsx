import type { InputHTMLAttributes, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  registration?: UseFormRegisterReturn;
  tooltip?: ReactNode;
  extraClassName?: string;
  wholeNumbersOnly?: boolean; // blocks decimals, letters, e/+/- etc.
  maxDigits?: number;
  hideNumberSpinner?: boolean;
}

const ALLOWED_NAV_KEYS = [
  "Backspace", "Delete", "ArrowLeft", "ArrowRight",
  "ArrowUp", "ArrowDown", "Tab", "Home", "End",
];

export function TextField({
  label,
  required,
  error,
  registration,
  tooltip,
  className,
  extraClassName,
  wholeNumbersOnly,
  maxDigits,
  hideNumberSpinner,
  onKeyDown,
  ...props
}: TextFieldProps) {
  return (
    <div className={cn("w-full", extraClassName)}>
      {label && (
        <Label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-primary-black">
          {label}
          {required && <span className="text-red-500">*</span>}
          {tooltip}
        </Label>
      )}
      <Input
        {...registration}
        {...props}
        type={wholeNumbersOnly ? "text" : props.type}
        inputMode={wholeNumbersOnly ? "numeric" : props.inputMode}
        onKeyDown={(e) => {
          if (wholeNumbersOnly) {
            if (ALLOWED_NAV_KEYS.includes(e.key)) {
              // allow
            } else if (
              (e.ctrlKey || e.metaKey) &&
              ["a", "c", "v", "x"].includes(e.key.toLowerCase())
            ) {
              // allow copy/paste/select-all
            } else if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            } else if (maxDigits) {
              const selected =
                (e.currentTarget.selectionEnd ?? 0) -
                (e.currentTarget.selectionStart ?? 0);
              const digits = e.currentTarget.value.replace(/\D/g, "");
              if (selected === 0 && digits.length >= maxDigits) {
                e.preventDefault();
              }
            }
          }
          onKeyDown?.(e);
        }}
        onChange={(e) => {
          if (wholeNumbersOnly || maxDigits) {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            e.target.value = maxDigits ? digits.slice(0, maxDigits) : digits;
          }
          registration?.onChange(e);
          props.onChange?.(e);
        }}
        className={`bg-[#F2F4F6] py-5 rounded-md ${error ? "border-red-400" : "border-[#E2E8F0]"} ${
          className ?? ""
        } ${
          hideNumberSpinner
            ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : ""
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}