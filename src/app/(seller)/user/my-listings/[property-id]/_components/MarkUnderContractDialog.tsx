"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PartyPopper, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "@/icons";
import { cn } from "@/lib/utils";
import { errorModification } from "@/lib/errors/errorModification";
import { useMarkUnderContractMutation } from "@/redux/api/propertyContractApi";
import { formatDateUS } from "@/utils/formatDateUS";
import { TPropertyStatus } from "@/types";

// Every field is optional: the client asked that sellers can submit
// without filling anything in. Only length limits are enforced.
const contractDetailsSchema = z.object({
  buyerName: z.string().trim().max(120, "Buyer name is too long"),
  closingDate: z.string(),
  titleCompany: z.string().trim().max(150, "Title company is too long"),
});

type ContractDetailsValues = z.infer<typeof contractDetailsSchema>;

const inputClass =
  "border-[#F3B896] focus-visible:border-[#1F4E8B] focus-visible:ring-[#1F4E8B]/20 py-5";

// Native date input with its text hidden, so the overlay below can show
// the value in the site's US format (MM-DD-YYYY) — same as the Open House dialog.
const maskedDateClass = cn(
  inputClass,
  "text-transparent caret-transparent [&::-webkit-datetime-edit]:text-transparent",
);

interface MarkUnderContractDialogProps {
  propertyId: string;
  currentStatus: TPropertyStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the status change succeeds, to refresh the listing. */
  onUpdated: () => Promise<void> | void;
}

export function MarkUnderContractDialog({
  propertyId,
  currentStatus,
  open,
  onOpenChange,
  onUpdated,
}: MarkUnderContractDialogProps) {
  const [markUnderContract, { isLoading }] = useMarkUnderContractMutation();

  const form = useForm<ContractDetailsValues>({
    resolver: zodResolver(contractDetailsSchema),
    defaultValues: { buyerName: "", closingDate: "", titleCompany: "" },
  });

  const handleSubmit = async (values: ContractDetailsValues) => {
    try {
      // Blank fields become undefined so they're left out of the request body.
      await markUnderContract({
        propertyId,
        buyerName: values.buyerName || undefined,
        closingDate: values.closingDate || undefined,
        titleCompany: values.titleCompany || undefined,
      }).unwrap();

      toast.success("Your property is now marked Under Contract.");
      onOpenChange(false);
      form.reset();
      await onUpdated();
    } catch (error) {
      toast.error(errorModification(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <DialogClose className="absolute right-5 top-5 rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
          <X className="size-5 text-primary-black" />
        </DialogClose>

        <DialogHeader className="items-center text-center gap-2 border-b border-[#F3B896]/60 pb-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#0076AC]/10">
            <PartyPopper className="size-6 text-[#0076AC]" />
          </span>
          <DialogTitle className="text-2xl font-bold text-primary-color">
            Congratulations!
          </DialogTitle>
          <p className="text-base font-semibold text-primary-black">
            Your Property Is Under Contract!
          </p>
          <DialogDescription className="text-sm text-primary-gray">
            We&apos;re excited to hear you&apos;ve reached an agreement! Before
            updating your listing status, please provide a few details about
            the transaction below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-primary-black">
              Contract Details
            </h3>

            <FormField
              control={form.control}
              name="buyerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary-black">
                    1. Buyer Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter buyer name"
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary-black">
                    2. Anticipated Closing Date
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="date"
                        // Closing can't be in the past; local date, not UTC.
                        min={format(new Date(), "yyyy-MM-dd")}
                        className={maskedDateClass}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute inset-y-0 left-3 right-8 flex items-center text-sm",
                          field.value ? "text-primary-black" : "text-primary-gray",
                        )}
                      >
                        {field.value
                          ? formatDateUS(field.value)
                          : "Select closing date"}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary-black">
                    3. Title Company
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter title company"
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-color hover:bg-primary-color/90 text-white font-semibold py-5.5 rounded-lg cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <LoaderIcon className="animate-spin" />
                  Updating...
                </span>
              ) : (
                "Submit & Update Status"
              )}
            </Button>

            <p className="text-center text-xs text-primary-gray">
              Upon submission, your property&apos;s status will change from{" "}
              {currentStatus} to Under Contract on BetterOffMarket.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
