"use client";
import {
  useAcceptOfferMutation,
  useGetSingleOfferQuery,
  useRejectOfferMutation,
} from "@/redux/api/offerApi";
import { OffersReceived } from "./offers-received";
import { useParams, useSearchParams } from "next/navigation";
import {
  formatDate,
  getRoundTitle,
  mapTermsToConsolidatedOfferData,
} from "./offers-received/utils.offer-received";
import Empty from "@/components/ui/empty-data";
import { useState } from "react";
import { AppDialog } from "@/components/shared/dialog/AppDialog";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import OffersDetailsPageSkeleton from "@/components/skeleton/OffersDetailsPageSkeleton";
import { MarkUnderContractDialog } from "@/app/(seller)/user/my-listings/[property-id]/_components/MarkUnderContractDialog";
import { revalidateProperties } from "@/lib/actions/revalidate";

export default function OfferReceivedContainer() {
  const params = useParams();
  const offerId = params["offer-id"] as string;
  const router = useRouter();
  const [rejectOffer] = useRejectOfferMutation();
  const [acceptOffer] = useAcceptOfferMutation();
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openAcceptModal, setOpenAcceptModal] = useState(false);

  // NEW FLOW: contract-details pop-up. It opens after the seller accepts, from
  // the "Submit Contract Details" button, or automatically when the seller
  // arrives from the "buyer accepted your offer" notification (?contractDetails=1).
  const [openContractModal, setOpenContractModal] = useState(false);
  const [contractAutoOpenDismissed, setContractAutoOpenDismissed] =
    useState(false);
  const cameFromNotification =
    useSearchParams().get("contractDetails") === "1";

  const { data, isLoading } = useGetSingleOfferQuery(offerId, {
    skip: !offerId,
  });

  const offer = data?.data;

  // Opening by hand doesn't wait for the status: right after accepting, the
  // offer is still being refetched and may not read "accepted" yet.
  const isContractModalOpen =
    !offer?.isContractDetailsSubmitted &&
    (openContractModal ||
      (cameFromNotification &&
        offer?.status === "accepted" &&
        !contractAutoOpenDismissed));

  const handleContractModalChange = (open: boolean) => {
    setOpenContractModal(open);
    if (!open) setContractAutoOpenDismissed(true);
  };

  if (isLoading) {
    return <OffersDetailsPageSkeleton />;
  }

  if (!offer) return <Empty message="Offer not found" className="mt-16" />;

  const {
    buyer,
    property,
    history,
    currentTerms,
    currentRound,
    lastActionBy,
    supportingDocuments,
  } = offer;

  const buyerName = buyer?.name;
  const propertyLabel = `${property.propertyType} — ${property.streetAddress},  ${property.city}, ${property.state}, ${property.zipCode}, ${property.county}`;
  const offersSubmittedCount = history.length;

  // The most recent round always mirrors currentTerms
  const currentSnapshot = {
    amount: currentTerms.offerAmount,
    closingDate: formatDate(currentTerms.closingDate),
  };

  // Only show a comparison ("previous vs current") once a second round exists
  const previousRound =
    history.length > 1 ? history[history.length - 2] : undefined;
  const previousSnapshot = previousRound
    ? {
        amount: previousRound.offerAmount,
        closingDate: formatDate(previousRound.closingDate),
      }
    : undefined;

  // Single-round case: show just the one card, labeled by who made it.
  // Multi-round case: left card = previous round, right (highlighted) card = current round.
  const yourOffer = previousSnapshot ?? currentSnapshot;
  const counterOffer = previousSnapshot
    ? { ...currentSnapshot, badgeNumber: currentRound }
    : undefined;

  const yourOfferTitle = getRoundTitle(previousRound?.madeBy);
  const counterOfferTitle = getRoundTitle(lastActionBy);

  const consolidatedOfferData = mapTermsToConsolidatedOfferData(
    currentTerms,
    supportingDocuments,
  );

  const handleAcceptOffer = async () => {
    toast.loading("Accepting offer...", { id: "accept" });
    try {
      await acceptOffer(offerId).unwrap();
      toast.success("Offer accepted successfully!", { id: "accept" });
      // OLD FLOW (contracts / e-signing) — disabled for now on attorney advice.
      // router.push(`/sign-agreement-contact?offerId=${offerId}&actionBy=seller`);

      // NEW FLOW: show the seller the contract-details pop-up. The backend
      // sends the buyer the "You've Reached an Agreement" notification.
      setOpenAcceptModal(false);
      setOpenContractModal(true);
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage, { id: "accept" });
    }
  };

  const handleRejectOffer = async () => {
    setOpenRejectModal(false);
    toast.loading("Rejecting offer...", { id: "reject" });
    try {
      await rejectOffer(offerId).unwrap();
      toast.success("Offer rejected successfully!", { id: "reject" });
      router.push("/user/offers-received");
    } catch (error) {
      setOpenRejectModal(false);
      const errorMessage = errorModification(error);
      toast.error(errorMessage, { id: "reject" });
    }
  };

  return (
    <>
      <OffersReceived
        offerId={offerId}
        property={property}
        buyerName={buyerName}
        buyerId={buyer?._id}
        propertyId={property?._id}
        propertyLabel={propertyLabel}
        offersSubmittedCount={offersSubmittedCount}
        yourOffer={yourOffer}
        counterOffer={counterOffer}
        yourOfferTitle={yourOfferTitle}
        counterOfferTitle={counterOfferTitle}
        offer={consolidatedOfferData}
        lastActionBy={lastActionBy}
        status={offer.status}
        isSellerAddedAuthorizedSigner={offer?.isSellerAddedAuthorizedSigner}
        isContractDetailsSubmitted={offer?.isContractDetailsSubmitted}
        onSubmitContractDetails={() => setOpenContractModal(true)}
        onAcceptOffer={() => setOpenAcceptModal(true)}
        onReject={() => setOpenRejectModal(true)}
      />
      <MarkUnderContractDialog
        propertyId={property?._id}
        offerId={offerId}
        currentStatus={property?.status}
        open={isContractModalOpen}
        onOpenChange={handleContractModalChange}
        onUpdated={() => revalidateProperties(property?._id)}
      />
      <AppDialog
        open={openRejectModal}
        onOpenChange={setOpenRejectModal}
        title="Reject offer"
        description="Are you sure you want to reject this offer?"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenRejectModal(false),
          },
          {
            label: "Confirm",
            onClick: () => handleRejectOffer(),
          },
        ]}
      />
      <AppDialog
        open={openAcceptModal}
        onOpenChange={setOpenAcceptModal}
        title="Accept offer"
        // OLD FLOW (contracts / e-signing) — disabled for now on attorney advice.
        // description="Are you sure you want to accept this offer and proceed to agreement?"
        description="Are you sure you want to accept this offer?"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenAcceptModal(false),
          },
          {
            label: "Confirm",
            onClick: () => handleAcceptOffer(),
          },
        ]}
      />
    </>
  );
}
