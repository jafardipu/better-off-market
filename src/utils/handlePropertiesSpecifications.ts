import { Boxes, Building, Calendar, Cuboid, LandPlot } from "lucide-react";
import { AreaIcon, BedIcon, ShawarIcon } from "@/icons";
import { priceFormatter } from "@/components/shared/utils/priceFormatter";

const groupedNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/** Sum full + half baths for the compact property stats row. */
function totalBaths(specifications: any) {
  const full = Number(specifications?.fullBaths) || 0;
  const half = Number(specifications?.halfBaths) || 0;
  const total = full + half;
  return total > 0 ? total : undefined;
}

function bathLabel(count: unknown) {
  return Number(count) === 1 ? "Bath" : "Baths";
}

function formatSqFt(value: unknown) {
  const raw = String(value ?? "").trim().replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return value;
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return value;
  return groupedNumber.format(amount);
}

export const handlePropertiesSpecifications = (
  propertyType: string,
  specifications: any,
) => {
  switch (propertyType) {
    case "Residential": {
      const baths = totalBaths(specifications);
      return [
        {
          icon: BedIcon,
          value: specifications?.bedrooms,
          suffix: "Beds",
          label: "Bedrooms",
        },
        {
          icon: ShawarIcon,
          value: baths,
          suffix: bathLabel(baths),
          label: "Bathrooms",
        },
        {
          icon: AreaIcon,
          value: formatSqFt(specifications?.sqFootage),
          suffix: "Sq. Ft",
          label: "Sq. Footage",
        },
        {
          icon: Calendar,
          value: specifications?.yearBuilt,
          suffix: "",
          label: "Year Built",
        },
      ];
    }

    case "Multi-Family":
      return [
        {
          icon: Boxes,
          value: specifications?.totalUnits,
          suffix: "Units",
          label: "Total Units",
        },
        {
          // icon: ShawarIcon,
          value: Number.isFinite(Number(specifications?.totalRent))
            ? priceFormatter.format(Number(specifications.totalRent))
            : undefined,
          suffix: "Rent",
          label: "Total Rent",
        },
        {
          icon: AreaIcon,
          value: specifications?.lotSize,
          suffix: "Acres",
          label: "Lot Size",
        },
        {
          icon: Calendar,
          value: specifications?.yearBuilt,
          suffix: "",
          label: "Year Built",
        },
      ];

    case "Commercial":
      return [
        {
          icon: Building,
          value: specifications?.totalBuildings,
          suffix: "Buildings",
          label: "Total Buildings",
        },
        {
          // icon: ShawarIcon,
          value: specifications?.totalUnits,
          suffix: "Units",
          label: "Total Units",
        },
        {
          icon: AreaIcon,
          value: formatSqFt(specifications?.totalSqFootage),
          suffix: "Sq.Ft",
          label: "Total Sq.Ft",
        },
        {
          icon: Calendar,
          value: specifications?.yearBuilt,
          suffix: "",
          label: "Year Built",
        },
      ];

    case "Land":
      return [
        {
          icon: Cuboid,
          value: specifications?.lotSize,
          suffix: "Acres",
          label: "Lot Size",
        },
        {
          icon: LandPlot,
          value: specifications?.totalParcels,
          suffix: "Parcels",
          label: "Total Parcels",
        },
      ];

    default:
      return [
        {
          icon: Cuboid,
          value: specifications?.lotSizeUnit || specifications?.lotSize,
          suffix: "Acres",
          label: "Lot Size",
        },
        {
          icon: LandPlot,
          value: specifications?.totalParcels,
          suffix: "Parcels",
        },
      ];
  }
};
