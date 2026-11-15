"use client";
import { IOpenHouse } from "@/types";
import moment from "moment";
import RSVPHereButton from "./RSVPHereButton";

interface OpenHouseProps {
  openHouse: IOpenHouse;
  id: string;
  sellerId: string;
}

export function OpenHouse({ openHouse, id, sellerId }: OpenHouseProps) {
  return (
    <div className="bg-white lg:p-6 p-4 shadow-[0_20px_50px_0_rgba(15,23,42,0.10)] rounded-md border border-[#FAEEEA] ">
      <h2 className="text-2xl font-semibold text-primary-black mb-4">
        Open House
      </h2>
      <div className="rounded-2xl bg-[linear-gradient(180deg,#104284_0%,#11253F_100%)] lg:p-6 p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex gap-4 items-center justify-between">
          <span className="text-gray-300">Date</span>
          <span className="  text-white">
            {moment(openHouse?.date).format("MM-DD-YYYY")}
          </span>
        </div>

        <div className="mb-6 flex gap-4 items-center justify-between">
          <span className="text-gray-300">Time</span>
          <span className="t text-white">
            {" "}
            {moment(openHouse?.startTime, "HH:mm").format("hh:mm A")} -{" "}
            {moment(openHouse?.endTime, "HH:mm").format("hh:mm A")}
          </span>
        </div>

       <RSVPHereButton id={id} sellerId={sellerId} />
      </div>
    </div>
  );
}
