import { useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { type OfferFormValues } from "@/lib/validations/offer-form";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
import { MessageSquareText } from "lucide-react";
import { EditableTextareaField } from "../ui/EditableTextareaField";

interface NoteEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
}

export function NoteEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
}: NoteEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });

  const lastActionBy = (
    originalValues as OfferFormValues & { lastActionBy?: "buyer" | "seller" }
  ).lastActionBy;

  const isBuyerLastAction = lastActionBy === "buyer";
  const fieldName = isBuyerLastAction ? "notesToSeller" : "notesToBuyer";
  const label = isBuyerLastAction ? "Notes to Seller" : "Notes to Buyer";

  const fieldValue = values[fieldName] as string | undefined;

  const placeholderRecipient =
    lastActionBy === "buyer" ? "seller" : "buyer";

  return (
    <EditableCard
      title={label}
      icon={<MessageSquareText color="#00214C" size={18} />}
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SummaryField label={label} value={fieldValue || "—"} />
        </div>
      }
      editContent={
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 ">
          <EditableTextareaField
            control={control}
            name={fieldName}
            label={label}
            placeholder={`Enter notes to the ${placeholderRecipient}...`}
            className="min-h-16"
          />
        </div>
      }
    />
  );
}