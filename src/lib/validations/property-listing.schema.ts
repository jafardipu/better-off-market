import {
  BASIC_INFO_CONFIG,
  PROPERTY_SPECIFICATIONS_CONFIG,
  PROPERTY_TYPES,
} from "@/app/(seller)/user/my-listings/property-listing/_components/config/property-type.config";
import { z } from "zod";

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 100 * 1024 * 1024, "File must be under 100MB");

const fileOrUrlSchema = z.union([
  fileSchema,
  z.string().min(1, "Value is required"),
]);

const locationSchema = z.object(
  {
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  },
  {
    error: "Location is required",
  },
);

export const propertyListingSchema = z
  .object({
    propertyType: z.enum(PROPERTY_TYPES, {
      error: "Property type is required",
    }),

    useType: z.string().optional(),
    useTypeOther: z.string().optional(),

    // Ownership
    ownership: z.enum(["own", "assignable"], {
      error: "Select an ownership type",
    }),

    // map location
    location: locationSchema,

    // Basic Information
    streetAddress: z.string().min(1, "Street address is required"),
    state: z.string().min(1, "State is required"),
    county: z
      .string({ message: "County is required" })
      .min(1, "County is required"),
    countyType: z
      .string({ error: "County is required" })
      .min(1, "County is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(5, "Enter a valid ZIP code"),
    // county: z.string().min(1, "County is required"),
    parcelIds: z.string().optional(),
    listingPrice: z.coerce
      .number({ error: "Enter a valid amount" })
      .positive("Listing price is required"),
    buyItNowPrice: z.coerce.number().optional(),
    arv: z.coerce.number().optional(),
    marketingDescription: z
      .string()
      .min(1, "Marketing description is required")
      .max(3000),
    utilities: z.string().optional(),

    // Property Specifications — dynamic, keyed by SpecField.name
    specifications: z
      .record(z.string(), z.union([z.string(), z.number()]).optional())
      .default({})
      .transform((obj) => {
        // drop keys with undefined values so downstream code doesn't have to deal with them
        return Object.fromEntries(
          Object.entries(obj).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number>;
      }),

    // Major Components & Ages
    roofMaterial: z.string().optional(),
    roofAge: z.coerce.number().min(0, "Age cannot be negative").optional(),
    heatingSystem: z.string().optional(),
    heatingAge: z.coerce.number().min(0, "Age cannot be negative").optional(),
    cooling: z.string().optional(),
    coolingAge: z.coerce.number().min(0, "Age cannot be negative").optional(),
    waterHeating: z.string().optional(),
    waterHeatingAge: z.coerce.number().min(0, "Age cannot be negative").optional(),
    water: z.string().optional(),
    sewer: z.string().optional(),
    foundation: z.string().optional(),
    otherUpdates: z.string().optional(),
    roofMaterialOther: z.string().optional(),
    heatingSystemOther: z.string().optional(),
    coolingOther: z.string().optional(),
    waterHeatingOther: z.string().optional(),
    waterOther: z.string().optional(),
    sewerOther: z.string().optional(),
    foundationOther: z.string().optional(),

    // HOA
    hasHoa: z.enum(["yes", "no"]).default("no"),
    hoaAmount: z.coerce.number().optional(),
    hoaFrequency: z.enum(["Monthly", "Quarterly", "Annually"]).optional(),
    hoaIncludes: z.string().optional(),

    // Closing
    titleCompany: z.string().optional(),
    closingDate: z
      .string()
      .min(1, "Closing preference is required")
      .refine(
        (value) => value !== "Specific",
        "Please enter a specific closing date",
      ),

    // Files
    photos: z
      .array(fileOrUrlSchema)
      .min(5, "At least 5 property photos required"),
    documents: z.array(fileOrUrlSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const config = BASIC_INFO_CONFIG[data.propertyType];
    const specificationFields = PROPERTY_SPECIFICATIONS_CONFIG[
      data.propertyType
    ].flatMap((row) => row.fields);

    for (const field of specificationFields) {
      if (field.type !== "number" || field.step === undefined) continue;

      const rawValue = data.specifications[field.name];
      if (rawValue === undefined || rawValue === "") continue;

      const value = Number(rawValue);
      if (!Number.isFinite(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specifications", field.name],
          message: `${field.label} must be a valid number`,
        });
        continue;
      }

      if (field.min !== undefined && value < field.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specifications", field.name],
          message: `${field.label} cannot be less than ${field.min}`,
        });
      }

      const precision = String(field.step).split(".")[1]?.length ?? 0;
      const scaledValue = value * 10 ** precision;
      if (Math.abs(scaledValue - Math.round(scaledValue)) > 1e-8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specifications", field.name],
          message: `${field.label} allows up to ${precision} decimal places`,
        });
      }
    }

    if (config.showBuyItNowPrice && !data.buyItNowPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyItNowPrice"],
        message: "Buy it now price is required",
      });
    }

    if (data.hasHoa === "yes" && !data.hoaAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hoaAmount"],
        message: "HOA amount is required",
      });
    }

    if (data.hasHoa === "yes" && !data.hoaFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hoaFrequency"],
        message: "Select how often the HOA is paid",
      });
    }
  });

export type PropertyListingFormValues = z.infer<typeof propertyListingSchema>;
