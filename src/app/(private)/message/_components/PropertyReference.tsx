import { MapPin } from "lucide-react";
import type { MessagePropertyInfo } from "./types";

export default function PropertyReference({
  property,
}: {
  property: MessagePropertyInfo;
}) {
  return (
    <span className="flex items-center gap-2">
      {property.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={property.image}
          alt=""
          className="size-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <MapPin className="size-4 shrink-0 text-[#1F4E8B]" />
      )}
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#1F4E8B]">
          Listing
        </span>
        <span className="block text-sm text-primary-black">{property.address}</span>
      </span>
    </span>
  );
}
