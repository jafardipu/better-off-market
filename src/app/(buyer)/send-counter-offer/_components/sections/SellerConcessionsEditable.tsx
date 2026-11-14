import { useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { EditableCurrencyField } from "../ui/EditableCurrencyField";
import { EditableSelectField } from "../ui/EditableSelectField";
import { ComparisonBox } from "../ui/ComparisonBox";
import {
  CLOSING_COST_OPTIONS,
  type OfferFormValues,
} from "@/lib/validations/offer-form";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
import { formatCurrency } from "../counter-offer-helpers";
import { SellerConcessionsIcon } from "@/icons";

interface SellerConcessionsEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
  /** Shown under the title while the section is in its highlighted "changed" state. */
  description?: string;
}

export function SellerConcessionsEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
  description = "Contribution towards buyer's closing costs and prepaid items.",
}: SellerConcessionsEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });
  const closingCostLabel =
    CLOSING_COST_OPTIONS.find((o) => o.value === values.closingCostOption)
      ?.label ?? "—";
  const originalClosingCostLabel =
    CLOSING_COST_OPTIONS.find(
      (o) => o.value === originalValues.closingCostOption,
    )?.label ?? "—";

  return (
    <EditableCard
      title="Seller Concessions"
      icon={<SellerConcessionsIcon />}
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SummaryField label="Closing costs" value={closingCostLabel} />
          <SummaryField
            label="Seller contribution ($)"
            value={formatCurrency(values.sellerContribution)}
          />
        </div>
      }
      // changedContent={
      //   <div>
      //     <p className="mb-4 text-primary-black">{description}</p>
      //     <ComparisonBox
      //       currentValue={formatCurrency(values.sellerContribution)}
      //       originalValue={formatCurrency(originalValues.sellerContribution)}
      //     />
      //   </div>
      // }
      editContent={
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableSelectField
            control={control}
            name="closingCostOption"
            label="Closing costs"
            options={CLOSING_COST_OPTIONS}
            originalValue={originalClosingCostLabel}
          />
          <EditableCurrencyField
            control={control}
            name="sellerContribution"
            label="Seller contribution ($)"
          />
        </div>
      }
    />
  );
}
