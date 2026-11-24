"use client";
import {
  useAcceptOfferMutation,
  useGetSingleOfferQuery,
  useRejectOfferMutation,
} from "@/redux/api/offerApi";
import { useSearchParams } from "next/navigation";
import Empty from "@/components/ui/empty-data";
import { useState } from "react";
import { AppDialog } from "@/components/shared/dialog/AppDialog";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import OffersDetailsPageSkeleton from "@/components/skeleton/OffersDetailsPageSkeleton";
import {
  formatDate,
  getRoundTitle,
  mapTermsToConsolidatedOfferData,
} from "@/app/(seller)/user/offers-received/[offer-id]/_components/offers-received/utils.offer-received";
import { OffersSent } from "./OffersSent";
import { AgreementReachedDialog } from "./AgreementReachedDialog";

export default function ReviewSentOfferContainer() {
  const offerId = useSearchParams().get("offer");
  const router = useRouter();
  const [rejectOffer] = useRejectOfferMutation();
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openAcceptModal, setOpenAcceptModal] = useState(false);
  // NEW FLOW: "You've Reached an Agreement" pop-up after the buyer accepts.
  const [openAgreementReached, setOpenAgreementReached] = useState(false);
  const [acceptOffer] = useAcceptOfferMutation();

  const { data, isLoading } = useGetSingleOfferQuery(offerId, {
    skip: !offerId,
  });

  const offer = data?.data;

  if (isLoading) {
    return <OffersDetailsPageSkeleton />;
  }

  if (!offer) return <Empty message="Offer not found" className="mt-16" />;

  const {
    seller,
    property,
    history,
    currentTerms,
    currentRound,
    lastActionBy,
    supportingDocuments,
    isBuyerAddedAuthorizedSigner,
  } = offer;

  const propertyLabel = `${property.propertyType} — ${property.streetAddress},  ${property.city}, ${property.state}, ${property.zipCode}, ${property.county}`;
  const propertyAddress = `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipCode}`;
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
      // router.push(`/sign-agreement-contact?offerId=${offerId}&actionBy=buyer`);

      // NEW FLOW: congratulate the buyer on screen. The backend also puts the
      // same message in the buyer's notifications and asks the seller for
      // the contract details.
      setOpenAcceptModal(false);
      setOpenAgreementReached(true);
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
      router.push("/my-offer");
    } catch (error) {
      setOpenRejectModal(false);
      const errorMessage = errorModification(error);
      toast.error(errorMessage, { id: "reject" });
    }
  };

  return (
    <>
      <OffersSent
        offerId={offerId as string}
        property={property}
        seller={seller}
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
        isBuyerAddedAuthorizedSigner={isBuyerAddedAuthorizedSigner}
        onAcceptOffer={() => setOpenAcceptModal(true)}
        onReject={() => setOpenRejectModal(true)}
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
      <AgreementReachedDialog
        open={openAgreementReached}
        onOpenChange={setOpenAgreementReached}
        propertyAddress={propertyAddress}
      />
    </>
  );
}
