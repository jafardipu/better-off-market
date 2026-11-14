"use client";
import DashboardPropertyCard from "@/components/shared/card/dashboard-property-card";
import { PropertyListingCardSkeleton } from "@/components/skeleton/PropertyListingCardSkeleton";
import Empty from "@/components/ui/empty-data";
import { useGetMyListingsQuery } from "@/redux/api/propertiesApi";
import { IMetaData, IPropertyResponse } from "@/types";

export default function RecentProperties() {
  const { data, isLoading } = useGetMyListingsQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-5  lg:p-6 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <PropertyListingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const properties: IPropertyResponse[] = data?.data?.properties;
  const metaData: IMetaData = data?.meta;

  if (!metaData?.total) {
    return <Empty message="No properties found" className="mt-5" />;
  }

  return (
    <div className="space-y-4 lg:p-6 p-4">
      {properties?.map((property) => (
        <DashboardPropertyCard
          key={property?._id}
          id={property?._id}
          status={property?.status}
          image={property?.photos?.[0]}
          type={property?.propertyType}
          location={`${property?.streetAddress}, ${property?.city}, ${property?.state} ${property?.zipCode} `}
          price={property?.listingPrice}
          views={property?.totalViews}
          saved={property?.totalSaved}
          offers={property?.totalOffers}
          rsvp={property?.totalRsvp}
          openHouse={property?.openHouse}
        />
      ))}
    </div>
  );
}
