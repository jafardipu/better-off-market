"use client";
import { AppDialog } from "@/components/shared/dialog/AppDialog";
import ReportSellerDialog from "@/components/shared/dialog/ReportSellerDialog";
import ImageWithFallback from "@/components/shared/image/ImageWithFallback";
import Preview from "@/components/shared/utils/image_preview_option";
import ImagePreviewer from "@/components/shared/utils/images-previewer";
import ReadMoreText from "@/components/shared/utils/ReadMoreText";
import SellerProfileSkeleton from "@/components/skeleton/seller-profile-skeleton";
import { Button } from "@/components/ui/button";
import Empty from "@/components/ui/empty-data";
import { cn } from "@/lib/utils";
import { useGetSellerProfileQuery } from "@/redux/api/profileApi";
import { useAppSelector } from "@/redux/hooks";
import { OctagonAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SellerProfileCard() {
  const [previewImgIndex, setPreviewImgIndex] = useState(-1);
  const sellerId = useSearchParams().get("seller");
  const { data, isLoading } = useGetSellerProfileQuery(sellerId, {
    skip: !sellerId,
  });
  const loggedInUser: any = useAppSelector((state) => state.auth.user);
  const user = data?.data;
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const router = useRouter();
  const pathName = usePathname();

  if (isLoading) return <SellerProfileSkeleton />;

  if (!user) {
    return <Empty message="Seller profile not found" className="mt-16" />;
  }

  return (
    <>
      <div className="rounded-lg bg-white p-5 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
        <div className="flex flex-col items-center md:items-start gap-5 sm:flex-row lg:gap-8">
          {/* Avatar */}
          <Preview onClick={() => setPreviewImgIndex(0)}>
          <ImageWithFallback
            src={user?.profile || "/default_user_profile.png"}
            alt={"seller profile avatar"}
            width={1200}
            height={1200}
            className="size-32 shrink-0 rounded-lg object-cover sm:size-36 lg:size-40"
          />
          </Preview>

          {/* Info */}
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <h2 className=" font-semibold text-primary-black text-2xl">
                {user?.name}
              </h2>
              {user?.company && (
                <h5 className="text-xl font-medium text-gray-900 mt-0.5">
                  {user?.company}
                </h5>
              )}
              {user?.bio && (
                <p className="mt-0.5 text-lg text-[#594139]">
                  <ReadMoreText text={user?.bio} wordLimit={50} />
                </p>
              )}
            </div>

            <div>
              {/* Divider */}
              <div className="mb-3 border-t border-gray-200 sm:my-5" />

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 sm:gap-x-16">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#594139]">
                    ACTIVE LISTINGS
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary-blue">
                    {user?.activeListing}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#594139]">
                    TOTAL LISTED
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary-blue">
                    {user?.totalListing}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#594139]">
                    AVG RATING
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xl font-semibold text-primary-blue text-primary-black sm:text-xl">
                    {user?.avgRating?.toFixed(1)}{" "}
                    <span className="text-primary-blue">★</span>
                  </p>
                </div>
                <div
                  className={cn(user?._id === loggedInUser?.userId && "hidden")}
                >
                  <Link href={`/message?user=${user?._id}`}>
                    <Button className="lg:px-10 px-5 py-5 cursor-pointer">
                      Message Seller
                    </Button>
                  </Link>
                </div>
                {!loggedInUser?.userId ? (
                  <div
                    onClick={() => setOpenAuthModel(true)}
                    className={cn(
                      "flex items-center text-[#BA1A1A] gap-1 text-xl cursor-pointer",
                    )}
                  >
                    <OctagonAlert size="20" /> Report this seller
                  </div>
                ) : (
                 (user?._id === loggedInUser?.userId) || (
                    <ReportSellerDialog
                      sellerName={user?.name}
                      sellerId={user?._id}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppDialog
        open={openAuthModel}
        onOpenChange={setOpenAuthModel}
        title="Sign in to continue"
        description="Log in to your account to report this seller"
        actions={[
          {
            label: "Cancel",
            variant: "outline",
            onClick: () => setOpenAuthModel(false),
          },
          {
            label: "Login",
            onClick: () =>
              router.push(
                `/login?callbackUrl=${`${pathName}?seller=${user?._id}`}`,
              ),
          },
        ]}
      />
      { user?.profile && <>
        <ImagePreviewer
          imageUrls={[user?.profile]}
          previewImgIndex={previewImgIndex}
          setPreviewImgIndex={setPreviewImgIndex}
        />
      </>}
    </>
  );
}
