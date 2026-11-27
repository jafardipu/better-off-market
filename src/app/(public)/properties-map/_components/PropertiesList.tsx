"use client";

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import { PropertyCard } from "@/components/shared/card/property-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IPropertyResponse } from "@/types";
import Container from "@/components/shared/container/Container";
import Empty from "@/components/ui/empty-data";

export default function PropertiesList({
  properties,
  id,
}: {
  id: string;
  properties: IPropertyResponse[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrolledRef = useRef<string | null>(null);

  // Track viewport: "medium and small" = below the md breakpoint (768px)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Auto-open the sheet only on medium/small screens whenever a selected id comes in via props
  useEffect(() => {
    if (id && isMobile) {
      setSheetOpen(true);
    }
  }, [id, isMobile]);

  // Scroll the selected property into view once it's rendered (desktop and inside the sheet)
  useEffect(() => {
    if (!id || scrolledRef.current === id) return;
    const timeout = setTimeout(() => {
      document
        .getElementById(`property-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      scrolledRef.current = id;
    }, 300);
    return () => clearTimeout(timeout);
  }, [id, sheetOpen]);

  if (properties?.length === 0)
    return (
      <Container>
        <h1 className="text-2xl font-semibold mb-3">
          Off-Market Opportunities
        </h1>
        <Empty message="No properties found" className="mt-20" />
      </Container>
    );

  const PropertyGrid = ({
    prioritizeSelected = false,
  }: {
    prioritizeSelected?: boolean;
  }) => {
    const list =
      prioritizeSelected && id
        ? [...properties]
            .sort((a, b) => {
              const aSelected = Number(a._id) === Number(id);
              const bSelected = Number(b._id) === Number(id);
              if (aSelected && !bSelected) return -1;
              if (bSelected && !aSelected) return 1;
              return 0;
            })
            .slice(0, 9)
        : properties.slice(0, 9);

    return (
      <div className="grid grid-cols-1">
        {list.map((property) => (
          <div
            key={property._id}
            // className={
            //   property._id === id
            //     ? "rounded-md scale-105 duration-300 transform transition-transform mt-4"
            //     : ""
            // }
            id={`property-${property._id}`}
          >
            <PropertyCard {...property} active={property._id === id} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile / tablet: list icon opens a Sheet with the same content */}
      <div className="lg:hidden px-4 py-2">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open properties list"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[#E0E3E5] bg-white"
                  >
                    <List size={18} color="#565E74" />
                  </button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Properties List</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SheetContent
            side="left"
            className="w-full overflow-y-auto p-0 sm:max-w-md"
          >
            <SheetHeader className="px-4 pt-4">
              <SheetTitle className="text-lg font-semibold">
                Off-Market Opportunities
              </SheetTitle>
            </SheetHeader>
            <div className="max-h-[calc(100vh-96px)] overflow-y-auto scroll-width-sm px-4 pb-6">
              <PropertyGrid prioritizeSelected />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden max-w-95.75 max-h-[calc(100vh-145px)] overflow-y-auto scroll-width-sm px-4 lg:block">
        <h1 className="text-2xl font-semibold mb-3">
          Off-Market Opportunities
        </h1>
        <PropertyGrid />
      </div>
    </>
  );
}
