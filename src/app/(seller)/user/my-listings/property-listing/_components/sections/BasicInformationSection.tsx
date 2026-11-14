"use client";
import { useFormContext } from "react-hook-form";
import { TextField } from "../form-fields/TextField";
import { TextareaField } from "../form-fields/TextareaField";
import { FieldTooltip } from "../form-fields/FieldTooltip";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { LocationEditIcon } from "lucide-react";
import { BASIC_INFO_CONFIG } from "../config/property-type.config";
import { CountySelectorForListing } from "@/components/shared/county_selector/CountySelectorForListing";

export function BasicInformationSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();

  const propertyType = watch("propertyType");
  const config = BASIC_INFO_CONFIG[propertyType];
  const county = watch("county");

  return (
    <section className="rounded-lg border border-[#E2E8F0]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <LocationEditIcon className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-black">
          Basic Information
        </h2>
      </div>

      <div className="space-y-5">
        <TextField
          label="Street Address"
          required
          placeholder="1234 Main Street"
          registration={register("streetAddress")}
          error={errors.streetAddress?.message}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="City"
            required
            placeholder="Cincinnati"
            registration={register("city")}
            error={errors.city?.message}
          />
          <TextField
            label="State"
            required
            placeholder="OH"
            registration={register("state")}
            error={errors.state?.message}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="ZIP Code"
            required
            placeholder="45202"
            registration={register("zipCode")}
            error={errors.zipCode?.message}
            tooltip={
              <FieldTooltip text="This can be found on the County Auditor's website under Property Search." />
            }
          />

          <CountySelectorForListing
            error={errors?.county?.message}
            selectedCounty={county}
            onCountyChange={(newCounty) => {
              setValue("county", newCounty?.county ?? "", {
                shouldValidate: true,
              });
              setValue("countyType", newCounty?.countyType ?? "");
            }}
          />
        </div>

        {config.showParcelId && (
          <TextField
            label="Parcel ID(s) Included in Sale"
            placeholder="e.g. 12-345-678"
            registration={register("parcelIds")}
            error={errors.parcelIds?.message}
            tooltip={
              <FieldTooltip text="Enter every parcel number included in this sale, separated by commas, exactly as they appear on the county record." />
            }
          />
        )}

        <div
          className={`grid gap-5 ${
            config.showBuyItNowPrice ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          <TextField
            label="Listing Price ($)"
            wholeNumbersOnly
            required
            type="number"
            step="0.01"
            placeholder="0"
            registration={register("listingPrice")}
            error={errors.listingPrice?.message}
          />
          {config.showBuyItNowPrice && (
            <TextField
              label="Buy it Now Price ($)"
              required
              type="number"
              step="0.01"
              placeholder="0"
              registration={register("buyItNowPrice")}
              error={errors.buyItNowPrice?.message}
            />
          )}
          <TextField
            label="ARV ($)"
            wholeNumbersOnly
            type="number"
            step="0.01"
            placeholder="0"
            registration={register("arv")}
            error={errors.arv?.message}
            tooltip={
              <FieldTooltip text='ARV stands for "After-Repair Value." It is the estimated future worth of a property after all planned renovations and repairs are completed.' />
            }
          />
        </div>

        <TextareaField
          label="Marketing Description"
          required
          rows={5}
          placeholder="Describe the key features, amenities, and unique selling points. This is where you can also provide building financials and comparable sales to support your listing price and/or ARV."
          registration={register("marketingDescription")}
          error={errors.marketingDescription?.message}
          className="h-28"
        />

        {config.showUtilities && (
          <TextareaField
            label="Utilities"
            rows={4}
            placeholder="Public water, sewer, gas, and electric are located at the street."
            registration={register("utilities")}
            error={errors.utilities?.message}
          />
        )}
      </div>
    </section>
  );
}
