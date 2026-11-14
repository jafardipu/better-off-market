"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const COUNTY_DATA = {
  OHIO: [
    "Adams",
    "Brown",
    "Butler",
    "Clermont",
    "Clinton",
    "Hamilton",
    "Highland",
    "Montgomery",
    "Preble",
    "Warren",
  ],
  KENTUCKY: [
    "Boone",
    "Bracken",
    "Campbell",
    "Carroll",
    "Gallatin",
    "Grant",
    "Kenton",
    "Pendleton",
  ],
};

interface CountySelectorProps {
  selectedCounties: string[];
  onCountiesChange: (counties: string[]) => void;
  className?: string;
}

export function CountySelector({
  selectedCounties,
  onCountiesChange,
  className,
}: CountySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCounties);
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

  const handleApply = () => {
    onCountiesChange(tempSelected);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const removeCounty = (county: string) => {
    const updated = selectedCounties.filter((c) => c !== county);
    onCountiesChange(updated);
    setTempSelected(updated);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected Counties Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-2.5 rounded-full bg-white text-gray-700 border border-gray-300 flex items-center justify-between hover:border-gray-400 transition-colors ",
          className,
        )}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {selectedCounties.length === 0 ? (
            <span className="text-gray-400 text-sm lg:text-base line-clamp-1">
              Select counties...
            </span>
          ) : (
            selectedCounties.map((county) => (
              <span
                key={county}
                className="inline-flex items-center gap-1 bg-[#E0EEFF] border border-[#00214C29] px-3 py-1 rounded-full text-sm"
              >
                {county}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCounty(county);
                  }}
                  className="text-[#BA1A1A] hover:text-[#ff0909] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </span>
            ))
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
          {/* All Counties Option */}
          <div className="mb-3 pb-1 p-5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  tempSelected.length ===
                  Object.values(COUNTY_DATA).flat().length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempSelected(Object.values(COUNTY_DATA).flat());
                  } else {
                    setTempSelected([]);
                  }
                }}
                className="w-4 h-4 rounded cursor-pointer accent-primary-color"
              />
              <span className="text-sm text-primary-black">Any County</span>
            </label>
          </div>

          {/* States and Counties */}
          <div className="flex justify-between flex-wrap gap-2 mb-3 max-h-80 overflow-y-auto  px-5">
            {Object.entries(COUNTY_DATA).map(([state, counties]) => (
              <div key={state}>
                <h3 className="font-semibold text-primary-gray mb-3 text-sm uppercase tracking-wide">
                  {state}
                </h3>
                <div className="space-y-2">
                  {counties.map((county) => (
                    <label
                      key={county}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelected.includes(county)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempSelected((prev) => [...prev, county]);
                          } else {
                            setTempSelected((prev) =>
                              prev.filter((c) => c !== county),
                            );
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer accent-primary-color"
                      />
                      <span className="text-primary-black text-sm">
                        {county}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center  border-t border-[#E0E3E5] bg-[#F2F4F6] p-3.5 ">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-primary-color hover:text-blue-800 font-medium text-sm cursor-pointer"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-1.5 bg-primary-color text-white rounded-md font-medium hover:bg-blue-900 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
