"use client";

import { useCallback, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  offerFormSchema,
  offerFormDefaultValues,
  type OfferFormValues,
} from "@/lib/validations/offer-form";
import { FormFooter } from "./FormFooter";
import { OfferDetailsSection } from "./Offerdetailssection";
import { SellerConcessionsSection } from "./SellerConcessionsSectionImpl";
import { ContingenciesSection } from "./ContingenciesSectionImpl";
import { RealEstateAgentSection } from "./RealEstateAgentSectionImpl";
import { PersonalPropertySection } from "./PersonalPropertySectionImpl";
import { ClosingTermsSection } from "./ClosingTermsSectionImpl";
import { SingleTextareaSection } from "./SingleTextareaSectionImpl";
import { SupportingDocumentsSection } from "./SupportingDocumentsSectionImpl";

interface OfferFormProps {
  defaultValues?: Partial<OfferFormValues> | null;

  onSubmit: (
    values: OfferFormValues,
    supportingDocuments: File[],
  ) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (errors: any) => void;
}

export function OfferForm({
  defaultValues,
  onSubmit,
  onCancel,
  onError,
}: OfferFormProps) {
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);

  const form = useForm<OfferFormValues>({
    // @ts-ignore
    resolver: zodResolver(offerFormSchema),
    defaultValues: { ...offerFormDefaultValues, ...defaultValues },
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const handleSubmit: SubmitHandler<OfferFormValues> = useCallback(
    (values) => onSubmit(values, supportingDocuments),
    [onSubmit, supportingDocuments],
  );

  return (
    <FormProvider {...form}>
      <form
        // @ts-ignore
        onSubmit={form.handleSubmit<OfferFormValues>(handleSubmit, onError)}
        noValidate
        className="flex flex-col gap-6 lg:gap-8 lg:py-8 py-6"
      >
        <OfferDetailsSection />
        <SellerConcessionsSection />
        <ContingenciesSection />
        <RealEstateAgentSection />
        <PersonalPropertySection

        />
        <ClosingTermsSection />
        <SingleTextareaSection
          title="Additional Terms / Conditions"
          name="additionalTerms"
          placeholder="e.g., Buyer requests washer and dryer to remain with property."
        />
        <SupportingDocumentsSection onFilesChange={setSupportingDocuments} />
        <SingleTextareaSection
          title="Note to seller"
          name="notesToSeller"
          placeholder="Add a personal note or explain specific parts of your offer..."
        />

        <FormFooter
          onCancel={onCancel}
          isSubmitting={form.formState.isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
