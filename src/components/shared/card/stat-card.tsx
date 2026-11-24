import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ElementType } from "react";

interface StatItem {
  label: string;
  value: number | string;
  icon: ElementType;
  loading?: boolean;
  /** When set, the whole card links to this route. */
  href?: string;
}

export function StatsCard({ data }: { data: StatItem }) {
  const { icon: Icon, label, value, loading, href } = data;

  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-primary-gray  mb-2">{label}</p>
        {loading ? (
          <Skeleton className="w-24 h-9 bg-gray-300" />
        ) : (
          <p className="text-3xl font-bold text-primary-black">{value}</p>
        )}
      </div>
      <Icon className="w-6 h-6 text-primary-color" />
    </div>
  );

  const cardClass =
    "block bg-white rounded-lg border border-primary-border-color p-6 shadow-sm hover:shadow-md transition-shadow";

  if (!href) return <div className={cardClass}>{content}</div>;

  return (
    <Link
      href={href}
      className={cn(
        cardClass,
        "cursor-pointer transition-[box-shadow,border-color] hover:border-primary-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color focus-visible:ring-offset-2",
      )}
    >
      {content}
    </Link>
  );
}
