"use client";
import { priceFormatter } from "@/components/shared/utils/priceFormatter";
import RecentOffersTableSkeleton from "@/components/skeleton/RecentOffersTableSkeleton";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty-data";
import { getOfferStatusBadge } from "@/components/utils/getOfferStatusBadge";
import { useGetMyReceivedOffersQuery } from "@/redux/api/offerApi";
import { IOffer, IUser } from "@/types";
import moment from "moment";
import Link from "next/link";

interface offer {
  id: string;
  buyer: string;
  location: string;
  amount: string;
  time: string;
  status: "NEW" | "ACCEPTED";
  action: string;
  actionType: "review" | "message";
}

export default function RecentOffers() {
  const { data, isLoading } = useGetMyReceivedOffersQuery({ limit: 5 });

  const OffersData = data?.data || [];

  if (isLoading) return <RecentOffersTableSkeleton />;

  if (!data?.meta?.total)
    return <Empty message="No offers found" className="mt-8" />;

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block  rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F4F6] border-b">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-primary-gray">
                Buyer
              </th>
              <th className="px-6 py-3 text-left font-bold text-primary-gray">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-bold text-primary-gray">
                Time
              </th>
              <th className="px-6 py-3 text-left font-bold text-primary-gray">
                Status
              </th>
              <th className="px-6 py-3 text-left font-bold text-primary-gray">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {OffersData?.map((offer: IOffer) => (
              <tr
                key={offer?._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/seller-profile?seller=${offer?.buyer?._id}`}
                  >
                    <div className="font-semibold text-primary-black">
                      {(offer?.buyer as IUser)?.name}
                    </div>
                  </Link>

                  <Link
                    href={`/seller-profile?seller=${offer?.buyer?._id}`}
                  >
                    <div className="text-sm text-primary-gray line-clamp-1 max-w-70">
                      {(offer?.buyer as IUser)?.company ||
                        (offer?.buyer as IUser)?.location}{" "}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 font-semibold text-primary-black">
                  {priceFormatter.format(Number(offer?.currentTerms?.offerAmount))}
                </td>
                <td className="px-6 py-4 text-primary-gray truncate">
                  {moment(offer?.createdAt).fromNow()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full $`}
                  >
                    {getOfferStatusBadge(offer?.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/user/offers-received/${offer?._id}`}>
                    <Button
                      variant="ghost"
                      className={`text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto font-bold cursor-pointer`}
                    >
                      Review
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {OffersData?.map((offer: IOffer) => (
          <div
            key={offer?._id}
            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <Link
                  href={`/seller-profile?seller=${offer?.buyer?._id}`}
                >
                  <h3 className="font-semibold text-primary-black">
                    {(offer?.buyer as IUser)?.name}
                  </h3>
                </Link>
                <Link
                  href={`/seller-profile?seller=${offer?.buyer?._id}`}
                >
                  <p className="text-sm text-primary-gray line-clamp-1">
                    {(offer?.buyer as IUser)?.company ||
                      (offer?.buyer as IUser)?.location}{" "}
                  </p>
                </Link>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold `}
              >
                {getOfferStatusBadge(offer?.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-gray">Amount</span>
                <span className="font-semibold text-primary-black">
                  {offer?.currentTerms?.offerAmount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-gray">Time</span>
                <span className="text-sm text-primary-black">
                  {moment(offer?.createdAt).fromNow()}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold cursor-pointer"
            >
              Review
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
