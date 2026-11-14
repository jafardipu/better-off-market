"use client";
import { Eye, Tag, Trash2, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Share from "@/components/utils/share";
import Link from "next/link";
import { UpdateListingPriceDialog } from "../dailogs/UpdateListingPriceDialog";
import { useState } from "react";
import { ScheduleOpenHouseDialog } from "../dailogs/ScheduleOpenHouseDialog";
import ImageWithFallback from "../image/ImageWithFallback";
import { cn, PROPERTY_STATUS } from "@/lib/utils";
import { IOpenHouse } from "@/types";
import { getStatus, statusColor } from "@/components/utils/status-color";
import { AppDialog } from "../dialog/AppDialog";
import { useDeletePropertyMutation } from "@/redux/api/propertiesApi";
import { toast } from "sonner";
import { errorModification } from "@/lib/errors/errorModification";
import { revalidateProperties } from "@/lib/actions/revalidate";
import { priceFormatter } from "../utils/priceFormatter";

interface PropertyCardProps {
  id: string;
  image: string;
  type: string;
  location: string;
  price: number;
  views: number;
  saved: number;
  offers: number;
  rsvp: number;
  status: "Pending" | "Active" | "Under Contract" | "Sold" | "Rejected";
  openHouse: IOpenHouse;
}

export default function DashboardPropertyCard({
  id,
  image,
  type,
  location,
  price,
  views,
  saved,
  offers,
  rsvp,
  status,
  openHouse,
}: PropertyCardProps) {
  const [open, setOpen] = useState(false);
  const [openHouseOpen, setOpenHouseOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteProperty, { isLoading }] = useDeletePropertyMutation();

  const handleDelete = async () => {
    try {
      toast.loading("Deleting property...", { id: "delete" });
      await deleteProperty(id);
      revalidateProperties();
      toast.success("Property deleted successfully!", { id: "delete" });
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:gap-6">
        {/* Image Section */}
        <Link href={`/user/my-listings/${id}`}>
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-60">
            <ImageWithFallback
              src={image}
              alt={"property image"}
              fill
              className="object-cover"
            />
            <div
              className={cn(
                "absolute left-3 top-3 rounded-full bg-[#DCFCE7] px-3 py-0.5 text-sm font-semibold text-[#166534]",
                statusColor[status],
              )}
            >
              {getStatus(status)}
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* Header with Type and Price */}
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              <div>
                <Link href={`/user/my-listings/${id}`}>
                  <h3 className="text-sm font-semibold text-primary-black">
                    {type}
                  </h3>
                </Link>
                <Link
                  href={`/user/my-listings/${id}`}
                  className="mt-1 flex items-center font-semibold gap-1 text-sm text-primary-gray"
                >
                  <span>
                    <MapPin size={16} />
                  </span>
                  <span className="line-clamp-1">{location}</span>
                </Link>
              </div>
              <span className="text-base text-primary-color">
                {priceFormatter.format(price)}
              </span>
            </div>

            {/* Stats Row */}
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Eye size={18} className="text-[#505F76]" />
                <span>{views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={18} className="text-[#505F76]" />
                <span>{saved} Saved</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag size={18} className="text-[#505F76]" />
                <span>{offers} offers</span>
              </div>
              <div className="flex items-center text-[#505F76] gap-1">
                <span>{rsvp} rsvp</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/user/my-listings/property-listing?property=${id}`}>
              <Button className="rounded-md cursor-pointer bg-[#1F4E8B] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1F4E8B] hover:opacity-90">
                Edit Listing
              </Button>
            </Link>

            <Button
              onClick={() => setOpenHouseOpen(true)}
              variant="outline"
              className="rounded-md cursor-pointer border border-primary-border-color px-6 py-2 text-sm font-semibold text-primary-black hover:bg-gray-100 duration-300 ease-in-out transition-transform"
            >
              Open House
            </Button>

            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              className="rounded-md cursor-pointer border border-primary-border-color px-6 py-2 text-sm font-semibold text-primary-black hover:bg-gray-100 duration-300 ease-in-out transition-transform"
            >
              Update Price
            </Button>

            {/* Right Icons */}
            <div className="ml-auto flex items-center gap-2">
              <Share
                title="Better Off Market listing"
                link={`/properties-list/${id}`}
                image={image}
                listingLabel={location || type}
              />
              {(status === PROPERTY_STATUS.active ||
                status === PROPERTY_STATUS.pending ||
                status === PROPERTY_STATUS.rejected) && (
                <button
                  disabled={isLoading}
                  onClick={() => setOpenDelete(true)}
                  className={"rounded p-2 hover:bg-gray-100 cursor-pointer"}
                >
                  <Trash2 size={20} className="text-primary-gray" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <UpdateListingPriceDialog
        open={open}
        onOpenChange={setOpen}
        currentPrice={price}
        id={id}
      />

      <ScheduleOpenHouseDialog
        open={openHouseOpen}
        onOpenChange={setOpenHouseOpen}
        id={id}
        openHouse={openHouse}
      />

      <AppDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Remove Listing?"
        description="Are you sure you want to remove this listing from the marketplace?"
        className="text-primary-black"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenDelete(false),
          },
          {
            label: "Delete",
            onClick: () => handleDelete(),
            className: "bg-[#881515] text-white",
          },
        ]}
      />
    </>
  );
}
