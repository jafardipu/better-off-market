import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const propertyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProperty: build.mutation({
      query: (data) => ({
        url: "/properties",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.property],
    }),
    getProperties: build.query({
      query: (params) => ({
        url: "/properties",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.property],
    }),
    getPropertiesForWeb: build.query({
      query: (params) => ({
        url: "/properties/web-content",
        method: "GET",
        params,
      }),
    }),
    getMyListings: build.query({
      query: (params) => ({
        url: "/properties/my-listing",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.property],
    }),
    getPriceDroppedProperties: build.query({
      query: (params) => ({
        url: "/properties/price-dropped",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.property],
    }),
    getSellerProperties: build.query({
      query: ({ id, ...params }) => ({
        url: `/properties/seller/${id}`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.property],
    }),
    getSingleProperty: build.query({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.property],
    }),
    getPropertyTypeCounts: build.query({
      query: () => ({
        url: "/properties/property-type-counts",
        method: "GET",
      }),
      providesTags: [tagTypes.property],
    }),
    updateProperty: build.mutation({
      query: ({ id, formData }) => ({
        url: `/properties/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: [tagTypes.property],
    }),
    increaseViewCount: build.mutation({
      query: (id) => ({
        url: `/properties/increase-views/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.property],
    }),
    increaseRSVPCount: build.mutation({
      query: (id) => ({
        url: `/properties/increase-rsvp/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.property, tagTypes.rsvp],
    }),
    getPropertyRsvps: build.query({
      query: (id: string) => ({
        url: `/properties/${id}/rsvps`,
        method: "GET",
      }),
      providesTags: [tagTypes.rsvp],
    }),
    getMyRsvps: build.query({
      query: (role: "seller" | "buyer" = "seller") => ({
        url: "/properties/my-rsvps",
        method: "GET",
        params: { role },
      }),
      providesTags: [tagTypes.rsvp],
    }),
    deleteProperty: build.mutation({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.property],
    }),
  }),
});

export const {
  useCreatePropertyMutation,
  useGetPropertiesQuery,
  useGetPropertiesForWebQuery,
  useGetPropertyTypeCountsQuery,
  useGetPriceDroppedPropertiesQuery,
  useGetMyListingsQuery,
  useGetSinglePropertyQuery,
  useGetSellerPropertiesQuery,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useIncreaseViewCountMutation,
  useIncreaseRSVPCountMutation,
  useGetPropertyRsvpsQuery,
  useGetMyRsvpsQuery,
} = propertyApi;
