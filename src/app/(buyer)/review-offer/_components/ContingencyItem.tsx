import type { ReactNode } from "react";

interface ContingencyItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  /** Value from the previous offer round; shown struck through when it differs. */
  previousValue?: string;
}

/** Round icon badge + stacked label/value, used for Inspection / Appraisal rows. */
export function ContingencyItem({
  icon,
  label,
  value,
  previousValue,
}: ContingencyItemProps) {
  const changed = previousValue !== undefined && previousValue !== value;
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#91B9FF45] text-primary-color">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
          {label}
        </p>
        <p className="mt-1 text-sm text-primary-black md:text-lg">
          {changed ? (
            <>
              <span className="text-primary-gray line-through">
                {previousValue}
              </span>{" "}
              <span className="font-semibold">{value}</span>
            </>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}