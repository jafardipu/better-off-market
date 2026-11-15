import { IReview } from "@/types";
import Empty from "@/components/ui/empty-data";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ImageWithFallback from "@/components/shared/image/ImageWithFallback";
import moment from "moment";
import ReadMoreText from "@/components/shared/utils/ReadMoreText";

interface ReviewListProps {
  reviews: IReview[];
  hasMore: boolean;
  isFetchingMore: boolean;
  onSeeMore: () => void;
}

export function SellerReviewList({
  reviews,
  hasMore,
  isFetchingMore,
  onSeeMore,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return <Empty message="No reviews yet." className="mt-16" />;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="rounded-md bg-white p-6 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {review.user?.profile ? (
                <ImageWithFallback
                  src={review.user.profile}
                  alt={review.user.name}
                  width={44}
                  height={44}
                  className="size-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-primary-gray">
                  {getInitials(review.user?.name ?? "U")}
                </div>
              )}
              <div>
                <p className="font-semibold text-primary-black">
                  {review.user?.name ?? "Anonymous"}
                </p>
                <p className="text-sm text-[#594139] font-semibold">
                  {moment(review.createdAt).format("MM-DD-YYYY")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={i <= review.rating} />
              ))}
            </div>
          </div>
          <p className="mt-4 text-[#594139] text-lg">
            <ReadMoreText text={review.review} wordLimit={50} />
          </p>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSeeMore}
            disabled={isFetchingMore}
            className="min-w-32 cursor-pointer"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading...
              </>
            ) : (
              "See more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#fb923c" : "#e5e7eb"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
