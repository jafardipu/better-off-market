"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingList from "./ListingList";
import { useState } from "react";
import { useGetMyListingsQuery } from "@/redux/api/propertiesApi";
import { PropertyListingCardSkeleton } from "@/components/skeleton/PropertyListingCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

type ListingTab =
  | "all"
  | "active"
  | "pending"
  | "rejected"
  | "sold"
  | "under-contact";

const handleStatusValue = (status: ListingTab) => {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "sold":
      return "Sold";
    case "under-contact":
      return "Under Contract";
    default:
      return "";
  }
};

export default function MyListingContainer() {
  const [activeTab, setActiveTab] = useState<ListingTab>("all");
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "10";
  const queries: Record<string, string | number> = {};

  if (activeTab == "all") {
    delete queries.status;
  } else {
    queries.status = handleStatusValue(activeTab);
  }

  queries.page = page;
  queries.limit = limit;

  const { data, isLoading } = useGetMyListingsQuery(queries);

  if (isLoading) {
    return (
      <div className="mt-5">
        <Skeleton className="h-9 w-27. rounded-lg mb-7" />
        <div className="space-y-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <PropertyListingCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const properties = data?.data?.properties;
  const statusCounts = data?.data?.statusCounts;
  const metaData = data?.meta;


  return (
    <div>
      <Tabs
        defaultValue="all"
        className="w-full mt-5"
        onValueChange={(value) => { setActiveTab(value as ListingTab) }}
      >
        <TabsList>
          <TabsTrigger
            value="all"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            All ({statusCounts?.all || 0})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            Active ({statusCounts?.active || 0})
          </TabsTrigger>

          <TabsTrigger
            value="pending"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            Pending approval ({statusCounts?.pending || 0})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            Rejected ({statusCounts?.rejected || 0})
          </TabsTrigger>

          <TabsTrigger
            value="under-contact"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            Under Contract ({statusCounts?.under_contact || 0})
          </TabsTrigger>

          <TabsTrigger
            value="sold"
            className="data-active:bg-transparent data-active:text-primary-color border-l-0 border-r-0 border-t-0 data-active:border-b-2  data-active:border-primary-color rounded-none cursor-pointer px-4 py-2.5 mr-1"
          >
            Sold ({statusCounts?.sold || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="w-full">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
        <TabsContent value="active">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
        <TabsContent value="pending">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
        <TabsContent value="rejected">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
        <TabsContent value="under-contact">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
        <TabsContent value="sold">
          <ListingList
            properties={properties}
            metaData={metaData}
            limit={Number(limit)}
            page={Number(page)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
