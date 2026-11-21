"use client";
import { IOpenHouse, IOpenHouseRsvp } from "@/types";
import { IApiResponse } from "@/types/api-response";
import { useGetPropertyRsvpsQuery } from "@/redux/api/propertiesApi";
import { selectUser } from "@/redux/features/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { formatDateUS, formatTimeUS } from "@/utils/formatDateUS";
import RSVPHereButton from "./RSVPHereButton";

interface OpenHouseProps {
  openHouse: IOpenHouse;
  id: string;
  sellerId: string;
}

function RsvpNames({ propertyId }: { propertyId: string }) {
  const { data, isLoading, isError } = useGetPropertyRsvpsQuery(propertyId);
  const rsvps = (data as IApiResponse<IOpenHouseRsvp[]> | undefined)?.data ?? [];

  return (
    <div className="mt-2 rounded-xl bg-white/10 p-3">
      <p className="mb-2 text-sm font-semibold text-white">
        Requests ({rsvps.length})
      </p>
      {/* {isLoading ? (
        <p className="text-sm text-gray-300">Loading requests...</p>
      ) : isError ? (
        <p className="text-sm text-gray-300">Requests could not be loaded.</p>
      ) : rsvps.length === 0 ? (
        <p className="text-sm text-gray-300">No requests yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {rsvps.map((rsvp) => (
            <li key={rsvp._id} className="text-sm text-white">
              {rsvp.buyer?.name || "Buyer"}
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}

export function OpenHouse({ openHouse, id, sellerId }: OpenHouseProps) {
  const userId = useAppSelector(selectUser)?.userId as string | undefined;
  const isSeller = Boolean(userId && userId === sellerId);
  return (
    <div className="bg-white lg:p-6 p-4 shadow-[0_20px_50px_0_rgba(15,23,42,0.10)] rounded-md border border-[#FAEEEA] ">
      <h2 className="text-2xl font-semibold text-primary-black mb-4">
        Open House
      </h2>
      <div className="rounded-2xl bg-[linear-gradient(180deg,#104284_0%,#11253F_100%)] lg:p-6 p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex gap-4 items-center justify-between">
          <span className="text-gray-300">Date</span>
          <span className="  text-white">
            {formatDateUS(openHouse?.date)}
          </span>
        </div>

        <div className="mb-6 flex gap-4 items-center justify-between">
          <span className="text-gray-300">Time</span>
          <span className="t text-white">
            {" "}
            {formatTimeUS(openHouse?.startTime)} -{" "}
            {formatTimeUS(openHouse?.endTime)}
          </span>
        </div>

        {isSeller ? (
          <RsvpNames propertyId={id} />
        ) : (
          <RSVPHereButton id={id} sellerId={sellerId} />
        )}
      </div>
    </div>
  );
}
