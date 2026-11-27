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
  getOfferRounds,
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
  // Offer round shown in the details; null follows the latest round.
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
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
    lastActionBy,
    supportingDocuments,
    isBuyerAddedAuthorizedSigner,
  } = offer;

  const propertyLabel = `${property.propertyType} — ${property.streetAddress},  ${property.city}, ${property.state}, ${property.zipCode}, ${property.county}`;
  const propertyAddress = `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipCode}`;
  const offersSubmittedCount = history.length;

  const rounds = getOfferRounds(history, currentTerms, lastActionBy);
  const latestIndex = rounds.length - 1;
  const selectedIndex = Math.min(selectedRound ?? latestIndex, latestIndex);
  const selectedOfferData = mapTermsToConsolidatedOfferData(
    rounds[selectedIndex].terms,
    supportingDocuments,
  );
  const previousOfferData =
    selectedIndex > 0
      ? mapTermsToConsolidatedOfferData(rounds[selectedIndex - 1].terms)
      : undefined;
  const handleSelectRound = (index: number) =>
    setSelectedRound(index === latestIndex ? null : index);

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
        rounds={rounds}
        selectedRoundIndex={selectedIndex}
        onSelectRound={handleSelectRound}
        offer={selectedOfferData}
        previousOffer={previousOfferData}
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
