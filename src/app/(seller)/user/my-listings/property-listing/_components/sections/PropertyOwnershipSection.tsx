"use client";
import { Controller, useFormContext } from "react-hook-form";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { PropertyOwnershipIcon } from "@/icons";
import { CheckIcon } from "lucide-react";

export function PropertyOwnershipSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();

  return (
    <section className="rounded-lg border border-[#E2E8F0]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <PropertyOwnershipIcon className="text-primary-blue" />
        <h2 className="text-xl font-semibold text-primary-black">
          Property Ownership<span className="text-red-500">*</span>
        </h2>
      </div>

      <Controller
        name="ownership"
        control={control}
        render={({ field }) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              {/* Own it */}
              <button
                type="button"
                onClick={() => field.onChange("own")}
                className={`flex h-full min-h-28 w-full rounded-lg border p-4 text-left transition-colors ${
                  field.value === "own"
                    ? "border-2 border-primary-color bg-[#DBE1FF33]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex h-full flex-col justify-start">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`flex size-5 items-center justify-center rounded-full border ${
                        field.value === "own"
                          ? "border-primary-color bg-primary-color"
                          : "border-[#737686] bg-transparent"
                      }`}
                    >
                      {field.value === "own" && (
                        <CheckIcon color="white" className="size-3" />
                      )}
                    </span>
                    <span className="text-sm font-bold text-primary-black">
                      I Own This Property
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    You are the legal owner of the property and are listing it
                    directly.
                  </p>
                </div>
              </button>

              {/* Assignable contract */}
              <button
                type="button"
                onClick={() => field.onChange("assignable")}
                className={`flex h-full min-h-28 w-full rounded-lg border p-4 text-left transition-colors ${
                  field.value === "assignable"
                    ? "border-2 border-primary-color bg-[#DBE1FF33]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex h-full flex-col justify-start">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`flex size-5 items-center justify-center rounded-full border ${
                        field.value === "assignable"
                          ? "border-primary-color bg-primary-color"
                          : "border-[#737686] bg-transparent"
                      }`}
                    >
                      {field.value === "assignable" && (
                        <CheckIcon color="white" className="size-3" />
                      )}
                    </span>
                    <span className="text-sm font-bold text-primary-black">
                      I Have an Assignable Contract
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    You have the equitable interest and right to assign the
                    purchase agreement.
                  </p>
                </div>
              </button>
            </div>

          </>
        )}
      />

      {errors.ownership && (
        <p className="mt-2 text-xs text-red-500">{errors.ownership.message}</p>
      )}
    </section>
  );
}
