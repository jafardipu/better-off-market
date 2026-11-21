"use client";
import { useFormContext } from "react-hook-form";
import { TextField } from "../form-fields/TextField";
import { SelectField } from "../form-fields/SelectField";
import { TextareaField } from "../form-fields/TextareaField";
import {
  ROOF_OPTIONS,
  HEATING_OPTIONS,
  COOLING_OPTIONS,
  WATER_HEATING_OPTIONS,
  WATER_OPTIONS,
  SEWER_OPTIONS,
  FOUNDATION_OPTIONS,
} from "../config/property-type.config";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { MajorComponentsIcon2 } from "@/icons";

export function MajorComponentsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();

  return (
    <section className="rounded-lg border border-[#E2E8F0]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <MajorComponentsIcon2 className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-black">
          Major Components & Ages
        </h2>
      </div>

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-4">
          <SelectField label="Roofing" name="roofMaterial" control={control} options={ROOF_OPTIONS} />
          <TextField
            label="Age"
            type="number"
            min={0}
            placeholder="Years Old"
            registration={register("roofAge")}
            error={errors.roofAge?.message}
          />
          <SelectField label="Heating System" name="heatingSystem" control={control} options={HEATING_OPTIONS} />
          <TextField
            label="Age"
            type="number"
            min={0}
            placeholder="Years Old"
            registration={register("heatingAge")}
            error={errors.heatingAge?.message}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-4">
          <SelectField label="Cooling" name="cooling" control={control} options={COOLING_OPTIONS} />
          <TextField
            label="Age"
            type="number"
            min={0}
            placeholder="Years Old"
            registration={register("coolingAge")}
            error={errors.coolingAge?.message}
          />
          <SelectField label="Water Heating" name="waterHeating" control={control} options={WATER_HEATING_OPTIONS} />
          <TextField
            label="Age"
            type="number"
            min={0}
            placeholder="Years Old"
            registration={register("waterHeatingAge")}
            error={errors.waterHeatingAge?.message}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Water" name="water" control={control} options={WATER_OPTIONS} />
          <SelectField label="Sewer" name="sewer" control={control} options={SEWER_OPTIONS} />
        </div>

        <div className="max-w-sm">
          <SelectField label="Foundation" name="foundation" control={control} options={FOUNDATION_OPTIONS} />
        </div>

        <TextareaField
          label="Other Ages/Updates"
          rows={3}
          placeholder="List any other significant updates..."
          registration={register("otherUpdates")}
          error={errors.otherUpdates?.message}
        />
      </div>
    </section>
  );
}
