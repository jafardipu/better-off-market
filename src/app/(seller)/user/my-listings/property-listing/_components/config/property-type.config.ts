export const PROPERTY_TYPES = [
  "Residential",
  "Multi-Family",
  "Commercial",
  "Land",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface SelectFieldOption {
  label: string;
  value: string;
}

export interface SpecField {
  name: string;
  label: string;
  type: "number" | "text" | "select" | "textarea";
  placeholder?: string;
  options?: SelectFieldOption[];
  className?: string;
  rows?: number;
  tooltip?: string; // NEW
  step?: number;
  min?: number;
  showSpinner?: boolean;
}

export interface SpecRow {
  fields: SpecField[];
}

/** Controls which Basic Information fields are required/shown per property type */
export interface BasicInfoConfig {
  showParcelId: boolean;
  showBuyItNowPrice: boolean;
  showUtilities: boolean; // NEW
}

export const BASIC_INFO_CONFIG: Record<PropertyType, BasicInfoConfig> = {
  Residential: {
    showParcelId: true,
    showBuyItNowPrice: false,
    showUtilities: false,
  },
  "Multi-Family": {
    showParcelId: true,
    showBuyItNowPrice: false,
    showUtilities: false,
  },
  Commercial: {
    showParcelId: true,
    showBuyItNowPrice: false,
    showUtilities: false,
  },
  Land: { showParcelId: true, showBuyItNowPrice: false, showUtilities: true },
};

const selectOpts = (values: string[]): SelectFieldOption[] =>
  values.map((v) => ({ label: v, value: v }));

/**
 * Property Specifications section — rows of fields per property type.
 * An empty array hides the whole section for that type.
 */

export const PARKING_OPTIONS = selectOpts([
  "Driveway",
  "On street",
  "Carport",
  "Assigned",
  "None",
  "Other",
]);


export const PROPERTY_SPECIFICATIONS_CONFIG: Record<PropertyType, SpecRow[]> = {
  "Multi-Family": [
    {
      fields: [
        {
          name: "totalUnits",
          label: "Total # of Units",
          type: "number",
          placeholder: "8",
          className: "col-span-2",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "separateGasElec",
          label: "Separate Gas & Elec.",
          type: "select",
          options: selectOpts(["Yes", "No"]),
        },
        {
          name: "separateAC",
          label: "Separate A/C",
          type: "select",
          options: selectOpts(["Yes", "No"]),
        },
      ],
    },
    {
      fields: [
        {
          name: "unitBreakdown",
          label: "Unit Breakdown",
          type: "text",
          placeholder: "4 1-bedroom units, 4 2-bedroom units",
          className: "col-span-2",
        },
        {
          name: "separateFurnace",
          label: "Separate Furnace",
          type: "select",
          options: selectOpts(["Yes", "No"]),
        },
        {
          name: "heatPaidBy",
          label: "Heat Paid by",
          type: "select",
          options: selectOpts(["Owner", "Buyer"]),
        },
      ],
    },
    {
      fields: [
        {
          name: "totalRent",
          label: "Total Rent ($)",
          type: "number",
          placeholder: "0",
        },
        {
          name: "avgRentPerUnit",
          label: "Avg. Rent/Unit ($)",
          type: "number",
          placeholder: "0",
        },
        {
          name: "waterPaidBy",
          label: "Water Paid by",
          type: "select",
          options: selectOpts(["Owner", "Buyer"]),
          className: "col-span-2",
        },
      ],
    },
    {
      fields: [
        {
          name: "garageSpaces",
          label: "Garage Spaces",
          type: "number",
          placeholder: "4",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "parking",
          label: "Other Parking",
          type: "select",
          options: selectOpts([
            "Driveway",
            "On street",
            "Carport",
            "Assigned",
            "None",
            "Other",
          ]),
        },
        {
          name: "lotSize",
          label: "Lot Size (Acres)",
          type: "number",
          placeholder: "0.25",
          step: 0.001,
          min: 0,
        },
        {
          name: "yearBuilt",
          label: "Year Built",
          type: "number",
          placeholder: "1995",
        },
      ],
    },
  ],

  // Fill these in once you share Commercial / Land field lists
  Commercial: [
    {
      fields: [
        {
          name: "totalBuildings",
          label: "Total # of Buildings",
          type: "number",
          placeholder: "1",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "totalUnits",
          label: "Total # of Units",
          type: "number",
          placeholder: "8",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "totalSqFootage",
          label: "Total Sq. Footage",
          type: "number",
          placeholder: "18,500",
        },
      ],
    },
    {
      fields: [
        {
          name: "lotSize",
          label: "Lot Size (Acres)",
          type: "number",
          placeholder: "0.25",
          step: 0.001,
          min: 0,
        },
        {
          name: "yearBuilt",
          label: "Year Built",
          type: "number",
          placeholder: "1995",
        },
        {
          name: "parkingSpace",
          label: "Parking space",
          type: "number",
          placeholder: "30",
          step: 1,
          min: 0,
          showSpinner: true,
        },
      ],
    },
  ],
  Land: [
    {
      fields: [
        {
          name: "lotSize",
          label: "Lot Size",
          type: "number",
          placeholder: "e.g. 5.2",
          className: "sm:col-span-1 lg:col-span-2",
          step: 0.001,
          min: 0,
        },
        {
          name: "totalParcels",
          label: "Total Parcels",
          type: "number",
          placeholder: "e.g. 1",
          className: "sm:col-span-1 lg:col-span-2",
          step: 1,
          min: 0,
          showSpinner: true,
        },
      ],
    },
    {
      fields: [
        {
          name: "lotSizeUnit",
          label: "Lot Size (Acres)",
          type: "text",
          placeholder: "e.g. 5.2 Acres",
          className: "sm:col-span-1 lg:col-span-2",
        },
        {
          name: "zoning",
          label: "Zoning",
          type: "select",
          options: selectOpts([
            "Residential",
            "Commercial",
            "Agricultural",
            "Other",
          ]),
          className: "sm:col-span-1 lg:col-span-2",
        },
      ],
    },
    {
      fields: [
        {
          name: "utilities",
          label: "Utilities",
          type: "textarea",
          rows: 3,
          placeholder:
            "Public water, sewer, gas, and electric are located at the street.",
          className: "sm:col-span-3 lg:col-span-4",
        },
      ],
    },
  ],
  Residential: [
    {
      fields: [
        {
          name: "bedrooms",
          label: "Bedrooms",
          type: "number",
          placeholder: "3",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "fullBaths",
          label: "Full Baths",
          type: "number",
          placeholder: "2",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "halfBaths",
          label: "Half Baths",
          type: "number",
          placeholder: "1",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "sqFootage",
          label: "Sq. Footage",
          type: "number",
          placeholder: "1850",
          tooltip:
            "If you are unsure of the property's finished square footage, you can find this on the County Auditor's website.",
        },
      ],
    },
    {
      fields: [
        {
          name: "garageSpaces",
          label: "Garage Spaces",
          type: "number",
          placeholder: "2",
          step: 1,
          min: 0,
          showSpinner: true,
        },
        {
          name: "parking",
          label: "Other Parking",
          type: "select",
          options: PARKING_OPTIONS,
        },
        {
          name: "lotSize",
          label: "Lot Size (Acres)",
          type: "number",
          placeholder: "0.25",
          step: 0.001,
          min: 0,
        },
        {
          name: "yearBuilt",
          label: "Year Built",
          type: "number",
          placeholder: "1995",
        },
      ],
    },
  ],
};

export const ROOF_OPTIONS = selectOpts([
  "Shingle",
  "Slate",
  "Tile",
  "Membrane",
  "Other",
]);
export const HEATING_OPTIONS = selectOpts(["Gas", "Electric", "None", "Other"]);
export const COOLING_OPTIONS = selectOpts([
  "Central A/C",
  "Window units",
  "None",
  "Other",
]);
export const WATER_HEATING_OPTIONS = selectOpts([
  "Gas",
  "Electric",
  "None",
  "Other",
]);
export const WATER_OPTIONS = selectOpts([
  "Public",
  "Cistern",
  "Well",
  "None",
  "Other",
]);
export const SEWER_OPTIONS = selectOpts([
  "Public",
  "Septic",
  "Aerobic",
  "None",
  "Other",
]);
export const FOUNDATION_OPTIONS = selectOpts([
  "Block",
  "Poured",
  "Slab",
  "Stone",
  "Other",
]);
export const COUNTY_OPTIONS = selectOpts([
  "Franklin",
  "Hamilton",
  "Cuyahoga",
  "Montgomery",
]);
export const HOA_FREQUENCY_OPTIONS = selectOpts([
  "Monthly",
  "Quarterly",
  "Annually",
]);

export const USE_TYPE_OPTIONS = selectOpts(["Apartment", "Retail", "Restaurant", "Service","Manufacturing", "Industrial", "Others"]);
export const CLOSING_DATE_OPTIONS = selectOpts(["ASAP", "Specific"]);
