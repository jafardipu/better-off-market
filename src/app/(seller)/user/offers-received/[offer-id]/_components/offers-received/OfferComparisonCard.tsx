import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagStarIcon } from "@/icons";

interface OfferComparisonCardProps {
  title: string;
  amount: number;
  previousAmount?: number;
  closingDate: string;
  previousClosingDate?: string;
  closingLabel?: string;
  /** Marks the latest round, the one on the table. */
  isLatest?: boolean;
  /** This round is the one shown in the offer details below. */
  selected?: boolean;
  /** Makes the card a button that shows this round's details. */
  onSelect?: () => void;
}

function formatCurrency(amount: number) {
  return amount?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function OfferComparisonCard({
  title,
  amount,
  previousAmount,
  closingDate,
  previousClosingDate,
  closingLabel = "Closing:",
  isLatest,
  selected,
  onSelect,
}: OfferComparisonCardProps) {
  const amountChanged =
    previousAmount !== undefined && previousAmount !== amount;
  const dateChanged =
    previousClosingDate !== undefined && previousClosingDate !== closingDate;

  const className = cn(
    "relative flex-1 rounded-lg border p-4 text-left",
    selected
      ? "border-primary-border-color bg-[#AC34000D] ring-1 ring-primary-border-color"
      : "border-transparent bg-[#F2F4F6]",
    onSelect &&
      "w-full cursor-pointer transition-colors hover:border-primary-border-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40",
  );

  const content = (
    <>
      {isLatest ? (
        <span
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
          title="Current offer"
        >
          <TagStarIcon />
          <span className="sr-only">Current offer</span>
        </span>
      ) : null}

      <p className="text-sm font-semibold text-primary-color">{title}</p>

      <p className="mt-2 flex flex-wrap items-baseline gap-2">
        {amountChanged ? (
          <span className="text-base text-muted-foreground line-through">
            {formatCurrency(previousAmount)}
          </span>
        ) : null}
        <span className="text-xl font-semibold text-foreground">
          {formatCurrency(amount)}
        </span>
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar size={13} />
        <span>{closingLabel}</span>
        {dateChanged ? (
          <span className="line-through">{previousClosingDate}</span>
        ) : null}
        <span className="font-medium text-foreground">{closingDate}</span>
      </p>
    </>
  );

  if (!onSelect) return <div className={className}>{content}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={className}
    >
      {content}
    </button>
  );
}
