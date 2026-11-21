"use client";

import { AppDialog } from "@/components/shared/dialog/AppDialog";
import { errorModification } from "@/lib/errors/errorModification";
import { cn } from "@/lib/utils";
import { useGetMyRsvpsQuery, useIncreaseRSVPCountMutation } from "@/redux/api/propertiesApi";
import { useAppSelector } from "@/redux/hooks";
import { IOpenHouseRsvp } from "@/types";
import { IApiResponse } from "@/types/api-response";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RSVPHereButton({
  id,
  sellerId,
}: {
  id: string;
  sellerId: string;
}) {
  const user: any = useAppSelector((state) => state.auth.user);
  const [openRSVP, setOpenRSVP] = useState(false);
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [createRSVP, { isLoading }] = useIncreaseRSVPCountMutation();
  const [justSent, setJustSent] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const isOwnListing = Boolean(user?.userId && user.userId === sellerId);
  const { data: sentRsvps } = useGetMyRsvpsQuery("buyer", {
    skip: !user?.userId || isOwnListing,
  });
  const alreadyInterested =
    justSent ||
    ((sentRsvps as IApiResponse<IOpenHouseRsvp[]> | undefined)?.data ?? []).some(
      (rsvp) => rsvp.property?._id === id,
    );

  const handleRSVP = async () => {
    try {
      if (!user?.userId) {
        setOpenAuthModel(true);
        return;
      }
      if (isLoading) return;
      await createRSVP(id).unwrap();
      setJustSent(true);
      toast.success("You have RSVP successfully confirmed!");
      setOpenRSVP(false);
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };
  return (
    <>
      <button
        className={cn(
          "w-full rounded-md bg-white py-3 text-base text-primary-blue transition-opacity hover:opacity-90 cursor-pointer text-primary-color font-semibold",
          (isOwnListing || alreadyInterested) &&
            "disabled:cursor-not-allowed disabled:opacity-80",
        )}
        onClick={() => {
          if (alreadyInterested) return;
          if (!user?.userId) {
            setOpenAuthModel(true);
            return;
          }
          setOpenRSVP(true);
        }}
        disabled={isOwnListing || alreadyInterested}
      >
        {alreadyInterested ? "Already interested" : "RSVP Here"}
      </button>
      <AppDialog
        open={openRSVP}
        onOpenChange={setOpenRSVP}
        title="RSVP Here"
        description="You are about to RSVP here. Are you sure you want to continue?"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenRSVP(false),
          },
          {
            label: "Confirm",
            onClick: () => handleRSVP(),
          },
        ]}
      />

      <AppDialog
        open={openAuthModel}
        onOpenChange={setOpenAuthModel}
        title="Sign in to continue"
        description="Log in to your account to RSVP for the open house"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenAuthModel(false),
          },
          {
            label: "Login",
            onClick: () => router.push(`/login?callbackUrl=${`${pathName}`}`),
          },
        ]}
      />
    </>
  );
}
