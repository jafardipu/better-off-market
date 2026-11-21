"use client";
import { useFormContext } from "react-hook-form";
import { TextField } from "../form-fields/TextField";
import { SelectField } from "../form-fields/SelectField";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { HomeIcon } from "@/icons";
import { PROPERTY_SPECIFICATIONS_CONFIG } from "../config/property-type.config";
import { FieldTooltip } from "../form-fields/FieldTooltip";

export function PropertySpecificationsSection() {
  const { register, control, watch, getFieldState } =
    useFormContext<PropertyListingFormValues>();

  const propertyType = watch("propertyType");
  const rows = PROPERTY_SPECIFICATIONS_CONFIG[propertyType];

  // Nothing configured for this property type — hide the whole section
  if (rows.length === 0) return null;

  return (
    <section className="rounded-lg border border-[#E2E8F0]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <HomeIcon className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-black">
          Property Specifications
        </h2>
      </div>

      <div className="space-y-5">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {row.fields.map((field) => {
              const fieldPath = `specifications.${field.name}` as const;

              if (field.type === "select") {
                return (
                  <SelectField
                    key={field.name}
                    label={field.label}
                    name={fieldPath}
                    control={control}
                    options={field.options ?? []}
                    placeholder="Select"
                    className={field.className}
                    tooltip={
                      field.tooltip ? (
                        <FieldTooltip text={field.tooltip} />
                      ) : undefined
                    }
                  />
                );
              }

              // if (field.type === "textarea") {
              //   return (
              //     <TextareaField
              //       key={field.name}
              //       label={field.label}
              //       rows={field.rows ?? 3}
              //       placeholder={field.placeholder}
              //       registration={register(fieldPath)}
              //       className={field.className}
              //     />
              //   );
              // }

              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  type={field.type === "number" ? "number" : "text"}
                  step={
                    field.type === "number" && !field.maxDigits
                      ? (field.step ?? 0.01)
                      : undefined
                  }
                  min={field.min}
                  maxDigits={field.maxDigits}
                  wholeNumbersOnly={Boolean(field.maxDigits)}
                  maxLength={field.maxDigits}
                  placeholder={field.placeholder}
                  registration={register(fieldPath)}
                  extraClassName={field.className}
                  hideNumberSpinner={
                    field.type === "number" && !field.showSpinner
                  }
                  error={getFieldState(fieldPath).error?.message}
                  tooltip={
                    field.tooltip ? (
                      <FieldTooltip text={field.tooltip} />
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
