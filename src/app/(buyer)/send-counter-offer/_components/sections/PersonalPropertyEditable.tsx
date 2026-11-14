import { Archive } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { EditableTextareaField } from "../ui/EditableTextareaField";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { Pill } from "@/app/(buyer)/review-offer/_components/Pill";

interface PersonalPropertyEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
}

function toPills(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function PersonalPropertyEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
}: PersonalPropertyEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });
  const includedPills = toPills(values.personalPropertyIncluded);
  const removedPills = toPills(values.itemsToBeRemoved);

  return (
    <EditableCard
      title="Personal Property"
      icon={<Archive size={18} />}
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
              Included items
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {includedPills.length > 0 ? (
                includedPills.map((item) => <Pill key={item}>{item}</Pill>)
              ) : (
                <span className="text-sm text-muted-foreground">
                  None specified
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#594139]">
              Items to be removed
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {removedPills.length > 0 ? (
                removedPills.map((item) => <Pill key={item}>{item}</Pill>)
              ) : (
                <span className="text-sm text-muted-foreground">
                  None specified
                </span>
              )}
            </div>
          </div>
        </div>
      }
      editContent={
        <div className="flex flex-col gap-5">
          <EditableTextareaField
            control={control}
            name="personalPropertyIncluded"
            label="Personal property included"
            placeholder="e.g. Refrigerator, Washer/Dryer..."
          />
          <EditableTextareaField
            control={control}
            name="itemsToBeRemoved"
            label="Items to be removed"
            placeholder="e.g. Broken shed, debris in basement..."
          />
        </div>
      }
    />
  );
}
