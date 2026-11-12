"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscriptionFormData, subscriptionFormSchema } from "./schemas";

import { Loader2, Check, AlertCircle } from "lucide-react";
import { CountySelector } from "@/components/shared/county_selector/CountySelector";
import { PropertyTypeSelector } from "@/components/shared/property_selector/PropertyTypeSelector";
import { useCreateGetInTouchMutation } from "@/redux/api/getInTouchApi";
import { toast } from "sonner";
import { errorModification } from "@/lib/errors/errorModification";

export default function SubscriptionForm() {
  const [createGetInTouch, { isLoading }] = useCreateGetInTouchMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema as any),
    defaultValues: {
      email: "",
      counties: [],
      propertyTypes: [],
    },
  });

  const counties = watch("counties");
  const propertyType = watch("propertyTypes") as string[] | undefined;

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      await createGetInTouch(data).unwrap();
      toast.success("Successfully subscribed!");
      reset();
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-125 ml-auto w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* County Selection */}
        <div className="grid md:grid-cols-2 gap-2">

          <div >
            <label className="block text-sm font-medium mb-2 text-blue-100  uppercase">
              County
            </label>
            <CountySelector
              selectedCounties={counties}
              onCountiesChange={(newCounties) =>
                setValue("counties", newCounties)
              }
            />
            {errors.counties && (
              <p className="text-red-300 text-sm mt-1">
                {errors.counties.message}
              </p>
            )}
          </div>

          {/* Property Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-blue-100 uppercase">
              Property Type
            </label>
            <PropertyTypeSelector
              selectedTypes={propertyType ? [...propertyType] : []}
              onTypesChange={(types) => setValue("propertyTypes", types)}
            />
            {errors.propertyTypes && (
              <p className="text-red-300 text-sm mt-1">
                {errors.propertyTypes.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-blue-100 uppercase">
            Email
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            {...register("email")}
            className="w-full  px-5 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
          {errors.email && (
            <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 px-8 py-2.5 rounded-full font-semibold text-black bg-white hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 size={20} className="animate-spin" /> Subscribing
            </span>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    </div>
  );
}
