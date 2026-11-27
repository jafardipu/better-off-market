import { cn } from "@/lib/utils";
import { OfferComparisonCard } from "./OfferComparisonCard";
import {
  formatDate,
  getRoundTitle,
  type OfferRound,
  type OfferViewer,
} from "./utils.offer-received";

interface OfferComparisonRowProps {
  /** Every negotiation round, oldest first. */
  rounds: OfferRound[];
  /** Index into `rounds` of the round shown in the offer details. */
  selectedIndex: number;
  onSelect: (index: number) => void;
  viewer: OfferViewer;
}

/** One card per round; clicking a card shows that round's terms below. */
export function OfferComparisonRow({
  rounds,
  selectedIndex,
  onSelect,
  viewer,
}: OfferComparisonRowProps) {
  const latestIndex = rounds.length - 1;
  const hasCounters = rounds.length > 1;

  return (
    <div className="mb-6">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          rounds.length > 2 ? "lg:grid-cols-3" : "lg:max-w-3/4",
        )}
      >
        {rounds.map((round, i) => {
          const previous = rounds[i - 1]?.terms;
          return (
            <OfferComparisonCard
              key={round.round}
              title={getRoundTitle(round.madeBy, viewer, i === 0)}
              amount={round.terms.offerAmount}
              previousAmount={previous?.offerAmount}
              closingDate={formatDate(round.terms.closingDate)}
              previousClosingDate={
                previous ? formatDate(previous.closingDate) : undefined
              }
              closingLabel={i === 0 ? "Closing:" : "Proposed closing:"}
              isLatest={hasCounters && i === latestIndex}
              selected={hasCounters && i === selectedIndex}
              onSelect={hasCounters ? () => onSelect(i) : undefined}
            />
          );
        })}
      </div>

      {hasCounters ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>
            Select an offer to see its terms. Struck-through values are from the
            offer before it.
          </span>
          {selectedIndex !== latestIndex ? (
            <button
              type="button"
              onClick={() => onSelect(latestIndex)}
              className="cursor-pointer font-medium text-primary-color underline-offset-2 hover:underline"
            >
              View current offer
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
