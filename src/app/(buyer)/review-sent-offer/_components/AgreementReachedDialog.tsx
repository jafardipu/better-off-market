"use client";

import { PartyPopper, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AgreementReachedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyAddress: string;
}

/**
 * Shown to the buyer right after they accept an offer. The backend also
 * sends the same message to their notifications (see the accept-offer API).
 */
export function AgreementReachedDialog({
  open,
  onOpenChange,
  propertyAddress,
}: AgreementReachedDialogProps) {
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
            Congratulations! You&apos;ve Reached an Agreement!
          </DialogTitle>
          <DialogDescription className="text-base font-semibold text-primary-black">
            Congratulations on reaching an agreement to purchase{" "}
            {propertyAddress}!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-primary-gray">
          <p>
            Now that both parties have agreed to the terms, the next step is to
            prepare and execute a formal purchase agreement outlining the
            agreed-upon terms and conditions.
          </p>
          <p>
            Once the agreement is signed by both parties, notify a trusted
            title company to begin coordinating the closing process and
            handling the necessary next steps.
          </p>
          <p className="font-semibold text-primary-black">
            This is your first step toward closing. Congratulations again!
          </p>
        </div>

        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full bg-primary-color hover:bg-primary-color/90 text-white font-semibold py-5.5 rounded-lg cursor-pointer mt-2"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
