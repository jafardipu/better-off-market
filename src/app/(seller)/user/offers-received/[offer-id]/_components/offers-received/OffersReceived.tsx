import { OffersReceivedHeader } from "./OffersReceivedHeader";
import { OfferComparisonRow, type OfferSnapshot } from "./OfferComparisonRow";
import { ConsolidatedOfferCard } from "./ConsolidatedOfferCard";
import { OffersReceivedActionBar } from "./OffersReceivedActionBar";
import { ConsolidatedOfferData, OFFER_STATUS } from "./utils.offer-received";
import { IPropertyResponse } from "@/types";
import OfferPropertyCard from "@/components/shared/card/offer-property-card";

interface OffersReceivedProps {
  offerId: string;
  property: IPropertyResponse;
  buyerName: string;
  buyerId: string;
  propertyId: string;
  propertyLabel: string;
  offersSubmittedCount: number;
  yourOffer: OfferSnapshot;
  counterOffer?: OfferSnapshot & { badgeNumber?: number };
  yourOfferTitle?: string;
  counterOfferTitle?: string;
  offer: ConsolidatedOfferData;
  lastActionBy?: "buyer" | "seller";
  status: (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];
  isSellerAddedAuthorizedSigner?: boolean;
  isContractDetailsSubmitted?: boolean;
  onSubmitContractDetails?: () => void;
  onAcceptOffer?: () => void;
  onReject?: () => void;
  isSubmitting?: boolean;
}

export function OffersReceived({
  offerId,
  property,
  buyerName,
  propertyId,
  buyerId,
  propertyLabel,
  offersSubmittedCount,
  yourOffer,
  counterOffer,
  yourOfferTitle,
  counterOfferTitle,
  offer,
  lastActionBy,
  status,
  isSellerAddedAuthorizedSigner,
  isContractDetailsSubmitted,
  onSubmitContractDetails,
  onAcceptOffer,
  onReject,
  isSubmitting,
}: OffersReceivedProps) {
  return (
    <div>
      <OfferPropertyCard property={property} className="mb-2" />
      <OffersReceivedHeader
        offerId={offerId}
        propertyId={propertyId}
        propertyLabel={propertyLabel}
        offersSubmittedCount={offersSubmittedCount}
      />

      <OfferComparisonRow
        yourOffer={yourOffer}
        counterOffer={counterOffer}
        yourOfferTitle={yourOfferTitle}
        counterOfferTitle={counterOfferTitle}
      />

      <ConsolidatedOfferCard name={buyerName} buyerId={buyerId} data={offer} />

      <OffersReceivedActionBar
        buyerId={buyerId}
        className="mt-6"
        offerId={offerId}
        onAcceptOffer={onAcceptOffer}
        onReject={onReject}
        isSubmitting={isSubmitting}
        lastActionBy={lastActionBy}
        status={status}
        isSellerAddedAuthorizedSigner={isSellerAddedAuthorizedSigner}
        isContractDetailsSubmitted={isContractDetailsSubmitted}
        onSubmitContractDetails={onSubmitContractDetails}
      />
    </div>
  );
}
