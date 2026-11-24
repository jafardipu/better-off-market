import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

/**
 * Seller's answer to "How did the buyer first initiate contact with you
 * regarding this specific property?" — used by admins to decide whether the
 * Buyer Platform Fee applies.
 */
export const BUYER_CONTACT_SOURCES = [
  {
    value: "betteroffmarket",
    label:
      "The buyer first contacted me about this property through BetterOffMarket.",
  },
  {
    value: "independent",
    label:
      "The buyer first contacted me about this property through another source, independently of BetterOffMarket.",
  },
  {
    value: "unsure",
    label: "I am unsure / unable to determine.",
  },
] as const;

export type TBuyerContactSource =
  (typeof BUYER_CONTACT_SOURCES)[number]["value"];

export interface IMarkUnderContractPayload {
  propertyId: string;
  /** Set when the details are submitted for an accepted offer. */
  offerId?: string;
  // The contract details are optional — the seller may submit them blank.
  buyerName?: string;
  /** Anticipated closing date as "YYYY-MM-DD". */
  closingDate?: string;
  titleCompany?: string;
  buyerContactSource: TBuyerContactSource;
  /** The seller ticked "I certify that the information provided above is accurate…". */
  certified: true;
}

const propertyContractApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Saves the contract details AND moves the property to "Under Contract"
    // in one request; the backend also notifies admins (email + dashboard).
    markUnderContract: build.mutation<unknown, IMarkUnderContractPayload>({
      query: (data) => ({
        url: "/property-contracts",
        method: "POST",
        body: data,
      }),
      // Offer too: the offer's `isContractDetailsSubmitted` flips to true.
      invalidatesTags: [tagTypes.property, tagTypes.offer],
    }),
  }),
});

export const { useMarkUnderContractMutation } = propertyContractApi;
