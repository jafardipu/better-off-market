import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

export interface IMarkUnderContractPayload {
  propertyId: string;
  // All contract details are optional — the seller may submit them blank.
  buyerName?: string;
  /** Anticipated closing date as "YYYY-MM-DD". */
  closingDate?: string;
  titleCompany?: string;
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
      invalidatesTags: [tagTypes.property],
    }),
  }),
});

export const { useMarkUnderContractMutation } = propertyContractApi;
