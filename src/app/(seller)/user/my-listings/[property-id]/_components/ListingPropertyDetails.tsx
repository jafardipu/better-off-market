"use client";
import { BasicPropertyDetails } from "@/app/(public)/properties-list/[property-id]/_components/BasicPropertyDetails";
import { Documents } from "@/app/(public)/properties-list/[property-id]/_components/Documents";
import { LocationMap } from "@/app/(public)/properties-list/[property-id]/_components/LocationMap";
import PropertyImages from "@/app/(public)/properties-list/[property-id]/_components/PropertyImages";
import { PropertyInfo } from "@/app/(public)/properties-list/[property-id]/_components/PropertyInfo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import AnimatedArrow from "@/components/utils/animation/AnimatedArrow";
import { revalidateProperties } from "@/lib/actions/revalidate";
import { errorModification } from "@/lib/errors/errorModification";
import { useUpdatePropertyMutation } from "@/redux/api/propertiesApi";
import { IPropertyResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MarkUnderContractDialog } from "./MarkUnderContractDialog";

const hiddenStatus = ["Sold", "Rejected"];

const statusButtonClass =
  "bg-[#0076AC] hover:bg-[#0076AC]/90 text-white font-semibold py-5.5 px-7 rounded-lg transition-colors cursor-pointer group";

export default function ListingPropertyDetails({
  property,
}: {
  property: IPropertyResponse;
}) {
  const [updateProperty] = useUpdatePropertyMutation();
  const router = useRouter();
  // Which status button is mid-request, so only that one shows the loader.
  const [pendingStatus, setPendingStatus] = useState<"Active" | "Sold" | null>(
    null,
  );
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [soldConfirmOpen, setSoldConfirmOpen] = useState(false);

  const isUnderContract = property?.status === "Under Contract";
  const showStatusActions = !hiddenStatus.includes(property?.status);

  const refreshListing = async () => {
    await revalidateProperties(property?._id);
    router.refresh();
  };

  // "Under Contract" goes through MarkUnderContractDialog instead, because
  // it also records the contract details.
  const updateStatus = async (status: "Active" | "Sold") => {
    setPendingStatus(status);
    try {
      await updateProperty({
        id: property?._id,
        formData: { status },
      }).unwrap();
      toast.success(`Property status updated to ${status}.`);
      await refreshListing();
    } catch (error) {
      toast.error(errorModification(error));
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <PropertyImages
        propertyImages={property?.photos}
        propertyType={property?.propertyType}
      />

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
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link
          href={`/user/my-listings/property-listing?property=${property?._id}`}
        >
          <Button className="bg-primary-color hover:bg-primary-color/90 text-white font-semibold py-5.5 px-7 rounded-lg transition-colors cursor-pointer">
            Edit Properties
          </Button>
        </Link>

        {showStatusActions && !isUnderContract && (
          <Button
            onClick={() => setContractDialogOpen(true)}
            className={statusButtonClass}
          >
            Mark Under Contract
            <AnimatedArrow size={20} />
          </Button>
        )}

        {showStatusActions && isUnderContract && (
          <>
            <Button
              onClick={() => updateStatus("Active")}
              disabled={pendingStatus !== null}
              className={statusButtonClass}
            >
              Mark as Active
              {pendingStatus === "Active" ? "..." : <AnimatedArrow size={20} />}
            </Button>
            <Button
              onClick={() => setSoldConfirmOpen(true)}
              disabled={pendingStatus !== null}
              className={statusButtonClass}
            >
              Mark as Sold
              {pendingStatus === "Sold" ? "..." : <AnimatedArrow size={20} />}
            </Button>
          </>
        )}
      </div>

      <MarkUnderContractDialog
        propertyId={property?._id}
        currentStatus={property?.status}
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        onUpdated={refreshListing}
      />

      {/* Sold hides every status button afterwards, so the seller can't undo
          it from here — confirm before sending. */}
      <AlertDialog open={soldConfirmOpen} onOpenChange={setSoldConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-primary-black">
              Mark this property as Sold?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary-gray">
              This closes the listing on BetterOffMarket. You won&apos;t be
              able to change its status again from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus("Sold")}
              className="bg-primary-color hover:bg-primary-color/90 text-white cursor-pointer"
            >
              Mark as Sold
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
