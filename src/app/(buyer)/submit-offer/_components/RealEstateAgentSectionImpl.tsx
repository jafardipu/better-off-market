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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormSectionCard } from "./FormSectionCard";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { Info } from "lucide-react";

function RealEstateAgentSectionImpl() {
  const {
    control,
    formState: { errors },
  } = useFormContext<OfferFormValues>();
  const hasAgent = useWatch({ control, name: "hasAgent" });
  const isWorkingWithAgent = hasAgent === "yes";

  return (
    <FormSectionCard title="Real Estate Agent">
      <div className="sm:col-span-2">
        <FormLabel className="mb-2 block text-primary-gray">
          Are you working with a Real Estate Agent?
        </FormLabel>
        <Controller
          control={control}
          name="hasAgent"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              className="flex items-center gap-6 cursor-pointer"
            >

              <Label
                htmlFor="hasAgent-no"
                className="flex cursor-pointer items-center gap-2 text-primary-black"
              >
                <RadioGroupItem value="no" id="hasAgent-no" />
                No
              </Label>
              <Label
                htmlFor="hasAgent-yes"
                className="flex cursor-pointer items-center gap-2 text-primary-black"
              >
                <RadioGroupItem value="yes" id="hasAgent-yes" />
                Yes
              </Label>

            </RadioGroup>
          )}
        />
      </div>

      <div className="sm:col-span-2 grid xl:grid-cols-4 md:grid-cols-2 w-full items-center lg:gap-5 gap-3 ">
        <FormField
          control={control}
          name="agentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-primary-gray">
                Agent Name
                {isWorkingWithAgent && (
                  <span className="text-destructive"> *</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isWorkingWithAgent}
                  placeholder="Enter name"
                  className="border border-primary-border-color bg-[#F2F4F6] py-5.5"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brokerageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-primary-gray">
                Brokerage Name
                {isWorkingWithAgent && (
                  <span className="text-destructive"> *</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isWorkingWithAgent}
                  placeholder="Enter brokerage"
                  className="border border-primary-border-color bg-[#F2F4F6] py-5.5"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="commission"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5 text-sm text-primary-gray">
                Commission ($ or %)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="text-primary-color">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter either a fixed dollar amount or percentage of sale
                      price.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isWorkingWithAgent && (
                  <span className="text-destructive">*</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  disabled={!isWorkingWithAgent}
                  placeholder="e.g. 3% or 5000"
                  className="border border-primary-border-color bg-[#F2F4F6] py-5.5"
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Tab",
                      "Home",
                      "End",
                    ];
                    if (allowedKeys.includes(e.key)) return;

                    if (
                      (e.ctrlKey || e.metaKey) &&
                      ["a", "c", "v", "x"].includes(e.key.toLowerCase())
                    ) {
                      return;
                    }

                    const currentValue = e.currentTarget.value;

                    // Allow digits always
                    if (/^[0-9]$/.test(e.key)) return;

                    // Allow a single "%" only once, anywhere a digit already exists
                    if (
                      e.key === "%" &&
                      !currentValue.includes("%") &&
                      currentValue.length > 0
                    )
                      return;

                    e.preventDefault();
                  }}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Strip anything that isn't a digit or %
                    value = value.replace(/[^0-9%]/g, "");

                    // Collapse multiple % into one, forced to the end
                    const hasPercent = value.includes("%");
                    value = value.replace(/%/g, "");
                    if (hasPercent) value += "%";

                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-sm text-primary-gray">
            Paid By
            {isWorkingWithAgent && <span className="text-destructive"> *</span>}
          </FormLabel>
          <Controller
            control={control}
            name="paidBy"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                disabled={!isWorkingWithAgent}
                className="mt-2 flex items-center gap-6"
              >
                <Label
                  htmlFor="paidBy-buyer"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <RadioGroupItem value="buyer" id="paidBy-buyer" />
                  Buyer
                </Label>
                <Label
                  htmlFor="paidBy-seller"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <RadioGroupItem value="seller" id="paidBy-seller" />
                  Seller
                </Label>
              </RadioGroup>
            )}
          />
          {errors.paidBy ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.paidBy.message}
            </p>
          ) : null}
        </div>
      </div>
    </FormSectionCard>
  );
}

export const RealEstateAgentSection = memo(RealEstateAgentSectionImpl);
