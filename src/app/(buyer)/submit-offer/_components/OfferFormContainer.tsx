"use client";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { OfferForm } from "./OfferForm";
import Container from "@/components/shared/container/Container";
import { MapPin } from "lucide-react";
import OfferPropertyCard from "@/components/shared/card/offer-property-card";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetSinglePropertyQuery } from "@/redux/api/propertiesApi";
import { Skeleton } from "@/components/ui/skeleton";
import OfferPropertyCardSkeleton from "@/components/skeleton/OfferPropertyCardSkeleton";
import { zodFormErrorModification } from "@/lib/errors/zodFormErrorModification";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useDispatch } from "react-redux";
import {
  selectOfferDraft,
  setOfferDraft,
} from "@/redux/features/offerDraftSlice";
import { useAppSelector } from "@/redux/hooks";

export default function OfferFormContainer() {
  const isEdit = useSearchParams().get("edit") === "true";
  const propertyId = useSearchParams().get("property");
  const { data, isLoading } = useGetSinglePropertyQuery(propertyId, {
    skip: !propertyId,
  });
  const draft = useAppSelector(selectOfferDraft);

  const router = useRouter();
  const dispatch = useDispatch();

  const property = data?.data;

  async function handleSubmit(
    values: OfferFormValues,
    supportingDocuments: File[],
  ) {
    dispatch(
      setOfferDraft({
        values,
        propertyId: propertyId as string,
        supportingDocuments,
        propertyData: {
          photos: property?.photos,
          listingPrice: property?.listingPrice,
          propertyType: property?.propertyType,
          specifications: property?.specifications,
        },
      }),
    );
    router.push("/review-offer");
  }

  const handleError = (err: ZodError) => {
    const errMessage = zodFormErrorModification(err);
    toast.error(errMessage);
  };

  return (
    <Container className="mt-4">
      {/* ===========================  property info ============================= */}
      <>
        <div className="mb-1">
          {isLoading ? (
            <Skeleton className="h-5 lg:w-136  md:w-96  w-52 bg-gray-300" />
          ) : (
            <span className="text-sm text-primary-color font-medium flex gap-1 items-center line-clamp-1">
              <MapPin size={14} /> {property?.streetAddress}, {property?.city},{" "}
              {property?.state}, {property?.zipCode} , {property?.county}
            </span>
          )}
          <h4 className="md:text-3xl text-2xl font-semibold">
            {isEdit ? "Edit Offer" : "Submit an Offer"}
          </h4>
        </div>
        {isLoading ? (
          <OfferPropertyCardSkeleton />
        ) : (
          <OfferPropertyCard property={property} />
        )}
      </>
      {/* ========================================================================== */}

      <OfferForm
        onSubmit={handleSubmit}
        onError={handleError}
        onCancel={() => window.history.back()}
        defaultValues={propertyId === draft?.propertyId ? draft?.values : null}
      />
    </Container>
  );
}
