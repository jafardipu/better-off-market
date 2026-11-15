import { PropertySpecificationsIcon } from "@/icons";
import { HomeIcon, ClosingPreferencesIcon, MajorComponentsIcon } from "@/icons";
import { IPropertyResponse } from "@/types";
import { ClipboardList } from "lucide-react";
import ReadMoreText from "@/components/shared/utils/ReadMoreText";
import { formatDateUS } from "@/utils/formatDateUS";

interface SpecItem {
  label: string;
  value: string | undefined;
  note?: string | undefined;
}

interface PropertyInfoProps {
  property: IPropertyResponse;
  propertySpecsLeft?: SpecItem[];
  propertySpecsRight?: SpecItem[];
  components?: SpecItem[];
  hoaFee?: string;
  hoaAmenities?: string[];
  closingPreferences?: SpecItem[];
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0] p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-primary-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SpecRow({ label, value, note }: SpecItem) {
  return (
    <div className="flex justify-between py-2.5 text-sm">
      <span className="text-[#594139]">{label}</span>
      <span className="font-medium text-primary-black">
        {value}
        {note && (
          <span className="ml-1 font-normal text-[#767676]">({note})</span>
        )}
      </span>
    </div>
  );
}

export function PropertyInfo({ property }: PropertyInfoProps) {
  const formatCamelCaseToLabel = (key: string) =>
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase -> camel Case
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter

  const SPEC_LABEL_OVERRIDES: Record<string, string> = {
    parking: "Other Parking",
  };

  const propertySpecsLeft = Object.entries(property?.specifications ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      label: SPEC_LABEL_OVERRIDES[key] ?? formatCamelCaseToLabel(key),
      value: String(value),
      note: key === "lotSize" ? "Acres" : undefined,
    }));

  const components = [
    {
      label: "Roof Material",
      value: property?.roofMaterial,
      note: `${property?.roofAge} years`,
    },
    {
      label: "Heating System",
      value: property?.heatingSystem,
      note: `${property?.heatingAge} years`,
    },
    {
      label: "Cooling",
      value: property?.cooling,
      note: `${property?.coolingAge} years`,
    },
    {
      label: "Water Heating",
      value: property?.waterHeating,
      note: `${property?.waterHeatingAge} years`,
    },
    {
      label: "Water",
      value: property?.water,
    },
    {
      label: "Sewer",
      value: property?.sewer,
    },
    {
      label: "Foundation",
      value: property?.foundation,
    },
  ].filter((c) => Boolean(c.value));

  const closingPreferences = [
    { label: "Title Company", value: property?.titleCompany },
    {
      label: "Closing Date",
      value: property?.closingDate
        ? formatDateUS(property.closingDate)
        : undefined,
    },
  ].filter((c) => Boolean(c.value));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard
          icon={
            <PropertySpecificationsIcon className="size-5 text-[#1F4E8B]" />
          }
          title="Property Specifications"
        >
          <div>
            <div>
              {propertySpecsLeft.map((item, i) => (
                <SpecRow key={i} {...item} />
              ))}
            </div>
          </div>
        </InfoCard>

        <InfoCard
          icon={<MajorComponentsIcon className="size-5 text-[#1F4E8B]" />}
          title="Major Components"
        >
          {components.map((item, i) => (
            <div key={i}>
              <SpecRow {...item} />
              {i !== components.length - 1 && (
                <div className="h-px bg-[#DEDEDE]"></div>
              )}
            </div>
          ))}
        </InfoCard>
      </div>

      {property?.otherUpdates ? (
        <InfoCard
          icon={<ClipboardList className="size-5 text-[#1F4E8B]" />}
          title="Other Ages/Updates"
        >
          <div className="text-base text-primary-black leading-relaxed">
            <ReadMoreText text={property.otherUpdates} wordLimit={120} />
          </div>
        </InfoCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard
          icon={<HomeIcon className="size-5 text-[#1F4E8B]" />}
          title="HOA Details"
        >
          {property?.hasHoa === "yes" ? (
            <>
              <SpecRow
                label={`${property?.hoaFrequency || "HOA"} Fee`}
                value={property?.hoaAmount ? `$${property?.hoaAmount}` : "N/A"}
              />
              {property?.hoaIncludes ? (
                <>
                  <div className="h-px bg-[#DEDEDE]"></div>
                  <div className="pt-2">
                    <p className="mt-1 text-sm">
                      <span className="text-[#594139]">Includes: </span>{" "}
                      <span className="text-xs whitespace-pre-wrap">
                        {property.hoaIncludes}
                      </span>
                    </p>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <h5 className="mt-5 text-center text-primary-gray">
              No HOA affiliated with this property.
            </h5>
          )}
        </InfoCard>

        <InfoCard
          icon={<ClosingPreferencesIcon className="size-5 text-[#1F4E8B]" />}
          title="Closing Preferences"
        >
          {closingPreferences?.length ? (
            closingPreferences?.map((item, i) => (
              <div key={i}>
                <SpecRow {...item} />
                {i !== closingPreferences.length - 1 && (
                  <div className="h-px bg-[#DEDEDE]"></div>
                )}
              </div>
            ))
          ) : (
            <h5 className="mt-5 text-center mar">
              No closing preferences data included in this property{" "}
            </h5>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
