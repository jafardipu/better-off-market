import { CheckCheck } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AttachmentGrid from "./AttachmentGrid";
import PropertyReference from "./PropertyReference";
import type { ChatMessage } from "./types";

type Props = {
  message: ChatMessage;
  userId?: string;
  showTimestamp: boolean;
};

export default function MessageBubble({ message, userId, showTimestamp }: Props) {
  const isMe = message.sender === userId;
  const hasImages = (message.imageUrl?.length ?? 0) > 0;
  const time = message.createdAt ? format(new Date(message.createdAt), "h:mm a") : "";

  return (
    <div className={cn("flex flex-col  ", isMe ? "items-end" : "items-start")}>
      {showTimestamp && (
        <span className="mb-1 px-1 text-xs text-slate-400">{time}</span>
      )}

      {hasImages && (
        <AttachmentGrid urls={message.imageUrl ?? []} align={isMe ? "end" : "start"} />
      )}

      {message.text && (
        <div className="relative ">
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed ",
              isMe
                ? "bg-primary-color text-white rounded-br-md"
                : "bg-[#ECEEF0] text-primary-black rounded-bl-md",
              isMe && message.seen && "pr-7",
              message._isPending && "opacity-60",
            )}
          >
            {message.propertyInfo?.address ? (
              <Link
                href={`/properties-list/${message.propertyInfo._id}`}
                className="mb-2 flex max-w-xs rounded-lg bg-white px-2 py-2"
              >
                <PropertyReference property={message.propertyInfo} />
              </Link>
            ) : null}
            {message.text}
          </div>

          {isMe && message.seen && (
            <CheckCheck className="absolute bottom-2 right-2 size-3 text-emerald-300" />
          )}
        </div>
      )}
    </div>
  );
}