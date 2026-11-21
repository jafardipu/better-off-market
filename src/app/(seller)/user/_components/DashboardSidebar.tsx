"use client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  HousePlus,
  Receipt,
  ChartNoAxesCombined,
  User,
  Lock,
  BadgeDollarSign,
  Heart,
  CalendarCheck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const path = pathname?.split("/")[2] ?? "";
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.refresh();
  };

  const SIDEBAR_LINKS = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      href: "/user/dashboard",
    },
    {
      key: "my-listings",
      label: "My Listings",
      icon: <HousePlus size={22} />,
      href: "/user/my-listings",
    },
    {
      key: "my-offers ",
      label: "My Offers",
      icon: <BadgeDollarSign size={22} />,
      href: "/user/my-offers",
    },
    {
      key: "offers-received",
      label: "Offers Received",
      icon: <Receipt size={22} />,
      href: "/user/offers-received",
    },
    {
      key: "rsvps",
      label: "Open House RSVPs",
      icon: <CalendarCheck size={22} />,
      href: "/user/rsvps",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: <ChartNoAxesCombined size={22} />,
      href: "/user/analytics",
    },
    {
      key: "saved-properties",
      label: "Saved Properties",
      icon: <Heart size={22} />,
      href: "/user/save-properties",
    },
    {
      key: "edit-profile",
      label: "Edit Profile",
      icon: <User size={22} />,
      href: "/user/edit-profile",
    },
    {
      key: "change-password",
      label: "Change Password",
      icon: <Lock size={22} />,
      href: "/user/change-password",
    },
  ];

  const isActive = (href: string) =>
    pathname === href || (path && href.includes(path));

  return (
    <>
      {/* ---------- Large devices: fixed vertical sidebar ---------- */}
      <div className="hidden xl:block sticky top-0 self-start max-h-screen overflow-y-auto border-r-2 border-[#ECEEF0] pr-4 h-full">
        <div className="dashboard-card w-64 bg-white py-5">
          <div className="space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <Link
                href={link.href}
                key={link.key}
                className={cn(
                  "flex items-center gap-x-3 px-5 py-3 text-gray-scale-600 transition-all duration-300 ease-in-out text-sm",
                  isActive(link.href) &&
                    "border-l-4 border-l-primary-color bg-primary-color rounded-xl text-base text-white",
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-x-3 px-5 py-4 text-base text-[#BA1A1A]"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
            <div className="border border-b border-[#ECEEF0] mt-5"></div>
          </div>
        </div>
      </div>

      {/* ---------- Medium/small devices: horizontal carousel nav ---------- */}
      <div className="xl:hidden sticky top-0 z-10 border-b-2 border-[#ECEEF0] bg-white py-3 mb-2">
        <Carousel
          opts={{
            loop: false,
            align: "start",
            dragFree: true,
          }}
          className="relative px-10"
        >
          <CarouselContent className="-ml-2">
            {SIDEBAR_LINKS.map((link) => (
              <CarouselItem key={link.key} className="basis-auto pl-2">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-x-2 whitespace-nowrap rounded-full border border-[#ECEEF0] px-4 py-2 text-sm text-gray-scale-600 transition-all duration-300 ease-in-out",
                    isActive(link.href) &&
                      "bg-primary-color border-primary-color text-white",
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </CarouselItem>
            ))}

            <CarouselItem className="basis-auto pl-2">
              <button
                onClick={() => handleLogout()}
                type="button"
                className="flex items-center gap-x-2 whitespace-nowrap rounded-full border border-[#BA1A1A]/30 px-4 py-2 text-sm text-[#BA1A1A]"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious className="left-0 top-1/2 -translate-y-1/2 size-8 border-none bg-primary-color hover:bg-primary-color/80 text-white shadow-md hover:text-white disabled:opacity-0 disabled:pointer-events-none cursor-pointer" />
          <CarouselNext className="right-0 top-1/2 -translate-y-1/2 size-8 border-none bg-primary-color hover:bg-primary-color/80 text-white shadow-md hover:text-white disabled:opacity-0 disabled:pointer-events-none cursor-pointer" />
        </Carousel>
      </div>
    </>
  );
}