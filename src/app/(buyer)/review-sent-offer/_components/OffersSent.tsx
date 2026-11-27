import {
  ConsolidatedOfferData,
  OfferComparisonRow,
  type OfferRound,
} from "@/app/(seller)/user/offers-received/[offer-id]/_components/offers-received";
import { OFFER_STATUS } from "@/app/(seller)/user/offers-received/[offer-id]/_components/offers-received/utils.offer-received";
import { OffersSentHeader } from "./OffersSentHeader";
import { ConsolidatedSentOfferCard } from "./ConsolidatedSentOfferCard";
import { IPropertyResponse, IUser } from "@/types";
import OfferPropertyCard from "@/components/shared/card/offer-property-card";
import { OffersSentActionBar } from "./OffersSentActionBar";

interface OffersReceivedProps {
  offerId: string;
  property: IPropertyResponse;
  seller: IUser;
  propertyId: string;
  propertyLabel: string;
  offersSubmittedCount: number;
  rounds: OfferRound[];
  selectedRoundIndex: number;
  onSelectRound: (index: number) => void;
  /** Terms of the selected round. */
  offer: ConsolidatedOfferData;
  /** Terms of the round before it, to show what changed. */
  previousOffer?: ConsolidatedOfferData;
  lastActionBy?: "buyer" | "seller";
  status: (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];
  isBuyerAddedAuthorizedSigner?: boolean;
  onAcceptOffer?: () => void;
  onReject?: () => void;
  isSubmitting?: boolean;
}

export function OffersSent({
  offerId,
  property,
  seller,
  propertyId,
  propertyLabel,
  offersSubmittedCount,
  rounds,
  selectedRoundIndex,
  onSelectRound,
  offer,
  previousOffer,
  lastActionBy,
  status,
  isBuyerAddedAuthorizedSigner,
  onAcceptOffer,
  onReject,
  isSubmitting,
}: OffersReceivedProps) {
  return (
    <div>
      <OfferPropertyCard property={property} className="mb-2" />
      <OffersSentHeader
        offerId={offerId}
        propertyId={propertyId}
        propertyLabel={propertyLabel}
        offersSubmittedCount={offersSubmittedCount}
      />

      <OfferComparisonRow
        rounds={rounds}
        selectedIndex={selectedRoundIndex}
        onSelect={onSelectRound}
        viewer="buyer"
      />

      <ConsolidatedSentOfferCard
        seller={seller}
        data={offer}
        previous={previousOffer}
      />

      <OffersSentActionBar
        sellerId={seller?._id}
        offerId={offerId}
        className="mt-6"
        onAcceptOffer={onAcceptOffer}
        onReject={onReject}
        isSubmitting={isSubmitting}
        lastActionBy={lastActionBy}
        status={status}
        isBuyerAddedAuthorizedSigner={isBuyerAddedAuthorizedSigner}
      />
    </div>
  );
}
