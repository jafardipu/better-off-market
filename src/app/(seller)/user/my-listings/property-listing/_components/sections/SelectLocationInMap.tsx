import { LocationSelectorForListing } from "@/components/shared/map-location/Locationselectorforlisting";
import { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { LocationEditIcon } from "lucide-react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

export default function SelectLocationInMap() {
  const {
    watch,
    setValue,
    resetField,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();

  const streetAddress = watch("streetAddress");
  const city = watch("city");
  const state = watch("state");
  const zipCode = watch("zipCode");

  const addressQuery = useMemo(() => {
    const street = streetAddress?.trim() ?? "";
    const cityName = city?.trim() ?? "";
    const stateName = state?.trim() ?? "";
    const zip = zipCode?.trim() ?? "";
    const stateZip = [stateName, zip].filter(Boolean).join(" ");
    return [street, cityName, stateZip].filter(Boolean).join(", ");
  }, [streetAddress, city, state, zipCode]);

  const addressReady = Boolean(
    streetAddress?.trim() && city?.trim() && state?.trim(),
  );

  return (
    <section className="rounded-lg border border-[#E2E8F0]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <LocationEditIcon className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-black">
          Place Location on the Map
        </h2>
      </div>
      <LocationSelectorForListing
        error={errors?.location?.message}
        addressQuery={addressQuery}
        addressReady={addressReady}
        value={watch("location")}
        onChange={(newLocation) => {
          if (newLocation) {
            setValue("location", newLocation, { shouldValidate: true });
          } else {
            resetField("location", { defaultValue: undefined });
          }
        }}
      />
    </section>
  );
}
