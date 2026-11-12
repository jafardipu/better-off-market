"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSectionCard } from "./FormSectionCard";
import type { OfferFormValues } from "@/lib/validations/offer-form";

// const NUMERIC_FIELDS: Array<{
//   name: keyof OfferFormValues;
//   label: string;
//   step?: string;
// }> = [
//   { name: "bedrooms", label: "Bedrooms" },
//   { name: "bathrooms", label: "Bathrooms", step: "0.5" },
//   { name: "squareFeet", label: "Square Feet" },
//   { name: "lotSizeAcres", label: "Lot Size (Acres)", step: "0.01" },
//   { name: "yearBuilt", label: "Year Built" },
//   { name: "parkingSpaces", label: "Parking Spaces" },
// ];

interface TextAreaWithOriginalProps {
  name: "personalPropertyIncluded" | "itemsToBeRemoved";
  label: string;
  placeholder: string;
  originalValue?: string;
}

function TextAreaWithOriginal({
  name,
  label,
  placeholder,
  originalValue,
}: TextAreaWithOriginalProps) {
  const { control } = useFormContext<OfferFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-primary-gray">{label}</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder={placeholder} className="min-h-22.5 bg-[#F2F4F6] border-primary-border-color" />
          </FormControl>
          {originalValue ? (
            <p className="text-sm text-[#594139]">Original: {originalValue}</p>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}



function PersonalPropertySectionImpl() {
  const { control } = useFormContext<OfferFormValues>();

  return (
    <FormSectionCard title="Personal Property">
      {/* <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-3 lg:grid-cols-6">
        {NUMERIC_FIELDS.map(({ name, label, step }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={step}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div> */}

      <TextAreaWithOriginal
        name="personalPropertyIncluded"
        label="Personal property included"
        placeholder="e.g. Refrigerator, Washer/Dryer..."

      />
      <TextAreaWithOriginal
        name="itemsToBeRemoved"
        label="Items to be removed"
        placeholder="e.g. Broken shed, debris in basement..."
      />
    </FormSectionCard>
  );
}

export const PersonalPropertySection = memo(PersonalPropertySectionImpl);