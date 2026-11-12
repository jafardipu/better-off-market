"use client";

import { memo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSectionCard } from "./FormSectionCard";
import { RadioCardGroup } from "./RadioCardGroup";
import type { OfferFormValues } from "@/lib/validations/offer-form";

function ContingenciesSectionImpl() {
  const { control } = useFormContext<OfferFormValues>();
  const inspectionContingency = useWatch({
    control,
    name: "inspectionContingency",
  });
  const appraisalContingency = useWatch({
    control,
    name: "appraisalContingency",
  });

  return (
    <FormSectionCard title="Contingencies">
      <div className="sm:col-span-2">
        <FormLabel className="mb-2 block text-[#4A4646] font-medium">
          Inspection contingency
        </FormLabel>
        <Controller
          control={control}
          name="inspectionContingency"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={[
                {
                  value: "yes",
                  title: "Yes — inspection required",
                  subtitle: "Standard 7–10 day window",
                },
                {
                  value: "no",
                  title: "No — waiving inspection",
                  subtitle: "Strengthens offer position",
                },
              ]}
            />
          )}
        />
      </div>

      <FormField
        control={control}
        name="inspectionDays"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel className="block text-[#4A4646] font-medium">
              Days for inspections
              {inspectionContingency === "yes" && (
                <span className="text-destructive"> *</span>
              )}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                min="1"
                disabled={inspectionContingency !== "yes"}
                placeholder="Enter number of days"
                className=" border border-primary-border-color bg-[#F2F4F6] py-5.5"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="sm:col-span-2">
        <FormLabel className="mb-2 block text-[#4A4646] font-medium">Appraisal</FormLabel>
        <Controller
          control={control}
          name="appraisalContingency"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={[
                {
                  value: "yes",
                  title: "Yes",
                  subtitle:
                    "Likely required for Hard Money and Conventional financing",
                },
                {
                  value: "no",
                  title: "No — waiving inspection",
                  subtitle: "Strengthens offer position",
                },
              ]}
            />
          )}
        />
      </div>

      {/* <FormField
        control={control}
        name="appraisalDays"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Days for Appraisal</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                min="1"
                disabled={appraisalContingency !== "yes"}
                placeholder="Enter"
                className=" border border-primary-border-color bg-[#F2F4F6] py-5.5"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
    </FormSectionCard>
  );
}

export const ContingenciesSection = memo(ContingenciesSectionImpl);
