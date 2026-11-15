import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRightLeft,
} from "lucide-react";

export type NegotiationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered";

export const STATUS_CONFIG: Record<
  NegotiationStatus,
  {
    label: string;
    icon: typeof Clock;
    nodeClassName: string;
    borderClassName: string;
    badgeClassName: string;
    amountClassName: string;
    dividerClassName: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    nodeClassName: "bg-[#FFF3E0] text-[#E65100]",
    borderClassName: "border border-[#FFE0B2]",
    badgeClassName: "bg-[#FFF3E0] text-[#E65100]",
    amountClassName: "text-foreground",
    dividerClassName: "border-[#FFE0B2]",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    nodeClassName: "bg-[#E8F5E9] text-[#1B5E20]",
    borderClassName: "border border-[#C8E6C9]",
    badgeClassName: "bg-[#E8F5E9] text-[#1B5E20]",
    amountClassName: "text-foreground",
    dividerClassName: "border-[#C8E6C9]",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    nodeClassName: "bg-red-100 text-red-700",
    borderClassName: "border border-red-200",
    badgeClassName: "bg-red-100 text-red-700",
    amountClassName: "text-foreground",
    dividerClassName: "border-red-200",
  },
  countered: {
    label: "Countered",
    icon: ArrowRightLeft,
    nodeClassName: "bg-[#DAE2FD] text-[#131B2E]/50",
    borderClassName: "border border-[#FFECB3]",
    badgeClassName: "bg-[#DAE2FD] text-[#131B2E]",
    amountClassName: "text-foreground",
    dividerClassName: "border-[#FFECB3]",
  },
};

export interface NegotiationEvent {
  id: string;
  status: NegotiationStatus;
  amount: number;
  date: string;
  time: string;
  actionLabel: string;
  actorName: string;
  actorInitials: string;
  actorRole: "Buyer" | "Seller";
  actorProfile?: string | null;
  avatarClassName?: string;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export function avatarColorForName(name: string) {
  const index =
    name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function formatCurrency(amount: number) {
  return amount?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDateParts(dateString: string) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateLabel = `${month}-${day}-${date.getFullYear()}`;
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return { dateLabel, timeLabel };
}

// --- Mapping from raw API offer -> NegotiationEvent[] ---

interface RawHistoryEntry {
  offerAmount: number;
  round: number;
  madeBy: "buyer" | "seller";
  madeByUser: string;
  createdAt: string;
  status: string;
}

interface RawUser {
  _id: string;
  name: string;
  profile: string | null;
}

interface RawOffer {
  status: string;
  history: RawHistoryEntry[];
  buyer: RawUser;
  seller: RawUser;
}

// Normalizes whatever the API sends into the known NegotiationStatus union,
// falling back to "pending" for any unexpected/unmapped value.
function normalizeStatus(rawStatus: string): NegotiationStatus {
  const valid: NegotiationStatus[] = [
    "pending",
    "accepted",
    "rejected",
    "countered",
  ];
  return valid.includes(rawStatus as NegotiationStatus)
    ? (rawStatus as NegotiationStatus)
    : "pending";
}

function resolveActorRole(madeBy: "buyer" | "seller"): "Buyer" | "Seller" {
  return madeBy === "buyer" ? "Buyer" : "Seller";
}

function buildActionLabel(
  status: NegotiationStatus,
  actorName: string,
): string {
  switch (status) {
    case "pending":
      return `Submitted by ${actorName}`;
    case "accepted":
      return `Accepted by ${actorName}`;
    case "rejected":
      return `Rejected by ${actorName}`;
    case "countered":
    default:
      return `Countered by ${actorName}`;
  }
}

function resolveEventStatus(
  round: number,
  totalRounds: number,
  offerStatus: string,
): NegotiationStatus {
  // Round 1 is always the original offer submission — it starts as
  // "pending" regardless of what's happened since, UNLESS it's also
  // the only round that ever existed (nothing to counter/accept/reject yet).
  if (round === 1 && totalRounds > 1) {
    return "pending";
  }

  const isLatestRound = round === totalRounds;

  if (isLatestRound) {
    if (offerStatus === "accepted") return "accepted";
    if (offerStatus === "rejected") return "rejected";
    if (offerStatus === "pending") return "pending";
    return "countered";
  }

  return "countered";
}

export function mapOfferHistoryToNegotiationEvents(
  offer: RawOffer,
): NegotiationEvent[] {
  // Most recent round first, matching the reference UI's "latest on top" order
  return [...offer.history]
    .sort((a, b) => b.round - a.round)
    .map((entry) => {
      const actorUser = entry.madeBy === "buyer" ? offer.buyer : offer.seller;
      const actorRole = resolveActorRole(entry.madeBy);
      const status = normalizeStatus(entry.status);
      const { dateLabel, timeLabel } = formatDateParts(entry.createdAt);

      return {
        id: String(entry.round),
        status,
        amount: entry.offerAmount,
        date: dateLabel,
        time: timeLabel,
        actionLabel: buildActionLabel(status, actorUser.name),
        actorName: actorUser.name,
        actorInitials: getInitials(actorUser.name),
        actorRole,
        actorProfile: actorUser.profile,
      };
    });
}
