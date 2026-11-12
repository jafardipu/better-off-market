"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldTooltip } from "@/app/(seller)/user/my-listings/property-listing/_components/form-fields/FieldTooltip";
import { Label } from "@/components/ui/label";

export const COUNTY_DATA = {
  OHIO: [
    "Adams",
    "Butler",
    "Clermont",
    "Clinton",
    "Hamilton",
    "Highland",
    "Montgomery",
    "Preble",
    "Warren",
    "Brown"
  ],
  KENTUCKY: [
    "Boone",
    "Bracken",
    "Campbell",
    "Carroll",
    "Gallatin",
    "Kenton",
    "Pendleton",
    "Grant"
  ],
};

export type CountyType = keyof typeof COUNTY_DATA; // "OHIO" | "KENTUCKY"

export interface SelectedCounty {
  county: string;
  countyType: CountyType;
}

interface CountySelectorForListingProps {
  error?: string;
  selectedCounty: string | null | undefined;
  onCountyChange: (county: SelectedCounty | null) => void;
  className?: string;
}

export function CountySelectorForListing({
  error,
  selectedCounty,
  onCountyChange,
  className,
}: CountySelectorForListingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCounty = (county: string, countyType: CountyType) => {
    onCountyChange({ county, countyType });
    setIsOpen(false);
  };

  const removeCounty = () => {
    onCountyChange(null);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-primary-black">
        County
        <span className="text-red-500">*</span>
        <FieldTooltip text="If the County is not on the dropdown list, then this property is unfortunately outside our current scope, and you will not be able to add this listing. Please contact support with any questions." />
      </Label>
      {/* Selected County Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-2 rounded-full bg-white text-gray-700 border border-gray-300 flex items-center justify-between hover:border-gray-400 transition-colors ",
          `w-full bg-[#F2F4F6]  rounded-md ${error ? "border-red-400" : "border-[#E2E8F0]"}`,
          className,
        )}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {!selectedCounty ? (
            <span
              className={cn("text-gray-400 text-sm lg:text-base line-clamp-1 ")}
            >
              Select county...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-[#E0EEFF] border border-[#00214C29] px-3  rounded-full text-sm">
              {selectedCounty}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCounty();
                }}
                className="text-[#BA1A1A] hover:text-[#ff0909] cursor-pointer"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          color="#6B7280"
          className={cn("transition-transform", isOpen ? "rotate-180" : "")}
        />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {/* States and Counties */}
          <div className="flex justify-between flex-wrap gap-2 mb-3 max-h-80 overflow-y-auto px-5 pt-5 pb-5">
            {(Object.entries(COUNTY_DATA) as [CountyType, string[]][]).map(
              ([state, counties]) => (
                <div key={state}>
                  <h3 className="font-semibold text-primary-gray mb-3 text-sm uppercase tracking-wide">
                    {state}
                  </h3>
                  <div className="space-y-1">
                    {counties.map((county) => {
                      const isSelected = selectedCounty === county;
                      return (
                        <button
                          type="button"
                          key={county}
                          onClick={() => selectCounty(county, state)}
                          className={cn(
                            "w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-md text-sm text-left cursor-pointer transition-colors",
                            isSelected
                              ? "bg-[#E0EEFF] text-primary-black font-medium"
                              : "text-primary-black hover:bg-gray-50",
                          )}
                        >
                          <span>{county}</span>
                          {isSelected && (
                            <Check size={16} className="text-primary-color" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}