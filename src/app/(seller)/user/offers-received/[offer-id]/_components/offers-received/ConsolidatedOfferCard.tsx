import {
  AlertCircle,
  Search,
  BadgeCheck,
  Calendar,
  Download,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { OfferSubSection } from "./OfferSubSection";
import {
  formatCurrency,
  contingencyValue,
  type ConsolidatedOfferData,
} from "./utils.offer-received";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
import { ContingencyItem } from "@/app/(buyer)/review-offer/_components/ContingencyItem";
import { DocIcon, DollarIcon, PersonalPropertyIcon } from "@/icons";
import Link from "next/link";

interface ConsolidatedOfferCardProps {
  buyerId: string;
  name: string;
  data: ConsolidatedOfferData;
}

export function ConsolidatedOfferCard({
  buyerId,
  name: buyerName,
  data,
}: ConsolidatedOfferCardProps) {
  return (
    <div className="border border-primary-border-color bg-card p-5 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] sm:p-6 rounded-lg">
      <h4 className="md:text-2xl text-lg font-semibold">
        {" "}
        <Link
          href={`/seller-profile?seller=${buyerId}`}
          className="hover:text-blue-800 hover:underline duration-200 ease-in-out "
        >
          Offer from {buyerName}{" "}
        </Link>
      </h4>
      <section className=" space-y-4 rounded-xl lg:mt-5 mt-3">
        <OfferSubSection title="Offer Details" icon={<DollarIcon />}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <SummaryField
              label="Offer amount"
              value={formatCurrency(data.offerAmount)}
            />
            <SummaryField
              label="Earnest money"
              value={formatCurrency(data.earnestMoney)}
            />
            <SummaryField label="Financing type" value={data.financingType} />
            {data.financingTerms ? (
              <SummaryField
                label="Financing Terms"
                value={data?.financingTerms}
              />
            ) : null}
            <SummaryField label="Closing costs" value={data.closingCosts} />
          </div>
        </OfferSubSection>

        <OfferSubSection
          title="Personal Property"
          icon={<PersonalPropertyIcon />}
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
                Included items
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-primary-black md:text-lg">
                {data.personalProperty.includedText?.trim() ||
                  data.personalProperty.included?.join(", ") ||
                  "None specified"}
              </p>
            </div>
            {data.personalProperty.itemsToRemove?.trim() ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
                  Items to be removed
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-primary-black md:text-lg">
                  {data.personalProperty.itemsToRemove}
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
            />
            <ContingencyItem
              icon={<BadgeCheck size={16} />}
              label="Appraisal"
              value={contingencyValue(data.appraisal)}
            />
          </div>
        </OfferSubSection>

        <OfferSubSection
          title="Real Estate Agent"
          icon={<UserRound size={18} />}
        >
          {data.agent?.hasAgent ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <SummaryField
                label="Agent name"
                value={data.agent.agentName || "—"}
              />
              <SummaryField
                label="Brokerage name"
                value={data.agent.brokerageName || "—"}
              />
              <SummaryField
                label="Commission"
                value={data.agent.commission || "—"}
              />
              <SummaryField
                label="Paid by"
                value={
                  data.agent.paidBy
                    ? data.agent.paidBy.charAt(0).toUpperCase() +
                      data.agent.paidBy.slice(1)
                    : "—"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Buyer is not working with a real estate agent.
            </p>
          )}
        </OfferSubSection>

        <OfferSubSection title="Closing Terms" icon={<Calendar size={18} />}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <SummaryField
              label="Title company"
              value={data.closingTerms.titleCompany}
            />
            <SummaryField
              label="Closing date"
              value={data.closingTerms.closingDate}
            />
            <SummaryField
              label="Possession"
              value={data.closingTerms.possession}
            />
            <SummaryField
              label="Seller post-closing occupancy"
              value={data.closingTerms.sellerPostClosingOccupancy}
            />
          </div>
        </OfferSubSection>

        {data.additionalTerms ? (
          <OfferSubSection
            title="Additional Terms / Conditions"
            icon={<MessageSquareText color="#00214C" size={18} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] text-[#594139] p-3  italic leading-relaxed">
              &ldquo;{data?.additionalTerms}&rdquo;
            </p>
          </OfferSubSection>
        ) : null}

        {data.documents && data.documents.length > 0 ? (
          <OfferSubSection title="Documents" icon={<DocIcon />}>
            <ul className="flex flex-col gap-2">
              {data.documents.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border border-primary-border-color/60 bg-muted/50 px-3 py-2.5 text-sm text-foreground hover:border-primary/50"
                  >
                    <span className="truncate">{doc.name}</span>
                    <Download className="shrink-0 text-muted-foreground hover:bg-gray-200 size-5 p-0.5 rounded-full" />
                  </a>
                </li>
              ))}
            </ul>
          </OfferSubSection>
        ) : null}

        {data.notesToSeller ? (
          <OfferSubSection
            title="Notes to Seller"
            icon={<MessageSquareText color="#00214C" size={18} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] text-[#594139] p-3  italic leading-relaxed">
              &ldquo;{data.notesToSeller}&rdquo;
            </p>
          </OfferSubSection>
        ) : null}

        {data.notesToBuyer ? (
          <OfferSubSection
            title="Notes to Buyer"
            icon={<MessageSquareText color="#00214C" size={18} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] text-[#594139] p-3  italic leading-relaxed">
              &ldquo;{data.notesToBuyer}&rdquo;
            </p>
          </OfferSubSection>
        ) : null}
      </section>
    </div>
  );
}
