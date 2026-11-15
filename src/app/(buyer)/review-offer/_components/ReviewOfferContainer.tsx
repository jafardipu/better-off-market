"use client";
import OfferPropertyCard from "@/components/shared/card/offer-property-card";
import Container from "@/components/shared/container/Container";
import SectionTitle from "@/components/shared/titles/SectionTitle";
import { OfferSummary } from "./OfferSummary";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearOfferDraft,
  selectOfferDraft,
} from "@/redux/features/offerDraftSlice";
import { useEffect } from "react";
import { IPropertyResponse } from "@/types";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useCreateOfferMutation } from "@/redux/api/offerApi";
import { LoaderIcon } from "@/icons";
import { toast } from "sonner";
import { errorModification } from "@/lib/errors/errorModification";

const getClosingCosts = (value: string) => {
  switch (value) {
    case "none":
      return "Buyer does NOT request seller contribution";
    case "requested":
      return "Buyer DOES request seller contribution";
    default:
      return "Buyer does NOT request seller contribution";
  }
};

export default function ReviewOfferContainer() {
  const [createOffer, { isLoading }] = useCreateOfferMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectOfferDraft);

  useEffect(() => {
    if (!draft?.values) {
      router.back();
    }
  }, []);

  const offerData = draft?.values;

  const handleSubmitOffer = async () => {
    const formattedData = { property: draft?.propertyId, terms: draft?.values };
    try {
      const formData = new FormData();
      if (draft?.supportingDocuments?.length) {
        draft?.supportingDocuments?.forEach((file) =>
          formData.append("supportingDocuments", file),
        );
      }
      formData.append("data", JSON.stringify(formattedData));

      await createOffer(formData).unwrap();

      toast.success("Offer submitted successfully!");
      router.push("/user/my-offers");
      dispatch(clearOfferDraft());
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Container className="md:mt-8 mt-6">
        <SectionTitle
          data={{
            title: "Review Your Offer",
            description:
              "Please review the details of your offer carefully before submitting. This action cannot be undone easily.",
            isBtn: false,
          }}
        />
        <OfferPropertyCard
          property={draft?.propertyData as IPropertyResponse}
          className="mt-5"
        />
        <OfferSummary
          data={{
            offerAmount: offerData?.offerAmount ?? 0,
            earnestMoney: offerData?.earnestMoney ?? 0,
            financingType:
              (offerData?.financingType == "other"
                ? offerData?.otherFinancingType
                : offerData?.financingType) ?? "cash",
            financingTerms: offerData?.financingTerms ?? "",
            closingCosts: getClosingCosts(
              offerData?.closingCostOption ?? "none",
            ),
            sellerContribution: offerData?.sellerContribution ?? 0,
            inspection: {
              required: offerData?.inspectionContingency === "yes",
              days: offerData?.inspectionDays ?? 0,
            },
            appraisal: {
              required: offerData?.appraisalContingency === "yes",
              // days: offerData?.appraisalDays ?? 0,
            },
            agent: {
              name: offerData?.agentName ?? "",
              commission: offerData?.commission ?? "",
            },
            hasAgent: offerData?.hasAgent === "yes",
            personalProperty: {
              included: offerData?.personalPropertyIncluded?.split(",") ?? [],
              itemsToRemove: offerData?.itemsToBeRemoved?.split(",") ?? [],
            },
            closingTerms: {
              titleCompany: offerData?.titleCompany ?? "",
              closingDate: moment(offerData?.closingDate).format(
                "MM-DD-YYYY",
              ),
              possession: offerData?.possession ?? "",
            },
            documents: (draft?.supportingDocuments ?? []) as File[],
            notesToSeller: offerData?.notesToSeller ?? "",
          }}
          sidebarFooter={
            <div className="w-full flex items-center md:gap-4 gap-2">
              <Button
                onClick={() => router.back()}
                className="flex-1 bg-transparent border-primary-border-color text-primary-black hover:bg-gray-100 py-5 cursor-pointer"
              >
                Back to Edit
              </Button>
              <Button
                disabled={isLoading}
                className="flex-1 bg-primary-color  text-white hover:bg-primary-color hover:opacity-90 py-5 cursor-pointer"
                onClick={handleSubmitOffer}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <LoaderIcon className="animate-spin mr-2" />{" "}
                    Submitting...{" "}
                  </span>
                ) : (
                  "Submit Offer"
                )}
              </Button>
            </div>
          }
        />
      </Container>
    </>
  );
}
