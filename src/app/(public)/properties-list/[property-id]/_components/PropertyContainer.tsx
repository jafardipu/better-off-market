import Container from "@/components/shared/container/Container";
import PropertyImages from "./PropertyImages";
import { ActionBtns } from "./ActionBtns";
import { PropertyInfo } from "./PropertyInfo";
import ProfileCard from "./ProfileCard";
import { Documents } from "./Documents";
import { LocationMap } from "./LocationMap";
import { OpenHouse } from "./OpenHouse";
import AuthenticationRequired from "./AuthenticationRequired";
import { IPropertyResponse } from "@/types";
import { BasicPropertyDetails } from "./BasicPropertyDetails";
import IncreaseViewsCount from "./IncreaseViewsCount";
import moment from "moment";

export default function PropertyContainer({
  property,
}: {
  property: IPropertyResponse;
}) {
  const openHouseDate = property?.openHouse?.date;
  const hasUpcomingOpenHouse =
    Boolean(openHouseDate) &&
    moment(openHouseDate).isValid() &&
    !moment(openHouseDate).isBefore(moment(), "day");

  return (
    <Container className="mt-12">
      <IncreaseViewsCount id={property?._id} seller={property?.seller} />
      <PropertyImages
        propertyImages={property?.photos}
        propertyType={property?.propertyType}
      />
      <div className="grid lg:grid-cols-6 gap-6 mt-4">
        <div className="lg:col-span-4 space-y-6">
          <BasicPropertyDetails property={property} />
          <PropertyInfo property={property} />
          {property?.documents?.length ? (
            <Documents documents={property?.documents} />
          ) : (
            ""
          )}
          <LocationMap
            lat={property?.location?.coordinates[1]}
            lng={property?.location?.coordinates[0]}
          />
          {/* <Link href={"/properties-list"}>
            <Button className="w-full mt-5 bg-primary-color hover:bg-primary-color/90 text-white font-semibold py-5 px-4 rounded-lg transition-colors cursor-pointer">
              Back listing
            </Button>
          </Link> */}
        </div>
        <div className="lg:col-span-2 md:flex flex-wrap lg:flex-col gap-4 space-y-4">
          <ActionBtns
            id={property?._id}
            seller={property?.seller}
            totalViews={property?.totalViews}
            createdAt={property?.createdAt}
            status={property?.status}
            approvedDate={property?.approvedDate}
          />
          <AuthenticationRequired />
          {hasUpcomingOpenHouse && property.openHouse && (
            <OpenHouse
              openHouse={property?.openHouse}
              id={property?._id}
              sellerId={property?.seller?._id}
            />
          )}
          {!hasUpcomingOpenHouse && (
            <div className="rounded-md border border-[#FAEEEA] bg-white p-4 shadow-[0_20px_50px_0_rgba(15,23,42,0.10)] lg:p-6">
              <h2 className="md:text-2xl text-xl font-semibold text-primary-black mb-4">
                Open House
              </h2>
              <p className="text-sm text-gray-600">
                No upcoming open house is scheduled for this property.
              </p>
            </div>
          )}

          <ProfileCard seller={property?.seller} />
        </div>
      </div>
    </Container>
  );
}
