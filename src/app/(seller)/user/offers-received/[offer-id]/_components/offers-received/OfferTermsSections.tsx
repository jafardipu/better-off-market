import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  MessageSquareText,
  Search,
  UserRound,
} from "lucide-react";
import { OfferSubSection } from "./OfferSubSection";
import {
  changedFrom,
  contingencyValue,
  formatCurrency,
  includedItemsText,
  paidByLabel,
  type ConsolidatedOfferData,
} from "./utils.offer-received";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
import { ContingencyItem } from "@/app/(buyer)/review-offer/_components/ContingencyItem";
import { DollarIcon, PersonalPropertyIcon } from "@/icons";
import { cn } from "@/lib/utils";

interface OfferTermsSectionsProps {
  data: ConsolidatedOfferData;
  /** The round before `data`. Every term that differs shows this value struck through. */
  previous?: ConsolidatedOfferData;
  personalPropertyClassName?: string;
}

/** A previous round's value, struck through, on its own line. */
function PreviousText({ value }: { value?: string }) {
  if (value === undefined) return null;
  return (
    <span className="mb-1 block whitespace-pre-wrap text-sm text-primary-gray line-through md:text-base">
      {value}
    </span>
  );
}

/**
 * The negotiable terms of one offer round: offer details, personal property,
 * contingencies, agent, closing terms and additional terms.
 */
export function OfferTermsSections({
  data,
  previous,
  personalPropertyClassName,
}: OfferTermsSectionsProps) {
  const prev = previous;
  const agent = data.agent;
  const prevAgent = prev?.agent;
  const bothHaveAgent = Boolean(agent?.hasAgent && prevAgent?.hasAgent);

  const included = includedItemsText(data);
  const prevIncluded = prev && changedFrom(includedItemsText(prev), included);

  const toRemove = data.personalProperty.itemsToRemove?.trim() || "";
  const prevToRemove =
    prev &&
    changedFrom(prev.personalProperty.itemsToRemove?.trim() || "", toRemove);

  const additional = data.additionalTerms?.trim() || "";
  const prevAdditional =
    prev && changedFrom(prev.additionalTerms?.trim() || "", additional);

  return (
    <>
      <OfferSubSection title="Offer Details" icon={<DollarIcon />}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <SummaryField
            label="Offer amount"
            value={formatCurrency(data.offerAmount)}
            previousValue={prev && formatCurrency(prev.offerAmount)}
          />
          <SummaryField
            label="Earnest money"
            value={formatCurrency(data.earnestMoney)}
            previousValue={prev && formatCurrency(prev.earnestMoney)}
          />
          <SummaryField
            label="Financing type"
            value={data.financingType}
            previousValue={prev?.financingType}
          />
          {data.financingTerms || prev?.financingTerms ? (
            <SummaryField
              label="Financing Terms"
              value={data.financingTerms}
              previousValue={prev?.financingTerms}
            />
          ) : null}
          <SummaryField
            label="Closing costs"
            value={data.closingCosts}
            previousValue={prev?.closingCosts}
          />
        </div>
      </OfferSubSection>

      <OfferSubSection title="Personal Property" icon={<PersonalPropertyIcon />}>
        <div className={cn("flex flex-wrap gap-4", personalPropertyClassName)}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
              Included items
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-primary-black md:text-lg">
              <PreviousText value={prevIncluded} />
              <span className={cn(prevIncluded !== undefined && "font-semibold")}>
                {included}
              </span>
            </p>
          </div>
          {toRemove || prevToRemove ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
                Items to be removed
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-primary-black md:text-lg">
                <PreviousText value={prevToRemove} />
                <span className={cn(prevToRemove !== undefined && "font-semibold")}>
                  {toRemove || "None"}
                </span>
              </p>
            </div>
          ) : null}
        </div>
      </OfferSubSection>

      <OfferSubSection title="Contingencies" icon={<AlertCircle size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContingencyItem
            icon={<Search size={16} />}
            label="Inspection"
            value={contingencyValue(data.inspection)}
            previousValue={prev && contingencyValue(prev.inspection)}
          />
          <ContingencyItem
            icon={<BadgeCheck size={16} />}
            label="Appraisal"
            value={contingencyValue(data.appraisal)}
            previousValue={prev && contingencyValue(prev.appraisal)}
          />
        </div>
      </OfferSubSection>

      <OfferSubSection title="Real Estate Agent" icon={<UserRound size={18} />}>
        {agent?.hasAgent ? (
          <>
            {prev && !prevAgent?.hasAgent ? (
              <PreviousText value="Not working with a real estate agent" />
            ) : null}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <SummaryField
                label="Agent name"
                value={agent.agentName || "—"}
                previousValue={
                  bothHaveAgent ? prevAgent?.agentName || "—" : undefined
                }
              />
              <SummaryField
                label="Brokerage name"
                value={agent.brokerageName || "—"}
                previousValue={
                  bothHaveAgent ? prevAgent?.brokerageName || "—" : undefined
                }
              />
              <SummaryField
                label="Commission"
                value={agent.commission || "—"}
                previousValue={
                  bothHaveAgent ? prevAgent?.commission || "—" : undefined
                }
              />
              <SummaryField
                label="Paid by"
                value={paidByLabel(agent.paidBy)}
                previousValue={
                  bothHaveAgent ? paidByLabel(prevAgent?.paidBy) : undefined
                }
              />
            </div>
          </>
        ) : (
          <>
            {prevAgent?.hasAgent ? (
              <PreviousText
                value={[prevAgent.agentName, prevAgent.brokerageName]
                  .filter(Boolean)
                  .join(", ") || "Working with an agent"}
              />
            ) : null}
            <p className="text-sm text-muted-foreground">
              Buyer is not working with a real estate agent.
            </p>
          </>
        )}
      </OfferSubSection>

      <OfferSubSection title="Closing Terms" icon={<Calendar size={18} />}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <SummaryField
            label="Title company"
            value={data.closingTerms.titleCompany}
            previousValue={prev?.closingTerms.titleCompany}
          />
          <SummaryField
            label="Closing date"
            value={data.closingTerms.closingDate}
            previousValue={prev?.closingTerms.closingDate}
          />
          <SummaryField
            label="Possession"
            value={data.closingTerms.possession}
            previousValue={prev?.closingTerms.possession}
          />
          <SummaryField
            label="Seller post-closing occupancy"
            value={data.closingTerms.sellerPostClosingOccupancy}
            previousValue={prev?.closingTerms.sellerPostClosingOccupancy}
          />
        </div>
      </OfferSubSection>

      {additional || prevAdditional ? (
        <OfferSubSection
          title="Additional Terms / Conditions"
          icon={<MessageSquareText color="#00214C" size={18} />}
        >
          <div className="rounded-lg bg-[#F2F4F6] p-3 italic leading-relaxed text-[#594139]">
            <PreviousText value={prevAdditional} />
            {additional ? <>&ldquo;{additional}&rdquo;</> : "None"}
          </div>
        </OfferSubSection>
      ) : null}
    </>
  );
}
