"use client";

import ImageWithFallback from "@/components/shared/image/ImageWithFallback";
import { Skeleton } from "@/components/ui/skeleton";
import Empty from "@/components/ui/empty-data";
import { useGetMyRsvpsQuery } from "@/redux/api/propertiesApi";
import { selectUser } from "@/redux/features/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { IOpenHouseRsvp, IOpenHouseRsvpBuyer } from "@/types";
import { IApiResponse } from "@/types/api-response";
import { formatDateUS, formatTimeUS } from "@/utils/formatDateUS";
import { MapPin } from "lucide-react";
import Link from "next/link";

function RsvpCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center">
      <Skeleton className="size-16 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
    </div>
  );
}

function propertyAddress(rsvp: IOpenHouseRsvp) {
  const property = rsvp.property;
  return [property?.streetAddress, property?.city, [property?.state, property?.zipCode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

function personId(person?: IOpenHouseRsvpBuyer | string | null) {
  if (!person) return "";
  return typeof person === "string" ? person : person._id;
}

export default function RsvpList({
  mode,
}: {
  mode: "received" | "interested";
}) {
  const userId = useAppSelector(selectUser)?.userId as string | undefined;
  const { data, isLoading, isError } = useGetMyRsvpsQuery(
    mode === "interested" ? "buyer" : "seller",
  );
  const rsvps = (
    (data as IApiResponse<IOpenHouseRsvp[]> | undefined)?.data ?? []
  ).filter((rsvp) => {
    if (mode === "interested") {
      const buyerId = personId(rsvp.buyer);
      return !buyerId || buyerId === userId;
    }
    const sellerId = personId(rsvp.seller);
    return !sellerId || sellerId === userId;
  });
  const emptyMessage =
    mode === "interested"
      ? "You have not sent an open house request yet"
      : "No one has requested an open house for your listings yet";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <RsvpCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Empty message="RSVPs could not be loaded" className="mt-10" />;
  }

  if (!rsvps.length) {
    return <Empty message={emptyMessage} className="mt-10" />;
  }

  return (
    <div className="space-y-4">
      {rsvps.map((rsvp) => {
        const address = propertyAddress(rsvp);
        const photo = rsvp.property?.photos?.[0];
        const openHouse = rsvp.property?.openHouse;
        const otherPerson = mode === "interested" ? rsvp.seller : rsvp.buyer;
        const messageParams = new URLSearchParams({
          user: otherPerson?._id ?? "",
          ...(rsvp.property?._id ? { property: rsvp.property._id } : {}),
          ...(address ? { address } : {}),
          ...(photo ? { image: photo } : {}),
        });

        const propertyHref = rsvp.property?._id
          ? `/properties-list/${rsvp.property._id}`
          : "";
        const profileHref = otherPerson?._id
          ? `/seller-profile?seller=${otherPerson._id}`
          : "";
        const personName =
          otherPerson?.name || (mode === "interested" ? "Seller" : "Buyer");

        return (
          <article
            key={rsvp._id}
            className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center"
          >
            {propertyHref ? (
              <Link href={propertyHref} className="shrink-0">
                {photo ? (
                  <ImageWithFallback
                    src={photo}
                    alt={address || "Listing"}
                    width={64}
                    height={64}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-lg bg-[#F4F7FB] text-[#1F4E8B]">
                    <MapPin className="size-5" />
                  </div>
                )}
              </Link>
            ) : null}
            <div className="min-w-0 flex-1">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="flex w-fit max-w-full items-center gap-2"
                >
                  <ImageWithFallback
                    src={otherPerson?.profile || "/default_user_profile.png"}
                    alt={personName}
                    width={40}
                    height={40}
                    fallbackSrc="/default_user_profile.png"
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="truncate font-semibold text-primary-black">
                    {personName}
                  </span>
                </Link>
              ) : (
                <p className="font-semibold text-primary-black">{personName}</p>
              )}
              {propertyHref ? (
                <Link
                  href={propertyHref}
                  className="mt-1 block text-sm text-primary-gray hover:text-primary-color"
                >
                  {address || "View listing"}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-primary-gray">
                  {address || "Listing"}
                </p>
              )}
              <p className="mt-1 text-sm text-[#594139]">
                {openHouse?.date ? formatDateUS(openHouse.date) : "Open house"}
                {openHouse?.startTime && openHouse?.endTime
                  ? ` · ${formatTimeUS(openHouse.startTime)} - ${formatTimeUS(openHouse.endTime)}`
                  : ""}
              </p>
              <p className="text-xs text-primary-gray">
                RSVP {formatDateUS(rsvp.createdAt)}
              </p>
            </div>
            {otherPerson?._id ? (
              <Link
                href={`/message?${messageParams.toString()}`}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2D3133] px-4 py-2 text-sm font-semibold text-white"
              >
                Message
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
