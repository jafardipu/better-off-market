"use client";
import { useMemo } from "react";
import { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { PropertyListingForm } from "./PropertyListingForm";
import { ZodError } from "zod";
import { zodFormErrorModification } from "@/lib/errors/zodFormErrorModification";
import { toast } from "sonner";
import {
  useCreatePropertyMutation,
  useGetSinglePropertyQuery,
  useUpdatePropertyMutation,
} from "@/redux/api/propertiesApi";
import { errorModification } from "@/lib/errors/errorModification";
import { useRouter, useSearchParams } from "next/navigation";
import SectionTitle from "@/components/shared/titles/SectionTitle";
import { revalidateProperties } from "@/lib/actions/revalidate";
import {
  COUNTY_DATA,
  type CountyType,
} from "@/components/shared/county_selector/CountySelectorForListing";

function resolveCountyType(
  county?: string,
  countyType?: string,
): CountyType | "" {
  if (countyType === "OHIO" || countyType === "KENTUCKY") return countyType;
  if (!county) return "";

  for (const [type, counties] of Object.entries(COUNTY_DATA)) {
    if (counties.includes(county)) return type as CountyType;
  }

  return "";
}

const mapPropertyToFormValues = (
  property: Record<string, any>,
): Partial<PropertyListingFormValues> => ({
  propertyType: property?.propertyType ?? "Residential",
  useType: property?.useType ?? undefined,
  useTypeOther: property?.useTypeOther ?? undefined,
  ownership: property?.ownership ?? "own",
  location: property?.location ?? { type: "Point", coordinates: [0, 0] },
  streetAddress: property?.streetAddress ?? "",
  state: property?.state ?? "",
  county: property?.county ?? "",
  countyType: resolveCountyType(property?.county, property?.countyType),
  city: property?.city ?? "",
  zipCode: property?.zipCode ?? "",
  parcelIds: property?.parcelIds ?? "",
  listingPrice: property?.listingPrice ?? 0,
  buyItNowPrice: property?.buyItNowPrice ?? undefined,
  arv: property?.arv ?? undefined,
  marketingDescription: property?.marketingDescription ?? "",
  utilities: property?.utilities ?? undefined,
  specifications: property?.specifications ?? {},
  roofMaterial: property?.roofMaterial ?? undefined,
  roofAge: property?.roofAge ?? undefined,
  heatingSystem: property?.heatingSystem ?? undefined,
  heatingAge: property?.heatingAge ?? undefined,
  cooling: property?.cooling ?? undefined,
  coolingAge: property?.coolingAge ?? undefined,
  waterHeating: property?.waterHeating ?? undefined,
  waterHeatingAge: property?.waterHeatingAge ?? undefined,
  water: property?.water ?? undefined,
  sewer: property?.sewer ?? undefined,
  foundation: property?.foundation ?? undefined,
  otherUpdates: property?.otherUpdates ?? undefined,
  roofMaterialOther: property?.roofMaterialOther ?? undefined,
  heatingSystemOther: property?.heatingSystemOther ?? undefined,
  coolingOther: property?.coolingOther ?? undefined,
  waterHeatingOther: property?.waterHeatingOther ?? undefined,
  waterOther: property?.waterOther ?? undefined,
  sewerOther: property?.sewerOther ?? undefined,
  foundationOther: property?.foundationOther ?? undefined,
  hasHoa: property?.hasHoa ?? "no",
  hoaAmount: property?.hoaAmount ?? undefined,
  hoaFrequency: property?.hoaFrequency || undefined,
  hoaIncludes: property?.hoaIncludes ?? "",
  titleCompany: property?.titleCompany ?? undefined,
  closingDate: property?.closingDate ?? "",
  photos: Array.isArray(property?.photos) ? property.photos : [],
  documents: Array.isArray(property?.documents)
    ? property.documents.map((doc: any) => doc?.url ?? doc?.name ?? "")
    : [],
});

export default function PropertyListingContainer() {
  const router = useRouter();
  const propertyId = useSearchParams().get("property");
  const { data } = useGetSinglePropertyQuery(propertyId, { skip: !propertyId });
  const [createProperty] = useCreatePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  // Only hydrate from the fetched listing while editing. Cached RTK data
  // must not leak into create mode after leaving ?property=...
  const defaultValues = useMemo(
    () =>
      propertyId && data?.data
        ? mapPropertyToFormValues(data.data)
        : undefined,
    [propertyId, data?.data],
  );

  const isEditMode = Boolean(propertyId && data?.data);
  const formKey = propertyId ? `edit-${propertyId}` : "create";

  const sectionTitleData = isEditMode
    ? {
        title: "Edit Listing",
        description:
          "Update your property details to keep the listing accurate and competitive.",
      }
    : {
        title: "Create new listing",
        description:
          "Provide detailed information to attract high-quality buyers and investors.",
      };

  const handleSubmit = async (values: PropertyListingFormValues) => {
    try {
      const formData = new FormData();

      // Build ordered photo plan so create/update keep the user's drag order.
      // Existing images stay as URLs; new uploads are File slots mapped by index.
      const photoOrder: Array<
        | { type: "url"; url: string }
        | { type: "file"; index: number }
      > = [];
      const existingPhotoUrls: string[] = [];
      const uploadedPhotos: File[] = [];

      for (const photo of values.photos ?? []) {
        if (typeof photo === "string" && photo.trim()) {
          existingPhotoUrls.push(photo);
          photoOrder.push({ type: "url", url: photo });
        } else if (photo instanceof File) {
          const index = uploadedPhotos.length;
          uploadedPhotos.push(photo);
          photoOrder.push({ type: "file", index });
        }
      }

      const uploadedDocuments = (values.documents ?? []).filter(
        (file): file is File => file instanceof File,
      );
      const existingDocumentUrls = (values.documents ?? []).filter(
        (doc): doc is string => typeof doc === "string" && Boolean(doc.trim()),
      );

      const { photos: _photos, documents: _documents, ...rest } = values;
      formData.append(
        "data",
        JSON.stringify({
          ...rest,
          photos: existingPhotoUrls,
          photoOrder,
          documents: existingDocumentUrls,
        }),
      );

      uploadedPhotos.forEach((file) => formData.append("photos", file));
      uploadedDocuments.forEach((file) => formData.append("documents", file));

      if (propertyId && data?.data) {
        await updateProperty({ id: propertyId, formData }).unwrap();
        toast.success("Property updated successfully.");
        await revalidateProperties();
        return true;
      }

      await createProperty(formData).unwrap();
      toast.success(
        "Property Listing request submitted successfully! Please wait for admin approval. Once approved, your listing will be live on the platform.",
      );
      await revalidateProperties();
      router.push("/user/dashboard");
      return true;
    } catch (err) {
      const errMessage = errorModification(err);
      toast.error(errMessage);
    }
  };

  const handleError = (err: ZodError) => {
    const errMessage = zodFormErrorModification(err);
    toast.error(errMessage);
  };

  return (
    <div className="space-y-4">
      <SectionTitle data={sectionTitleData} />
      <PropertyListingForm
        key={formKey}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onError={handleError}
        isEditMode={isEditMode}
      />
    </div>
  );
}
