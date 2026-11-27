import { cn } from "@/lib/utils";

interface SummaryFieldProps {
  label: string;
  value: string;
  /** Value from the previous offer round; shown struck through when it differs. */
  previousValue?: string;
  className?: string;
}

const formatValue = (value?: string) => value?.split?.("_").join(" ") || "—";

/** Uppercase muted label with a bold value beneath it, e.g. OFFER AMOUNT / $48,500 */
export function SummaryField({
  label,
  value,
  previousValue,
  className
}: SummaryFieldProps) {
  const shown = formatValue(value);
  const previous =
    previousValue === undefined ? undefined : formatValue(previousValue);
  const changed = previous !== undefined && previous !== shown;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
        {label}
      </p>
      <p className={cn("mt-1  md:text-lg text-sm text-primary-black capitalize")}>
        {changed ? (
          <>
            <span className="text-primary-gray line-through">{previous}</span>{" "}
            <span className="font-semibold">{shown}</span>
          </>
        ) : (
          shown
        )}
      </p>
    </div>
  );
}
