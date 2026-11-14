import { useCallback, useMemo, useRef, useState } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { pickFields,  SECTION_FIELDS, fieldsChanged, type SectionKey } from "@/app/(buyer)/send-counter-offer/_components/counter-offer-helpers";

interface UseEditableSectionsArgs {
  control: Control<OfferFormValues>;
  setValue: UseFormSetValue<OfferFormValues>;
  originalValues: OfferFormValues;
  /** Sections that should start already marked as changed/highlighted (e.g. seller already proposed a new value). */
  initiallyChanged?: SectionKey[];
}

export function useEditableSections({
  control,
  setValue,
  originalValues,
  initiallyChanged = [],
}: UseEditableSectionsArgs) {
  const [editing, setEditing] = useState<Record<SectionKey, boolean>>(
    Object.fromEntries(
      (Object.keys(SECTION_FIELDS) as SectionKey[]).map((key) => [key, false])
    ) as Record<SectionKey, boolean>
  );

  // Snapshot of field values taken the moment a section enters edit mode,
  // so "Cancel" can restore exactly what was there before this edit pass
  // (which may itself already differ from the original offer).
  const snapshots = useRef<Partial<Record<SectionKey, Partial<OfferFormValues>>>>({});

  const currentValues = useWatch({ control }) as OfferFormValues;

  const changed = useMemo(() => {
    const result = {} as Record<SectionKey, boolean>;
    (Object.keys(SECTION_FIELDS) as SectionKey[]).forEach((key) => {
      const forcedChanged = initiallyChanged.includes(key);
      result[key] =
        forcedChanged ||
        fieldsChanged(currentValues ?? {}, originalValues, SECTION_FIELDS[key]);
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValues, originalValues]);

  const startEdit = useCallback(
    (section: SectionKey) => {
      snapshots.current[section] = pickFields(
        (currentValues ?? originalValues) as OfferFormValues,
        SECTION_FIELDS[section]
      );
      setEditing((prev) => ({ ...prev, [section]: true }));
    },
    [currentValues, originalValues]
  );

  const cancelEdit = useCallback(
    (section: SectionKey) => {
      const snapshot = snapshots.current[section];
      if (snapshot) {
        (SECTION_FIELDS[section] as (keyof OfferFormValues)[]).forEach((field) => {
          setValue(field, snapshot[field] as never, { shouldValidate: false, shouldDirty: false });
        });
      }
      setEditing((prev) => ({ ...prev, [section]: false }));
    },
    [setValue]
  );

  /** Keep current field values and leave edit mode (unlike cancelEdit). */
  const finishEdit = useCallback((section: SectionKey) => {
    setEditing((prev) => ({ ...prev, [section]: false }));
  }, []);

  /** Open a section for editing without overwriting an existing snapshot. */
  const revealEdit = useCallback(
    (section: SectionKey) => {
      if (!snapshots.current[section]) {
        snapshots.current[section] = pickFields(
          (currentValues ?? originalValues) as OfferFormValues,
          SECTION_FIELDS[section],
        );
      }
      setEditing((prev) => ({ ...prev, [section]: true }));
    },
    [currentValues, originalValues],
  );

  return { editing, changed, startEdit, cancelEdit, finishEdit, revealEdit };
}
