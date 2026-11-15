import ImageWithFallback from "@/components/shared/image/ImageWithFallback";
import PaginationSection from "@/components/shared/pagination/PaginationSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty-data";
import { IOffer } from "@/types";
import { IApiResponse } from "@/types/api-response";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import OfferListCardSkeleton from "@/components/skeleton/OfferListCardSkeleton";
import { AppDialog } from "@/components/shared/dialog/AppDialog";
import { useState } from "react";
import { useWithdrawOfferMutation } from "@/redux/api/offerApi";
import { toast } from "sonner";
import { errorModification } from "@/lib/errors/errorModification";
import { getOfferStatusBadge } from "@/components/utils/getOfferStatusBadge";
import { priceFormatter } from "@/components/shared/utils/priceFormatter";

export default function OfferList({
  data,
  limit,
  page,
  loading,
}: {
  data: IApiResponse<IOffer[]>;
  limit: number;
  page: number;
  loading: boolean;
}) {
  const [openWithdrawModel, setOpenWithdrawModel] = useState(false);
  const [withdrawId, setWithdrawId] = useState("");
  const [withdrawOfferer] = useWithdrawOfferMutation();
  if (loading)
    return (
      <div className="md:space-y-6 space-y-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <OfferListCardSkeleton key={index} />
        ))}
      </div>
    );

  if (!data?.meta?.total)
    return <Empty message="No offers found" className="mt-16" />;

  const offers = data?.data || [];

  const handleStatusAction = (status: string, id: string) => {
    switch (status) {
      case "pending":
        return (
          <Button
            onClick={() => {
              setWithdrawId(id);
              setOpenWithdrawModel(true);
            }}
            variant={"outline"}
            className="cursor-pointer border border-gray-400 rounded-md px-4"
          >
            Withdraw
          </Button>
        );
    }
  };

  const handleWithdrawOffer = async () => {
    toast.loading("Withdrawing offer...", { id: "withdraw" });
    try {
      await withdrawOfferer(withdrawId).unwrap();
      toast.success("Offer withdrawn successfully!", { id: "withdraw" });
      setOpenWithdrawModel(false);
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage, { id: "withdraw" });
    }
  };

  return (
    <div className="w-full  space-y-4 mt-5">
      {offers.map((offer) => (
        <div
          key={offer?._id}
          className="border  rounded-lg p-6 bg-white hover:shadow-md transition-shadow border-primary-border-color"
        >
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
            <div className="flex-1 flex flex-col lg:flex-row  items-center  md:gap-6 gap-3">
              {/* Property Image */}
              <div className="shrink-0">
                <Link href={`/properties-list/${offer?.property?._id}`}>
                  <ImageWithFallback
                    width={96}
                    height={96}
                    src={offer?.property?.photos[0]}
                    alt={"property image"}
                    className="lg:w-32 w-36  h-24 rounded-lg object-cover"
                  />
                </Link>
              </div>

              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <div className="mt-4 grid md:grid-cols-4 grid-cols-2 items-center md:gap-4 gap-2 text-sm">
                  <Link href={`/properties-list/${offer?.property?._id}`}>
                    <h3 className="lg:text-xl text-xl font-semibold">
                      {offer?.property?.propertyType}
                    </h3>
                    <p className="text-sm font-medium text-primary-gray line-clamp-1">
                      {offer?.property?.streetAddress}, {offer?.property?.city},{" "}
                      {offer?.property?.state},{" "}
                    </p>
                  </Link>
                  <div>
                    <p className="text-primary-gray font-medium text-sm">
                      Submitted
                    </p>
                    <p className="text-gray-700 text-[16px]">
                      {moment(offer.currentTerms?.createdAt).format(
                        "MM-DD-YYYY",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-primary-gray font-medium text-sm">
                      Offer Amount
                    </p>
                    <p className="text-primary-color lg:text-2xl text-xl font-semibold">
                      {priceFormatter.format(offer?.currentTerms?.offerAmount)}
                    </p>
                  </div>
                  <div>{getOfferStatusBadge(offer.status)}</div>
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex flex-col  items-end gap-3">
              <div className="flex gap-2">
                {handleStatusAction(offer.status, offer._id)}

                <Link href={`/review-sent-offer?offer=${offer._id}`}>
                  <Button
                    variant={"outline"}
                    className="cursor-pointer border border-gray-400 bg-primary-color text-white px-4 rounded-md"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <PaginationSection
        total={data?.meta?.total}
        current={page}
        pageSize={limit}
      />

      <AppDialog
        open={openWithdrawModel}
        onOpenChange={setOpenWithdrawModel}
        title="Withdraw Offer"
        description="You are about to withdraw this offer. Are you sure you want to continue?"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenWithdrawModel(false),
          },
          {
            label: "Confirm",
            onClick: () => handleWithdrawOffer(),
          },
        ]}
      />
    </div>
  );
}
