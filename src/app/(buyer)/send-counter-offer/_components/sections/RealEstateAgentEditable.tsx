import { Controller, useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { EditableTextField } from "../ui/EditableTextField";
import { OriginalHint } from "../ui/OriginalHint";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { formatOrDash } from "../counter-offer-helpers";
import { SummaryField } from "@/app/(buyer)/review-offer/_components/SummaryField";
interface RealEstateAgentEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
}

export function RealEstateAgentEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
}: RealEstateAgentEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });
  const isWorkingWithAgent = values.hasAgent === "yes";

  return (
    <EditableCard
      title="Real Estate Agent"
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SummaryField
            label="Agent name"
            value={formatOrDash(values.agentName)}
          />
          <SummaryField
            label="Commission"
            value={formatOrDash(values.commission)}
          />
        </div>
      }
      editContent={
        <div className="flex flex-col gap-5">
          <div>
            <FormLabel className="mb-2 block">
              Are you working with a Real Estate Agent?
            </FormLabel>
            <Controller
              control={control}
              name="hasAgent"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  className="flex items-center gap-6"
                >
                  <Label
                    htmlFor="rea-hasAgent-yes"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <RadioGroupItem value="yes" id="rea-hasAgent-yes" />
                    Yes
                  </Label>
                  <Label
                    htmlFor="rea-hasAgent-no"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <RadioGroupItem value="no" id="rea-hasAgent-no" />
                    No
                  </Label>
                </RadioGroup>
              )}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-x-6 gap-y-5 sm:grid-cols-2">
            <EditableTextField
              control={control}
              name="agentName"
              label="Agent Name"
              originalValue={formatOrDash(originalValues.agentName)}
            />
            <EditableTextField
              control={control}
              name="brokerageName"
              label="Brokerage Name"
              originalValue={formatOrDash(originalValues.brokerageName)}
            />
            <EditableTextField
              control={control}
              name="commission"
              label="Commission ($ or %)"
              placeholder="e.g. 3% or 5000"
              originalValue={formatOrDash(originalValues.commission)}
            />
            <div>
              <FormLabel>Paid By</FormLabel>
              <Controller
                control={control}
                name="paidBy"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={!isWorkingWithAgent}
                    className="mt-2 flex items-center gap-6"
                  >
                    <Label
                      htmlFor="rea-paidBy-buyer"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <RadioGroupItem value="buyer" id="rea-paidBy-buyer" />
                      Buyer
                    </Label>
                    <Label
                      htmlFor="rea-paidBy-seller"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <RadioGroupItem value="seller" id="rea-paidBy-seller" />
                      Seller
                    </Label>
                  </RadioGroup>
                )}
              />
              <OriginalHint
                value={
                  originalValues.paidBy === "buyer"
                    ? "Buyer"
                    : originalValues.paidBy === "seller"
                      ? "Seller"
                      : "—"
                }
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
