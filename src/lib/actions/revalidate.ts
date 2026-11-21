"use server";
import { tagTypes } from "@/redux/tagTypes";
import { revalidatePath, updateTag } from "next/cache";

/** Expire property caches now so the next page render waits for fresh data. */
export async function revalidateProperties(propertyId?: string) {
  updateTag(tagTypes.property);

  if (!propertyId) return;

  updateTag(`property-${propertyId}`);
  revalidatePath(`/user/my-listings/${propertyId}`);
  revalidatePath(`/properties-list/${propertyId}`);
}
