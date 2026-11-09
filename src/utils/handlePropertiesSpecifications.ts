import { Boxes, Building, Calendar, Cuboid, LandPlot } from "lucide-react";
import { AreaIcon, BedIcon, ShawarIcon } from "@/icons";

/** Sum full + half baths for the compact property stats row. */
function totalBaths(specifications: any) {
  const full = Number(specifications?.fullBaths) || 0;
  const half = Number(specifications?.halfBaths) || 0;
  const total = full + half;
  return total > 0 ? total : undefined;
}

export const handlePropertiesSpecifications = (
  propertyType: string,
  specifications: any,
) => {
  switch (propertyType) {
    case "Residential":
      return [
        {
          icon: BedIcon,
          value: specifications?.bedrooms,
          suffix: "Beds",
          label: "Bedrooms",
        },
        {
          icon: ShawarIcon,
          value: totalBaths(specifications),
          suffix: "Baths",
          label: "Bathrooms",
        },
        {
          icon: AreaIcon,
          value: specifications?.sqFootage,
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
          value: `$${specifications?.totalRent}`,
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
          value: specifications?.totalSqFootage,
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
