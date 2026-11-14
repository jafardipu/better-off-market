export interface ConsolidatedOfferDocument {
  name: string;
  url: string;
}

export interface ConsolidatedOfferData {
  offerAmount: number;
  earnestMoney: number;
  financingType: string;
  financingTerms: string;
  closingCosts: string;
  commission?: string;
  personalProperty: {
    included: string[];
    /** Original textarea text, before it is split into pills. */
    includedText?: string;
    itemsToRemove?: string;
  };
  inspection: { required: boolean; days?: number };
  appraisal: { required: boolean; days?: number };
  closingTerms: {
    titleCompany: string;
    closingDate: string;
    possession: string;
    sellerPostClosingDays?: number;
    /** Display value: "N/A" for at closing, "X Days" for post closing. */
    sellerPostClosingOccupancy: string;
  };
  agent?: {
    hasAgent: boolean;
    agentName?: string;
    brokerageName?: string;
    commission?: string;
    paidBy?: string;
  };
  documents?: ConsolidatedOfferDocument[];
  notesToSeller?: string;
  additionalTerms?: string;
  sellerPostClosingDays?: number;
  notesToBuyer?: string;
}

// Shape of currentTerms / each history[] entry from the API
export interface OfferTerms {
  offerAmount: number;
  earnestMoney: number;
  financingType: string;
  financingTerms?: string;
  otherFinancingType?: string;
  closingCostOption: string;
  sellerContribution?: number;
  inspectionContingency: string;
  inspectionDays?: number;
  appraisalContingency: string;
  // appraisalDays?: number;
  commission?: string;
  paidBy?: string;
  hasAgent: string;
  agentName?: string;
  brokerageName?: string;
  personalPropertyIncluded?: string;
  itemsToBeRemoved?: string;
  titleCompany?: string | null;
  closingDate?: string | null;
  possession?: string | null;
  sellerPostClosingDays?: number;
  notesToSeller?: string;
  notesToBuyer?: string;
  additionalTerms?: string;
  madeBy?: "buyer" | "seller";
}

interface RawSupportingDocument {
  name: string;
  url: string;
}

export function formatCurrency(amount: number) {
  return amount?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

export function contingencyValue(item: { required: boolean; days?: number }) {
  if (!item.required) return "Waived";
  return item.days ? `Yes, ${item.days} days` : "Yes";
}

const FINANCING_TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  conventional: "Conventional",
  hard_money: "Hard Money",
  fha: "FHA",
  va: "VA",
};

export function formatFinancingType(type?: string | null, otherType?: string) {
  if (!type) return "—";
  if (type === "other" && otherType) return otherType;
  return FINANCING_TYPE_LABELS[type] ?? type;
}

export function formatPossession(possession?: string | null) {
  if (!possession) return "—";
  if (possession === "at_closing") return "At closing";
  return possession
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** At closing → "N/A"; post closing → "X Days". */
export function formatSellerPostClosingOccupancy(
  possession?: string,
  days?: number,
) {
  if (possession === "at_closing") return "N/A";
  if (possession === "post_closing") {
    const count = days ?? 0;
    return `${count} ${count === 1 ? "Day" : "Days"}`;
  }
  return "N/A";
}

export function formatClosingCosts(
  option?: string | null,
  sellerContribution?: number,
) {
  if (option === "requested") {
    return sellerContribution
      ? `Buyer requests seller contribution of ${formatCurrency(sellerContribution)}`
      : "Buyer requests seller contribution";
  }
  if (!option) return "—";
  return "Buyer does NOT request seller contribution";
}

export function formatCommission(commission?: string, paidBy?: string) {
  if (!commission) return undefined;
  return paidBy ? `${commission} (paid by ${paidBy})` : commission;
}

// "Refrigerator, Washer/Dryer" -> ["Refrigerator", "Washer/Dryer"]
export function splitToList(value?: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// "2010-04-25" -> "April 25, 2010" ; non-date strings like "ASAP" pass through unchanged
export function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

// "Ori Mccullough" -> "Ori M."


export function getRoundTitle(madeBy?: "buyer" | "seller") {
  return madeBy === "seller" ? "Your Counter Offer" : "Buyer's Offer";
}

export function mapTermsToConsolidatedOfferData(
  terms: OfferTerms,
  documents?: RawSupportingDocument[],
): ConsolidatedOfferData {
  return {
    offerAmount: terms.offerAmount,
    earnestMoney: terms.earnestMoney,
    financingType: formatFinancingType(
      terms.financingType,
      terms.otherFinancingType,
    ),
    closingCosts: formatClosingCosts(
      terms.closingCostOption,
      terms.sellerContribution,
    ),
    financingTerms: terms?.financingTerms ?? "",
    // commission: formatCommission(terms.commission, terms.paidBy),
    personalProperty: {
      included: splitToList(terms.personalPropertyIncluded),
      includedText: terms.personalPropertyIncluded,
      itemsToRemove: terms.itemsToBeRemoved,
    },
    inspection: {
      required: terms.inspectionContingency === "yes",
      days: terms.inspectionDays,
    },
    appraisal: {
      required: terms.appraisalContingency === "yes",
      // days: terms.appraisalDays,
    },
    closingTerms: {
      titleCompany: terms.titleCompany ?? "—",
      closingDate: formatDate(terms.closingDate),
      possession: formatPossession(terms.possession),
      sellerPostClosingDays: terms?.sellerPostClosingDays,
      sellerPostClosingOccupancy: formatSellerPostClosingOccupancy(
        terms.possession ?? undefined,
        terms.sellerPostClosingDays,
      ),
    },
    agent: {
      hasAgent: terms.hasAgent === "yes",
      agentName: terms.agentName,
      brokerageName: terms.brokerageName,
      commission: terms.commission,
      paidBy: terms.paidBy,
    },
    documents: documents?.map((doc) => ({ name: doc.name, url: doc.url })),
    notesToSeller: terms.notesToSeller,
    notesToBuyer: terms.notesToBuyer,
    additionalTerms: terms.additionalTerms,
  };
}


export const OFFER_STATUS = {
    pending: 'pending',
    countered: 'countered',
    accepted: 'accepted',
    rejected: 'rejected',
    withdrawn: 'withdrawn',
} as const;

export const OFFER_STATUS_OPTIONS = Object.values(OFFER_STATUS);

// statuses that mean the thread is closed — no further offers/counters allowed
export const CLOSED_OFFER_STATUSES: string[] = [
    OFFER_STATUS.accepted,
    OFFER_STATUS.rejected,
    OFFER_STATUS.withdrawn,
];