import { tagTypes } from "@/redux/tagTypes";
import { apiGet } from "@/lib/api/fetcher";
import { IPropertyResponse } from "@/types";
import { IApiResponse } from "@/types/api-response";
import Empty from "@/components/ui/empty-data";
import { PropertiesSortBar } from "./PropertiesSortBar";
import { PropertyCard } from "@/components/shared/card/property-card";
import PaginationSection from "@/components/shared/pagination/PaginationSection";

export type SearchParams = {
  [key: string]: string | string[] | number | undefined;
};

export default async function ListedProperties({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const result = await apiGet<IApiResponse<IPropertyResponse[]>>(
    "/properties/web-content",
    {
      params: { ...searchParams, limit: 9 },
      tags: [tagTypes.property],
    },
  );

  const properties = result?.data || [];
  const metaData = result?.meta;

  return (
    <div>
      {!metaData?.total && (
        <Empty message="No properties found" className="mt-16" />
      )}
      {metaData?.total ? (
        <>
          <PropertiesSortBar total={metaData?.total} />
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3  gap-4">
            {properties?.map((property) => (
              <PropertyCard key={property._id} {...property} className="xl:h-56" />
            ))}
          </div>
          <PaginationSection
            total={result?.meta?.total as number}
            current={searchParams?.page ? Number(searchParams?.page) : 1}
            pageSize={9}
          />
        </>
      ) : null}
    </div>
  );
}
