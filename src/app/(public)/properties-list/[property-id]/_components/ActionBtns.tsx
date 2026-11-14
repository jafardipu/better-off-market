"use client";

import FavoriteIcon from "@/components/shared/favorite_icon/FavoriteIcon";
import Share from "@/components/utils/share";
import { Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { cn } from "@/lib/utils";
import { IUser, TPropertyStatus } from "@/types";

export function ActionBtns({
  id,
  totalViews,
  createdAt,
  seller,
  status,
  approvedDate,
  image,
  listingLabel,
}: {
  id: string;
  totalViews: number;
  createdAt: string;
  seller: IUser;
  status: TPropertyStatus;
  approvedDate?: string;
  image?: string;
  listingLabel?: string;
}) {
  const pathName = usePathname();
  const user: any = useAppSelector((state) => state.auth.user);
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto rounded-lg bg-white lg:p-6 p-4 shadow-[0_20px_50px_0_rgba(15,23,42,0.10)] border border-[#FAEEEA] space-y-4",
        seller?._id === user?.userId && "hidden",
        (status === "Sold" || status === "Rejected") && "hidden",
      )}
    >
      <h2 className="lg:text-2xl text-xl font-bold text-black">
        Interested in this property?
      </h2>

      {/* Submit an offer button */}
      <Link href={`/submit-offer?property=${id}`} className="block">
        <button className="w-full cursor-pointer bg-primary-color hover:bg-primary-color/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
          Submit an offer
        </button>
      </Link>

      {/* Message seller button */}
      <Link href={`/message?user=${seller?._id}`} className="block">
        <button className="w-full cursor-pointer bg-[#2D3133] hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
          Message seller
        </button>
      </Link>

      <div className="flex gap-2.5">
        <div className="flex-1">
          {/* Share This Listing button */}
          <Share
            title="Better Off Market listing"
            link={pathName}
            image={image}
            listingLabel={listingLabel}
          >
            <button
              type="button"
              className="w-full border-2 border-primary-gray hover:border-gray-400 hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 duration-500 cursor-pointer"
            >
              <Share2 size={20} />
              Share
            </button>
          </Share>
        </div>

        {/* Save property button */}

        <FavoriteIcon id={id} isBtnType={true} />
      </div>

      <div className="flex gap-1.5 justify-center">
        <span className="text-[#594139] flex items-center gap-1 ">
          <Eye size={22} /> {totalViews} Views,
        </span>
        <span className="text-[#594139] flex items-center gap-1 ">
          Listed {moment( approvedDate || createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
}
