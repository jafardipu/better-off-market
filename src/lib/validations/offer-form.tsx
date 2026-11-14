import { z } from "zod";

/**
 * Enumerated options. Kept as `const` tuples so they can drive both the
 * zod enum and the <Select>/<RadioGroup> option lists from a single source.
 */
export const FINANCING_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "hard_money", label: "Hard Money" },
  { value: "conventional", label: "Conventional" },
  { value: "other", label: "Other" },
] as const;

export const CLOSING_COST_OPTIONS = [
  { value: "none", label: "Buyer does NOT request seller contribution" },
  { value: "requested", label: "Buyer DOES request seller contribution" },
] as const;

export const POSSESSION_OPTIONS = [
  { value: "at_closing", label: "At closing" },
  { value: "post_closing", label: "Post-closing" },
] as const;

const financingValues = FINANCING_TYPES.map((o) => o.value) as [
  string,
  ...string[],
];
const closingCostValues = CLOSING_COST_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];
const possessionValues = POSSESSION_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

/** Shared currency primitive: coerces the string from an <input> into a non-negative number. */
const currency = (label: string) =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .nonnegative(`${label} cannot be negative`);

const optionalDays = z.coerce
  .number({ error: "Enter a whole number of days" })
  .int("Enter a whole number of days")
  .min(0)
  .max(365)
  .optional();

export const offerFormSchema = z
  .object({
    // Offer Details
    offerAmount: currency("Offer amount").min(1, "Offer amount is required"),
    earnestMoney: currency("Earnest money"),
    financingType: z.enum(financingValues, {
      error: "Select a financing type",
    }),
    otherFinancingType: z.string().max(120).optional(),
    financingTerms: z.string().max(1000).optional(),

    // Seller Concessions
    closingCostOption: z.enum(closingCostValues),
    sellerContribution: currency("Seller contribution").optional(),

    // Contingencies
    inspectionContingency: z.enum(["yes", "no"], {
      error: "Select an inspection contingency option",
    }),
    inspectionDays: optionalDays,
    appraisalContingency: z.enum(["yes", "no"], {
      error: "Select an appraisal option",
    }),
    // appraisalDays: optionalDays,

    // Real Estate Agent
    hasAgent: z.enum(["yes", "no"], {
      error: "Let us know if you're working with an agent",
    }),
    agentName: z.string().max(120).optional(),
    brokerageName: z.string().max(120).optional(),
    commission: z.preprocess(
      (v) => (v == null ? "" : String(v).trim()),
      z
        .string()
        .max(20)
        .optional()
        .refine(
          (v) => {
            if (!v) return true;
            const percentMatch = v.match(/^(\d+(?:\.\d+)?)%\s*$/);
            if (percentMatch) {
              return Number(percentMatch[1]) <= 100;
            }
            return /^\d+(\.\d+)?$/.test(v);
          },
          {
            message: "Enter a dollar amount, or a percentage up to 100%",
          },
        ),
    ),
    paidBy: z
      .enum(["buyer", "seller"])
      .nullable()
      .optional()
      .transform((v) => v ?? undefined),

    personalPropertyIncluded: z.string().max(2000).optional(),
    itemsToBeRemoved: z.string().max(2000).optional(),

    // Closing Terms
    titleCompany: z.string().max(200).optional(),
    closingDate: z
      .string()
      .optional()
      .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Enter a valid date"),
    possession: z.enum(possessionValues).optional(),
    sellerPostClosingDays: optionalDays,

    // Additional Terms / Notes
    additionalTerms: z.string().max(3000).optional(),
    notesToSeller: z
      .string()
      .max(2000)
      .nullable()
      .optional()
      .transform((v) => v ?? ""),
    notesToBuyer: z
      .string()
      .max(2000)
      .nullable()
      .optional()
      .transform((v) => v ?? ""),
  })
  .superRefine((data, ctx) => {
    if (data.financingType !== "cash" && !data.financingTerms?.trim()) {
      ctx.addIssue({
        path: ["financingTerms"],
        code: z.ZodIssueCode.custom,
        message: "Describe the financing terms",
      });
    }

    if (data.financingType === "other" && !data.otherFinancingType?.trim()) {
      ctx.addIssue({
        path: ["otherFinancingType"],
        code: z.ZodIssueCode.custom,
        message: "Please specify the financing type",
      });
    }

    if (
      data.closingCostOption === "requested" &&
      (data.sellerContribution === undefined || data.sellerContribution <= 0)
    ) {
      ctx.addIssue({
        path: ["sellerContribution"],
        code: z.ZodIssueCode.custom,
        message: "Enter the requested seller contribution",
      });
    }

    if (
      data.inspectionContingency === "yes" &&
      (data.inspectionDays === undefined || data.inspectionDays <= 0)
    ) {
      ctx.addIssue({
        path: ["inspectionDays"],
        code: z.ZodIssueCode.custom,
        message: "Enter the number of days for inspection",
      });
    }

    // if (
    //   data.appraisalContingency === "yes" &&
    //   (data.appraisalDays === undefined || data.appraisalDays <= 0)
    // ) {
    //   ctx.addIssue({
    //     path: ["appraisalDays"],
    //     code: z.ZodIssueCode.custom,
    //     message: "Enter the number of days for appraisal",
    //   });
    // }

    if (data.hasAgent === "yes") {
      if (!data.agentName?.trim()) {
        ctx.addIssue({
          path: ["agentName"],
          code: z.ZodIssueCode.custom,
          message: "Agent name is required",
        });
      }
      if (!data.brokerageName?.trim()) {
        ctx.addIssue({
          path: ["brokerageName"],
          code: z.ZodIssueCode.custom,
          message: "Brokerage name is required",
        });
      }
      if (!data.commission?.trim()) {
        ctx.addIssue({
          path: ["commission"],
          code: z.ZodIssueCode.custom,
          message: "Enter a commission amount or percentage",
        });
      }
      if (!data.paidBy) {
        ctx.addIssue({
          path: ["paidBy"],
          code: z.ZodIssueCode.custom,
          message: "Select who pays the commission",
        });
      }
    }
  });

export type OfferFormValues = z.infer<typeof offerFormSchema>;

export const offerFormDefaultValues: Partial<OfferFormValues> = {
  offerAmount: 0,
  earnestMoney: 0,
  financingTerms: "",
  otherFinancingType: "",
  closingCostOption: "none",
  sellerContribution: 0,
  inspectionContingency: "yes",
  appraisalContingency: "yes",
  hasAgent: "no",
  agentName: "",
  brokerageName: "",
  commission: "",
  personalPropertyIncluded: "",
  itemsToBeRemoved: "",
  titleCompany: "",
  sellerPostClosingDays: 0,
  additionalTerms: "",
  notesToSeller: "",
  notesToBuyer: "",
};
