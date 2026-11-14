import { IPropertyResponse } from "@/types";
import FavoriteIcon from "../favorite_icon/FavoriteIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ImageWithFallback from "../image/ImageWithFallback";
import { handlePropertiesSpecifications } from "@/utils/handlePropertiesSpecifications";
import { priceFormatter } from "../utils/priceFormatter";
import moment from "moment";
import { statusColor } from "@/components/utils/status-color";

export function PropertyCard({
  _id,
  photos,
  oldListingPrice,
  listingPrice,
  arv,
  streetAddress,
  city,
  state,
  className,
  propertyType,
  specifications,
  status,
  zipCode,
  createdAt,
  propertiesSpecificationsClassName,
  active,
  approvedDate,
}: IPropertyResponse & {
  className?: string;
  propertiesSpecificationsClassName?: string;
  isPropertyStatusVisible?: boolean;
  active?: boolean;
}) {
  // Only keep entries whose value is truthy (drops undefined, null, 0, "", NaN)
  const propertySpecs = handlePropertiesSpecifications(
    propertyType,
    specifications,
  ).filter((spec) => Boolean(spec.value));

  return (
    <Link
      href={`/properties-list/${_id}`}
      className="w-full  rounded-lg overflow-hidden  shadow-sm hover:shadow-md transition-shadow bg-white group "
    >
      {/* Image Container */}
      <div
        className={cn(
          "relative xl:h-64 h-56 w-full overflow-hidden bg-gray-100 ",
          active && " border-t-2 border-x-2 border-primary-color rounded-t-lg",
          className,
        )}
      >
        <ImageWithFallback
          src={photos?.[0]}
          alt={"property_image"}
          width={1200}
          height={1200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex gap-1">
          <div className="bg-[#1F4E8B] text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            {moment(approvedDate || createdAt).fromNow()}
          </div>
          {oldListingPrice && (
            <div
              className={cn(
                " bg-[#147430] text-white px-2.5 py-1 rounded-full text-xs font-semibold",
              )}
            >
              ↓{" "}
              <span className="ml-0.5">
                {priceFormatter.format(
                  Number(oldListingPrice) - Number(listingPrice),
                )}
              </span>
            </div>
          )}
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3  text-white px-2.5 py-1 text-xs font-semibold rounded-full border border-[rgba(255,255,255,0.19)] bg-[rgba(0,0,0,0.45)]">
          {propertyType}
        </div>

        <div
          className={cn(
            "absolute bottom-3 right-3 px-2.5  py-0.5 rounded-full text-sm ",
            statusColor[status],
          )}
        >
          {status}
        </div>

        {/* Original Price Badge */}

        {/* Favorite Button */}
        <FavoriteIcon id={_id} />
      </div>

      {/* Content Container */}
      <div
        className={cn(
          "xl:p-6  p-4 space-y-1 ",
          active && " border-b-2 border-x-2 border-primary-color rounded-b-lg",
        )}
      >
        {/* Price */}
        <div className="space-y-1">
          <p className="xl:text-xl text-lg font-bold text-[#1F4E8B] flex items-center flex-wrap gap-x-2">
            <span> {priceFormatter.format(listingPrice)} </span>

            {oldListingPrice ? (
              <span className="text-lg text-primary-gray font-medium ml-2  line-through ">
                {priceFormatter.format(oldListingPrice)}
              </span>
            ) : null}

            {arv ? (
              <span className={cn("text-primary-gray  font-medium ")}>
                (ARV: {priceFormatter.format(arv)})
              </span>
            ) : null}
          </p>
        </div>

        {/* Address */}
        <h3 className="xl:text-lg font-semibold text-primary-black line-clamp-1">
          {streetAddress}, {city}, {state} {zipCode}
        </h3>

        {/* Property Details */}
        {propertySpecs.length > 0 && (
          <div className="flex justify-between items-center gap-4 text-gray-700 pt-1">
            {propertySpecs
              ?.slice(0, 3)
              ?.map(({ icon: Icon, value, suffix }, index) => (
                <div key={index} className="flex items-center gap-1 ">
                  {Icon && <Icon size={18} color="#594139" />}
                  <span
                    className={cn(
                      "text-[rgb(92,67,58)] text-sm font-semibold line-clamp-1",
                      propertiesSpecificationsClassName,
                    )}
                  >
                    {value} {suffix}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
