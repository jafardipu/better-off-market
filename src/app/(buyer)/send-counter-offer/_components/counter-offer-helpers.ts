import {
  CLOSING_COST_OPTIONS,
  FINANCING_TYPES,
  POSSESSION_OPTIONS,
  offerFormDefaultValues,
  type OfferFormValues,
} from "@/lib/validations/offer-form";

export function formatCurrency(amount: number | undefined) {
  if (amount === undefined || Number.isNaN(amount)) return "—";
  return amount?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

const FINANCING_VALUES = new Set(FINANCING_TYPES.map((o) => o.value));
const CLOSING_COST_VALUES = new Set(CLOSING_COST_OPTIONS.map((o) => o.value));
const POSSESSION_VALUES = new Set(POSSESSION_OPTIONS.map((o) => o.value));

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toYesNo(value: unknown, fallback: "yes" | "no"): "yes" | "no" {
  return value === "yes" || value === "no" ? value : fallback;
}

/** Date inputs need YYYY-MM-DD; API often returns ISO datetimes. */
function toDateInputValue(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value.slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}

/**
 * Normalize offer terms from the API into values the counter-offer form schema accepts.
 * Prevents silent zod failures (e.g. numeric commission, null enums, ISO dates).
 */
export function normalizeOfferTermsForForm(
  terms: Partial<OfferFormValues> | Record<string, unknown> | null | undefined,
  lastActionBy?: "buyer" | "seller",
): OfferFormValues & { lastActionBy?: "buyer" | "seller" } {
  const t = (terms ?? {}) as Record<string, unknown>;
  const financingType =
    typeof t.financingType === "string" && FINANCING_VALUES.has(t.financingType)
      ? t.financingType
      : "cash";
  const closingCostOption =
    typeof t.closingCostOption === "string" &&
    CLOSING_COST_VALUES.has(t.closingCostOption)
      ? t.closingCostOption
      : "none";
  const possession =
    typeof t.possession === "string" && POSSESSION_VALUES.has(t.possession)
      ? t.possession
      : undefined;
  const paidBy =
    t.paidBy === "buyer" || t.paidBy === "seller" ? t.paidBy : undefined;

  return {
    ...offerFormDefaultValues,
    offerAmount: toOptionalNumber(t.offerAmount) ?? 0,
    earnestMoney: toOptionalNumber(t.earnestMoney) ?? 0,
    financingType,
    otherFinancingType:
      typeof t.otherFinancingType === "string" ? t.otherFinancingType : "",
    financingTerms:
      typeof t.financingTerms === "string" ? t.financingTerms : "",
    closingCostOption,
    sellerContribution: toOptionalNumber(t.sellerContribution) ?? 0,
    inspectionContingency: toYesNo(t.inspectionContingency, "yes"),
    inspectionDays: toOptionalNumber(t.inspectionDays),
    appraisalContingency: toYesNo(t.appraisalContingency, "yes"),
    hasAgent: toYesNo(t.hasAgent, "no"),
    agentName: typeof t.agentName === "string" ? t.agentName : "",
    brokerageName: typeof t.brokerageName === "string" ? t.brokerageName : "",
    commission:
      t.commission === null || t.commission === undefined
        ? ""
        : String(t.commission),
    paidBy,
    personalPropertyIncluded:
      typeof t.personalPropertyIncluded === "string"
        ? t.personalPropertyIncluded
        : "",
    itemsToBeRemoved:
      typeof t.itemsToBeRemoved === "string" ? t.itemsToBeRemoved : "",
    titleCompany: typeof t.titleCompany === "string" ? t.titleCompany : "",
    closingDate: toDateInputValue(t.closingDate),
    possession,
    sellerPostClosingDays: toOptionalNumber(t.sellerPostClosingDays) ?? 0,
    additionalTerms:
      typeof t.additionalTerms === "string" ? t.additionalTerms : "",
    notesToSeller:
      typeof t.notesToSeller === "string" ? t.notesToSeller : "",
    notesToBuyer: typeof t.notesToBuyer === "string" ? t.notesToBuyer : "",
    lastActionBy,
  } as OfferFormValues & { lastActionBy?: "buyer" | "seller" };
}

export function formatDays(days: number | undefined, requiredLabel: "yes" | "no") {
  if (requiredLabel === "no") return "Waived";
  return days ? `Yes, ${days} days` : "Yes";
}

export function formatOrDash(value: string | number | undefined) {
  if (value === undefined || value === "") return "—";
  return String(value);
}

/** True if any of `fields` differs between `current` and `original`. */
export function fieldsChanged<T extends Record<string, unknown>>(
  current: T,
  original: T,
  fields: (keyof T)[]
) {
  return fields.some((key) => {
    const a = current[key];
    const b = original[key];
    // Arrays / objects (e.g. none expected here, but keeps this safe to reuse)
    if (typeof a === "object" || typeof b === "object") {
      return JSON.stringify(a) !== JSON.stringify(b);
    }
    return (a ?? "") !== (b ?? "");
  });
}

/** Shallow-picks a subset of fields into a new object — used for edit-start snapshots. */
export function pickFields<T extends Record<string, unknown>>(
  source: T,
  fields: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  fields.forEach((key) => {
    result[key] = source[key];
  });
  return result;
}

export const SECTION_FIELDS = {
  offerDetails: ["offerAmount", "earnestMoney", "financingType", "financingTerms"],
  sellerConcessions: ["closingCostOption", "sellerContribution"],
  contingencies: [
    "inspectionContingency",
    "inspectionDays",
    "appraisalContingency",
    // "appraisalDays",
  ],
  agent: ["hasAgent", "agentName", "brokerageName", "commission", "paidBy"],
  personalProperty: [
    "personalPropertyIncluded",
    "itemsToBeRemoved",
  ],
  closingTerms: ["titleCompany", "closingDate", "possession", "sellerPostClosingDays"],
  notes: ["notesToBuyer", "notesToSeller"],
} as const satisfies Record<string, (keyof OfferFormValues)[]>;

export type SectionKey = keyof typeof SECTION_FIELDS;

/** Map a form field name to its editable section for revealing validation errors. */
export function sectionForField(field: string): SectionKey | undefined {
  for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
    if ((fields as readonly string[]).includes(field)) {
      return section as SectionKey;
    }
  }
  return undefined;
}
