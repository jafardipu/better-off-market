import { AlertCircle, Search, BadgeCheck } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { EditableCard } from "../ui/EditableCard";
import { OriginalHint } from "../ui/OriginalHint";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OfferFormValues } from "@/lib/validations/offer-form";
import { RadioCardGroup } from "@/app/(buyer)/submit-offer/_components/RadioCardGroup";
import { ContingencyItem } from "@/app/(buyer)/review-offer/_components/ContingencyItem";
import { formatDays } from "../counter-offer-helpers";
import { SellerConcessionsIcon } from "@/icons";

interface ContingenciesEditableProps {
  originalValues: OfferFormValues;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onDone?: () => void;
  onCancel: () => void;
}

export function ContingenciesEditable({
  originalValues,
  isEditing,
  isChanged,
  onEdit,
  onDone,
  onCancel,
}: ContingenciesEditableProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control });

  return (
    <EditableCard
      title="Contingencies"
      icon={<SellerConcessionsIcon />}
      isEditing={isEditing}
      isChanged={isChanged}
      onEdit={onEdit}
      onDone={onDone}
      onCancel={onCancel}
      viewContent={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContingencyItem
            icon={<Search size={16} />}
            label="Inspection"
            value={formatDays(
              values.inspectionDays,
              values.inspectionContingency ?? "yes",
            )}
          />
          {/* <ContingencyItem
            icon={<BadgeCheck size={16} />}
            label="Appraisal"
            value={formatDays(
              values.appraisalDays,
              values.appraisalContingency ?? "yes",
            )}
          /> */}
        </div>
      }
      editContent={
        <div className="flex flex-col gap-5">
          <div>
            <FormLabel className="mb-2 block">Inspection contingency</FormLabel>
            <Controller
              control={control}
              name="inspectionContingency"
              render={({ field }) => (
                <RadioCardGroup
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={[
                    {
                      value: "yes",
                      title: "Yes — inspection required",
                      subtitle: "Standard 7–10 day window",
                    },
                    {
                      value: "no",
                      title: "No — waiving inspection",
                      subtitle: "Strengthens offer position",
                    },
                  ]}
                />
              )}
            />
            <OriginalHint
              value={formatDays(
                originalValues.inspectionDays,
                originalValues.inspectionContingency,
              )}
            />
          </div>

          <FormField
            control={control}
            name="inspectionDays"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Days for inspections</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    disabled={values.inspectionContingency !== "yes"}
                    className="border border-primary-border-color bg-[#F2F4F6] py-5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="mb-2 block">Appraisal</FormLabel>
            <Controller
              control={control}
              name="appraisalContingency"
              render={({ field }) => (
                <RadioCardGroup
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={[
                    {
                      value: "yes",
                      title: "Yes",
                      subtitle:
                        "Likely required for Hard Money and Conventional financing",
                    },
                    {
                      value: "no",
                      title: "No — waiving inspection",
                      subtitle: "Strengthens offer position",
                    },
                  ]}
                />
              )}
            />
            {/* <OriginalHint
              value={formatDays(
                originalValues.appraisalDays,
                originalValues.appraisalContingency,
              )}
            /> */}
          </div>

          {/* <FormField
            control={control}
            name="appraisalDays"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Days for Appraisal</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    disabled={values.appraisalContingency !== "yes"}
                    className="border border-primary-border-color bg-[#F2F4F6] py-5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
      }
    />
  );
}
