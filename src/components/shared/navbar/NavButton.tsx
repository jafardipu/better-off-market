"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BellDotIcon, CirclePlus, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { MessageIcon, ProfileIcon } from "@/icons";
import { logout } from "@/redux/features/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetNotificationQuery } from "@/redux/api/notificationApi";
import { INotification } from "@/app/(private)/notifications/_components/NotificationsPanel";
import { useSocket } from "@/context/SocketContextApi";
import type { ChatListItem } from "@/app/(private)/message/_components/types";
import {
  CHAT_LIST_LIMIT,
  type SocketAck,
} from "@/app/(private)/message/_components/chatSocket";

export default function NavButton({
  setOpen,
  authPage = false,
}: {
  setOpen: (open: boolean) => void;
  authPage?: boolean;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isUnread, setIsUnread] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { socket } = useSocket();
  const userId = (user as { userId?: string } | null)?.userId;
  const { data: notificationData } = useGetNotificationQuery(undefined, {
    skip: !user,
    pollingInterval: user ? 15000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (notificationData) {
      const isUnreadNotification = notificationData?.data?.some(
        (notification: INotification) => notification.read !== true,
      );
      setIsUnread(Boolean(isUnreadNotification));
    }
  }, [notificationData]);

  useEffect(() => {
    if (!socket || !userId) {
      setHasUnreadMessages(false);
      return;
    }

    // Read the reply from the ack too: the "chat_list" event only reaches the
    // socket the server last stored for this user.
    const requestChatList = () => {
      socket.emit(
        "my_chat_list",
        { page: 1, limit: CHAT_LIST_LIMIT },
        (res?: SocketAck<{ chats?: ChatListItem[] }>) => {
          if (res?.success) handleChatList(res.data ?? {});
        },
      );
    };

    const handleChatList = (res: { chats?: ChatListItem[] }) => {
      const unread = (res?.chats ?? []).some(
        (item) =>
          (item.unreadMessageCount ?? 0) > 0 ||
          (Boolean(item.message) &&
            item.message?.seen !== true &&
            item.message?.sender !== userId),
      );
      setHasUnreadMessages(unread);
    };

    socket.on("chat_list", handleChatList);
    if (socket.connected) requestChatList();
    socket.on("connect", requestChatList);

    const interval = window.setInterval(requestChatList, 15000);
    const onFocus = () => requestChatList();
    window.addEventListener("focus", onFocus);

    return () => {
      socket.off("chat_list", handleChatList);
      socket.off("connect", requestChatList);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [socket, userId]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };
  return (
    <>
      <div className="hidden lg:flex gap-x-3">
        <Link href={"/user/my-listings/property-listing"}>
          <Button
            size={"lg"}
            className={cn(
              "bg-[#CEE3FF] hover:bg-[#CEE3FF]/85 text-[#1F4E8B] cursor-pointer px-4 rounded-full",
              authPage && "hidden",
            )}
          >
            List a Property{" "}
            <CirclePlus className="bg-primary-color rounded-full text-white" />{" "}
          </Button>
        </Link>
        {user ? (
          <div className="flex gap-x-3">
            <Link href="/save-properties">
              <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500  group">
                <Heart size={20} />
              </div>
            </Link>
            <Link href="/message">
              <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500 relative">
                <MessageIcon />
                {hasUnreadMessages && (
                  <div className="absolute top-1 right-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
            </Link>
            <Link href="/notifications">
              <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500 relative">
                <BellDotIcon size={20} />
                {isUnread && (
                  <div className="absolute top-1 right-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
            </Link>
            <Link href="/user/dashboard">
              <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500">
                <ProfileIcon />
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-x-3">
            <Link href="/login">
              <Button
                size={"lg"}
                className="bg-[#FFF] hover:bg-[#FFF]/70 text-black font-semibold cursor-pointer px-4 rounded-full"
              >
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size={"lg"}
                className="bg-primary-color hover:bg-[#1F4E8B]/85 text-white font-semibold cursor-pointer px-4 rounded-full"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* mobile nav */}
      <div className="lg:hidden ">
        <div className="flex flex-col gap-3 px-4 mt-8">
          <Link href={"/user/my-listings/property-listing"}>
            <Button
              size={"lg"}
              onClick={() => setOpen(false)}
              className="bg-[#CEE3FF] hover:bg-[#CEE3FF]/85 text-[#1F4E8B] cursor-pointer px-4 rounded-full w-full"
            >
              List a Property{" "}
              <CirclePlus className="bg-primary-color rounded-full text-white" />
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center justify-center gap-x-3">
              <Link href="/save-properties">
                <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500  group">
                  <Heart size={20} />
                </div>
              </Link>
              <Link href="/message">
                <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500 relative">
                  <MessageIcon />
                  {hasUnreadMessages && (
                    <div className="absolute top-1 right-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </Link>
              <Link href="/notifications">
                <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500 relative">
                  <BellDotIcon size={20} />
                  {isUnread && (
                    <div className="absolute top-1 right-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </Link>
              <Link href="/user/dashboard">
                <div className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500">
                  <ProfileIcon />
                </div>
              </Link>

              <div
                onClick={handleLogout}
                className="size-10 flex-center bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 hover:scale-105  cursor-pointer rounded-full duration-500"
              >
                <LogOut size={20} color="red" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block"
              >
                <Button
                  size={"lg"}
                  className="bg-[#F3F4F6] hover:bg-[#F3F4F6]/70 text-black font-semibold cursor-pointer px-4 rounded-full w-full"
                >
                  Login
                </Button>
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="block"
              >
                <Button
                  size={"lg"}
                  className="bg-primary-color hover:bg-[#1F4E8B]/85 text-white font-semibold cursor-pointer px-4 rounded-full w-full"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
