"use client";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { CounterOfferEditor } from "./CounterOfferEditor";
import Container from "@/components/shared/container/Container";
import { useRouter, useSearchParams } from "next/navigation";
import OfferPropertyCard from "@/components/shared/card/offer-property-card";
import {
  useGetSingleOfferQuery,
  useSentCounterOfferMutation,
} from "@/redux/api/offerApi";
import CounterOfferEditorSkeleton from "@/components/skeleton/CounterOfferEditorSkeleton";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { normalizeOfferTermsForForm } from "./counter-offer-helpers";
import Empty from "@/components/ui/empty-data";

export default function SendCounterFormContainer() {
  const router = useRouter();
  const offerId = useSearchParams().get("offer");
  const { data, isLoading, isError } = useGetSingleOfferQuery(offerId, {
    skip: !offerId,
  });
  const [sentCounterOffer] = useSentCounterOfferMutation();

  if (!offerId) {
    return (
      <Container className="mt-8">
        <Empty message="Missing offer id. Open Counter offer from an offer details page." />
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="mt-8">
        <CounterOfferEditorSkeleton />
      </Container>
    );
  }

  const offer = data?.data;
  if (isError || !offer?.currentTerms) {
    return (
      <Container className="mt-8">
        <Empty message="Unable to load this offer for countering." />
      </Container>
    );
  }

  const originalValues = normalizeOfferTermsForForm(
    offer.currentTerms,
    offer.lastActionBy,
  );

  const handleSentCounter = async (values: OfferFormValues) => {
    toast.loading("Submitting counter offer...", { id: "counter-offer" });
    try {
      await sentCounterOffer({
        id: offerId,
        terms: values,
      }).unwrap();
      toast.success("Counter offer submitted successfully!", {
        id: "counter-offer",
      });
      router.back();
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage, { id: "counter-offer" });
    }
  };

  return (
    <Container className="mt-8">
      <h3 className="md:text-[28px] text-2xl font-bold text-primary-black mb-3">
        Send Counter Offer
      </h3>
      <OfferPropertyCard property={offer.property} />
      <CounterOfferEditor
        originalValues={originalValues}
        user={offer.lastActionBy === "buyer" ? offer.buyer : offer.seller}
        documents={offer.supportingDocuments || []}
        onSubmit={(values) => handleSentCounter(values)}
        onCancel={() => router.back()}
      />
    </Container>
  );
}
