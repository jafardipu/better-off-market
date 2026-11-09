"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaveProperties from "./SaveProperties";
import { useGetFavoritesQuery } from "@/redux/api/favoriteApi";
import Empty from "@/components/ui/empty-data";
import PropertyCardSkeleton from "@/components/skeleton/PropertyCardSkeleton";
import { TPropertyStatus } from "@/types";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";

const TABS = ["all", "active", "under-contract", "sold"] as const;
type TabValue = (typeof TABS)[number];

const TAB_STATUS: Record<Exclude<TabValue, "all">, TPropertyStatus> = {
  active: "Active",
  "under-contract": "Under Contract",
  sold: "Sold",
};

const TAB_LABELS: Record<TabValue, string> = {
  all: "All",
  active: "Active",
  "under-contract": "Under Contract",
  sold: "Sold",
};

function getStatusQuery(tab: TabValue) {
  if (tab === "all") return undefined;
  return TAB_STATUS[tab];
}

export default function SavePropertyContainer() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "9";

  const queries: Record<string, string | number> = {
    page,
    limit,
  };

  const status = getStatusQuery(activeTab);
  if (status) queries.status = status;

  const { data: saveProperties, isLoading, isFetching } =
    useGetFavoritesQuery(queries);

  // Support both `{ data: [], meta }` and `{ data: { data: [], meta } }` shapes.
  const favorites = Array.isArray(saveProperties?.data)
    ? saveProperties.data
    : (saveProperties?.data?.data ?? []);
  const meta = Array.isArray(saveProperties?.data)
    ? saveProperties?.meta
    : (saveProperties?.data?.meta ?? saveProperties?.meta);
  const statusCounts = Array.isArray(saveProperties?.data)
    ? saveProperties?.statusCounts
    : (saveProperties?.data?.statusCounts ?? saveProperties?.statusCounts);

  const handleTabChange = (val: string) => {
    setActiveTab(val as TabValue);
    updateParams({ page: "1" });
  };

  if (isLoading)
    return (
      <div className="space-y-5">
        <div className="w-full h-10 bg-gray-200 animate-pulse p-2 rounded-md flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-20 h-full rounded-md bg-gray-300 animate-pulse"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-6 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full mt-5"
    >
      <TabsList className="bg-transparent">
        {TABS.map((tab) => {
          const count =
            tab === "all"
              ? statusCounts?.all
              : tab === "active"
                ? statusCounts?.active
                : tab === "under-contract"
                  ? statusCounts?.under_contract ??
                    statusCounts?.underContract
                  : statusCounts?.sold;

          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-active:bg-primary-color data-active:text-white cursor-pointer px-4 py-2.5 mr-1 capitalize"
            >
              {TAB_LABELS[tab]}
              {typeof count === "number" ? (
                <span className="ml-1 opacity-70">({count})</span>
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="flex-between border-b border-primary-border-color mb-5" />

      {TABS.map((tab) => (
        <TabsContent key={tab} value={tab} className="w-full">
          {!favorites?.length ? (
            <Empty
              message={
                tab === "all"
                  ? "You have no saved properties"
                  : `No ${TAB_LABELS[tab].toLowerCase()} saved properties`
              }
              className="min-h-[40vh] flex justify-center items-center"
            />
          ) : (
            <SaveProperties
              data={favorites}
              metaData={meta}
              page={Number(page)}
              limit={Number(limit)}
              isFetching={isFetching}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
