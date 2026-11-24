import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CLOSED_OFFER_STATUSES, OFFER_STATUS } from "./utils.offer-received";

interface OffersReceivedActionBarProps {
  buyerId?: string;
  offerId: string;
  onAcceptOffer?: () => void;
  onReject?: () => void;
  isSubmitting?: boolean;
  className?: string;
  lastActionBy?: "buyer" | "seller";
  status: (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];
  isSellerAddedAuthorizedSigner?: boolean;
  /** True once the seller submitted the contract details for this offer. */
  isContractDetailsSubmitted?: boolean;
  onSubmitContractDetails?: () => void;
}

const baseButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function OffersReceivedActionBar({
  buyerId,
  offerId,
  onAcceptOffer,
  onReject,
  isSubmitting,
  className,
  lastActionBy = "buyer",
  status,
  // OLD FLOW (contracts / e-signing) — disabled for now on attorney advice.
  // isSellerAddedAuthorizedSigner,
  isContractDetailsSubmitted,
  onSubmitContractDetails,
}: OffersReceivedActionBarProps) {
  const showFullActions = lastActionBy !== "seller";
  const isStatusClosed = CLOSED_OFFER_STATUSES.includes(status);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {/* OLD FLOW (contracts / e-signing) — disabled for now on attorney advice.
      {!isSellerAddedAuthorizedSigner && status === "accepted" ? (
        <Link
          href={`/sign-agreement-contact?offerId=${offerId}&actionBy=seller`}
        >
          <button
            type="button"
            disabled={isSubmitting}
            className={cn(
              baseButton,
              "bg-[#0F2A4D] hover:bg-[#0F2A4D]/90 text-white rounded-md cursor-pointer",
            )}
          >
            Add Authorized Signer
          </button>
        </Link>
      ) : null}
      */}

      {/* NEW FLOW: after an offer is accepted the seller submits the contract
          details (buyer name, closing date, title company, buyer contact source). */}
      {status === "accepted" &&
      !isContractDetailsSubmitted &&
      onSubmitContractDetails ? (
        <button
          type="button"
          onClick={onSubmitContractDetails}
          disabled={isSubmitting}
          className={cn(
            baseButton,
            "bg-[#0F2A4D] hover:bg-[#0F2A4D]/90 text-white rounded-md cursor-pointer",
          )}
        >
          Submit Contract Details
        </button>
      ) : null}

      {showFullActions && !isStatusClosed ? (
        <button
          type="button"
          onClick={onAcceptOffer}
          disabled={isSubmitting}
          className={cn(
            baseButton,
            "bg-[#0D6F3A] text-white rounded-md hover:bg-emerald-700 cursor-pointer",
          )}
        >
          Accept Offer
        </button>
      ) : null}

      {showFullActions && !isStatusClosed ? (
        <Link href={`/send-counter-offer?offer=${offerId}`}>
          <button
            type="button"
            disabled={isSubmitting}
            className={cn(
              baseButton,
              "bg-[#2D3133] text-white hover:bg-slate-800 rounded-md cursor-pointer",
            )}
          >
            Counter offer
          </button>
        </Link>
      ) : null}

      <Link href={`/message?user=${buyerId}`}>
        <button
          type="button"
          disabled={isSubmitting}
          className={cn(
            baseButton,
            "border border-primary-border-color rounded-md bg-card text-primary-color hover:bg-muted/50 cursor-pointer",
          )}
        >
          <MessageSquareText size={14} />
          Message buyer
        </button>
      </Link>

      {showFullActions && !isStatusClosed ? (
        <button
          type="button"
          onClick={onReject}
          disabled={isSubmitting}
          className={cn(
            baseButton,
            "border border-destructive/40 bg-card text-destructive hover:bg-destructive/5 cursor-pointer rounded-md",
          )}
        >
          Reject
        </button>
      ) : null}
    </div>
  );
}
