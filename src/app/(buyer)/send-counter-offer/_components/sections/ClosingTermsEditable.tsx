import { Calendar } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { EditableTextField } from "../ui/EditableTextField";
import { EditableSelectField } from "../ui/EditableSelectField";
import { POSSESSION_OPTIONS, type OfferFormValues } from "@/lib/validations/offer-form";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
import { formatOrDash } from "../counter-offer-helpers";

interface ClosingTermsEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
}

export function ClosingTermsEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
}: ClosingTermsEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });
  const possessionLabel =
    POSSESSION_OPTIONS.find((o) => o.value === values.possession)?.label ?? "—";
  const originalPossessionLabel =
    POSSESSION_OPTIONS.find((o) => o.value === originalValues.possession)?.label ?? "—";

  return (
    <EditableCard
      title="Closing Terms"
      icon={<Calendar size={18} />}
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <SummaryField label="Title company" value={formatOrDash(values.titleCompany)} />
          <SummaryField label="Closing date" value={formatOrDash(values.closingDate)} />
          <SummaryField label="Possession" value={possessionLabel} />
        </div>
      }
      editContent={
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableTextField
            control={control}
            name="titleCompany"
            label="Title company"
            originalValue={formatOrDash(originalValues.titleCompany)}
          />
          <EditableTextField
            control={control}
            name="closingDate"
            label="Closing date"
            type="date"
            originalValue={formatOrDash(originalValues.closingDate)}
          />
          <EditableSelectField
            control={control}
            name="possession"
            label="Possession"
            options={POSSESSION_OPTIONS}
            originalValue={originalPossessionLabel}
          />
          <EditableTextField
            control={control}
            name="sellerPostClosingDays"
            label="Seller post-closing occupancy (days)"
            type="number"
            originalValue={formatOrDash(originalValues.sellerPostClosingDays)}
          />
        </div>
      }
    />
  );
}
