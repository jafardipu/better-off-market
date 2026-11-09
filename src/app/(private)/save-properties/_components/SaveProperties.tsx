import { SavePropertyCard } from "@/components/shared/card/save-property-card";
import PaginationSection from "@/components/shared/pagination/PaginationSection";
import { IMetaData, ISavePropertiesResponse } from "@/types";
import { cn } from "@/lib/utils";

export default function SaveProperties({
  data,
  metaData,
  page,
  limit,
  isFetching = false,
}: {
  data: ISavePropertiesResponse[];
  metaData?: IMetaData;
  page: number;
  limit: number;
  isFetching?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-6 gap-4",
          isFetching && "opacity-60",
        )}
      >
        {data?.map((property) => (
          <SavePropertyCard
            key={property?._id ?? property?.property?._id}
            {...property?.property}
            saveDate={property?.createdAt}
          />
        ))}
      </div>

      {metaData?.total ? (
        <PaginationSection
          total={metaData.total}
          current={page}
          pageSize={limit}
        />
      ) : null}
    </div>
  );
}
