import DashboardPropertyCard from "@/components/shared/card/dashboard-property-card";
import PaginationSection from "@/components/shared/pagination/PaginationSection";
import Empty from "@/components/ui/empty-data";
import { IMetaData, IPropertyResponse } from "@/types";

export default function ListingList({
  properties,
  metaData,
  page,
  limit,
}: {
  properties: IPropertyResponse[];
  metaData: IMetaData;
  page: number;
  limit: number;
}) {
  if (!properties?.length)
    return <Empty message="No properties found" className="mt-16" />;

  return (
    <div className="space-y-4 lg:py-5 py-4">
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
      <PaginationSection
        total={metaData?.total}
        current={page}
        pageSize={limit}
      />
    </div>
  );
}
