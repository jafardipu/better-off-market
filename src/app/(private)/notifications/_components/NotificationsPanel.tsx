"use client";
import { cn } from "@/lib/utils";
import {
  useGetNotificationQuery,
  useReadNotificationMutation,
} from "@/redux/api/notificationApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { NotificationsSkeleton } from "./NotificationsSkeleton";
import moment from "moment";
import PaginationSection from "@/components/shared/pagination/PaginationSection";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface INotification {
  _id: string;
  message: string;
  description: string;
  read: boolean;
  link: string;
  createdAt: string;
}
interface NotificationsPanelProps {
  notifications?: Notification[];
  className?: string;
}

export default function NotificationsPanel({
  className,
}: NotificationsPanelProps) {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "10";

  const queries: Record<string, string | number> = { page, limit };
  const { data, isLoading } = useGetNotificationQuery(queries);
  const [makeRedNotification] = useReadNotificationMutation();

  const notifications = data?.data;

  useEffect(() => {
    makeRedNotification({});
  }, []);

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div
      className={cn(
        "rounded-3xl border border-[#C4C7C780] bg-white ",
        className,
      )}
    >
      <div className="space-y-4">
        {notifications.map((notification: INotification) => (
          <Link
            key={notification?._id}
            href={notification?.link ? `${notification?.link}` : `#`}
            className="block"
          >
            <div
              key={notification?._id}
              className="rounded-2xl border border-[#C4C7C780] md:px-5 px-3 py-4"
            >
              <div className=" flex justify-between gap-1.5">
                <p className="text-sm font-semibold text-gray-scale-900">
                  {notification?.message}
                </p>

                <Tooltip>
                  <TooltipTrigger>
                    <p className="mt-1 text-xs text-primary-gray">
                      {moment(notification?.createdAt).fromNow()}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {moment(notification?.createdAt).format("MM-DD-YYYY h:mm A")}
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* pre-line keeps paragraph breaks in long messages (e.g. the
                  buyer's "You've Reached an Agreement" notification). */}
              <p className="mt-1 text-xs text-primary-gray whitespace-pre-line">
                {notification?.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {data?.meta?.total > Number(limit) && (
        <PaginationSection
          total={data?.meta?.total}
          current={Number(page)}
          pageSize={Number(limit)}
        />
      )}
    </div>
  );
}
