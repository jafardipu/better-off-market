"use client";
import { IOffer, IUser } from "@/types";
import { MapPin } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "../image/ImageWithFallback";
import { getOfferStatusBadge } from "@/components/utils/getOfferStatusBadge";
import { Button } from "@/components/ui/button";
import { priceFormatter } from "../utils/priceFormatter";

export interface PropertyCardProps {
  id: string;
  image: string;
  agent: string;
  property: string;
  location: string;
  status: "PENDING" | "SOLD" | "REJECTED";
  price: number;
  originalPrice?: number;
  actionType: "review" | "message" | "details";
  navLink: string;
}

// const getButtonStyle = (status: string, actionType: string) => {
//   if (status === "PENDING" && actionType === "review") {
//     return "bg-primary-color text-white hover:bg-slate-800";
//   }
//   return "bg-white text-[#594139] border border-primary-border-color hover:bg-slate-50";
// };

// const getButtonText = (actionType: string) => {
//   switch (actionType) {
//     case "review":
//       return "Review Offer";
//     case "message":
//       return "Message";
//     case "details":
//       return "Details";
//     default:
//       return "Action";
//   }
// };

export default function OfferedCard({ data }: { data: IOffer }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-primary-border-color rounded-lg bg-white hover:shadow-md transition-shadow">
      {/* Property Image */}
      <div className="shrink-0 w-full sm:w-36 md:h-20 h-40">
        <Link href={`/user/my-listings/${data?.property?._id}`}>
          <ImageWithFallback
            width={1200}
            height={1200}
            src={data?.property?.photos[0]}
            alt={"property_image"}
            className="w-full h-full object-cover rounded-lg"
          />
        </Link>
      </div>

      {/* Property Information */}
      <div className="grow min-w-0">
        <Link
          href={`/user/my-listings/${data?.property?._id}`}
          className="text-sm font-semibold text-primary-black"
        >
          {(data?.buyer as IUser)?.name} on {data?.property?.propertyType}
        </Link>

        <Link
          href={`/user/my-listings/${data?.property?._id}`}
          className="flex items-center gap-1 mt-1 mb-3 text-primary-gray text-xs font-semibold"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm line-clamp-1 ">
            {data?.property?.streetAddress}, {data?.property?.city},{" "}
            {data?.property?.state} {data?.property?.zipCode}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span>{getOfferStatusBadge(data?.status)}</span>
          <span className="text-sm font-bold text-primary-color">
            {priceFormatter.format(data?.currentTerms?.offerAmount)}
          </span>

          <span className="text-xs text-primary-gray font-semibold">
            vs {priceFormatter.format(data?.property?.listingPrice)} listed
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center shrink-0 w-full sm:w-auto">
        <Link href={`/user/offers-received/${data?._id}`}>
          <Button
            className={`w-full sm:w-auto px-6 rounded-lg font-semibold text-sm transition-colors cursor-pointer py-4.5 bg-primary-color text-white hover:bg-slate-800`}
          >
            Review Offer
          </Button>
        </Link>
      </div>
    </div>
  );
}
