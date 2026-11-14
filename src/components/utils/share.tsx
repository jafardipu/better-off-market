"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Link2,
  Mail,
  MessageSquareText,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageWithFallback from "@/components/shared/image/ImageWithFallback";

type ShareProps = {
  title?: string;
  link: string;
  className?: string;
  children?: React.ReactNode;
  image?: string;
  listingLabel?: string;
  message?: string;
};

function resolveAbsoluteUrl(link: string) {
  if (!link) return "";
  if (/^https?:\/\//i.test(link)) return link;
  if (typeof window === "undefined") return link;
  const path = link.startsWith("/") ? link : `/${link}`;
  return `${window.location.origin}${path}`;
}

function FacebookIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5h2.5V5.2C16.1 5.1 15 5 13.7 5 11.1 5 9.3 6.6 9.3 9.5V12H6.8v3.5h2.5V22h3.5v-6.5h2.7l.5-3.5h-3.2V9.7c0-1 .3-1.2 1.2-1.2Z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.55 2 2.1 6.45 2.1 11.94c0 1.76.46 3.48 1.34 5L2 22l5.2-1.37a9.9 9.9 0 0 0 4.84 1.23h.01c5.49 0 9.94-4.45 9.94-9.94 0-2.65-1.03-5.14-2.94-7.01Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.08.81.82-3-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.12-.55.12-.16.25-.64.8-.78.96-.14.17-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.76.76 2.12.76 2.57.64.39-.09 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.17-.47-.29Z" />
    </svg>
  );
}

const DEFAULT_MESSAGE =
  "Check out this property listing on Better Off Market:";

export default function Share({
  className,
  title = "Better Off Market listing",
  link,
  children,
  image,
  listingLabel,
  message = DEFAULT_MESSAGE,
}: ShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => resolveAbsoluteUrl(link), [link, open]);
  const shareText = `${message} ${shareUrl}`.trim();
  const previewTitle = listingLabel || title || "property";

  const openPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCopied(false);
    setOpen(true);
  };

  const copyLink = async () => {
    try {
      if (!shareUrl) throw new Error("Missing listing URL");

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(input);
        if (!ok) throw new Error("Copy command failed");
      }

      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy link failed:", error);
      toast.error("Could not copy link. Please copy it manually.");
    }
  };

  const openShareWindow = (url: string, label: string) => {
    try {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.href = url;
    } catch (error) {
      console.error(`${label} share failed:`, error);
      toast.error(`Could not open ${label}. Please try another option.`);
    }
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${message}\n\n${shareUrl}`);
    openShareWindow(`mailto:?subject=${subject}&body=${body}`, "Email");
  };

  const shareSms = () => {
    openShareWindow(`sms:?&body=${encodeURIComponent(shareText)}`, "Text message");
  };

  const shareFacebook = () => {
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "Facebook",
    );
  };

  const shareWhatsApp = () => {
    openShareWindow(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "WhatsApp",
    );
  };

  const shareActions = [
    {
      key: "copy",
      label: copied ? "Link copied" : "Copy link",
      onClick: copyLink,
      className: copied ? "bg-[#E8F8EF] text-[#0F7B3B]" : "bg-[#EEF1F4] text-[#2B2B2B]",
      icon: copied ? <Check size={22} /> : <Link2 size={22} />,
    },
    {
      key: "email",
      label: "Email",
      onClick: shareEmail,
      className: "bg-[#EA4335] text-white",
      icon: <Mail size={22} />,
    },
    {
      key: "sms",
      label: "Text message",
      onClick: shareSms,
      className: "bg-[#34C759] text-white",
      icon: <MessageSquareText size={22} />,
    },
    {
      key: "facebook",
      label: "Facebook",
      onClick: shareFacebook,
      className: "bg-[#1877F2] text-white",
      icon: <FacebookIcon size={22} />,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      onClick: shareWhatsApp,
      className: "bg-[#25D366] text-white",
      icon: <WhatsAppIcon size={22} />,
    },
  ];

  return (
    <>
      {children ? (
        <span className="contents" onClick={openPopup}>
          {children}
        </span>
      ) : (
        <button
          type="button"
          onClick={openPopup}
          className={cn(
            "rounded p-2 hover:bg-gray-100 text-primary-gray text-xl cursor-pointer",
            className,
          )}
          aria-label="Share listing"
        >
          <Share2 />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[min(100%-2rem,380px)] max-w-[380px] rounded-md border border-[#D8D8D8] bg-[#F3F3F3] p-0 shadow-xl overflow-hidden gap-0"
          showCloseButton={false}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="px-4 pt-4 pb-3 overflow-hidden">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                <Share2 className="size-5 shrink-0 text-[#1B1B1B]" />
                <DialogTitle className="truncate text-[17px] font-semibold text-[#1B1B1B]">
                  Share link
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 shrink-0 text-[#1B1B1B] hover:bg-black/5 cursor-pointer"
                aria-label="Close share popup"
              >
                <X size={18} />
              </button>
            </div>
            <DialogDescription className="sr-only">
              Share this listing with Copy link, Email, Text message, Facebook, or WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 pb-5 space-y-4 min-w-0 overflow-hidden">
            <p className="text-xs font-medium text-[#5A5A5A]">
              View listing info:
            </p>

            {/* Preview card */}
            <div className="flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-[#C9C9C9] bg-white p-2">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#E8E8E8]">
                {image ? (
                  <ImageWithFallback
                    src={image}
                    alt="Listing thumbnail"
                    width={48}
                    height={48}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[#6B6B6B]">
                    <Link2 size={18} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="block truncate text-[14px] font-semibold text-[#1B1B1B]">
                  {previewTitle}
                </p>
                <p className="mt-0.5 block truncate text-[11px] text-[#5A5A5A]">
                  {shareUrl || link}
                </p>
              </div>

              <button
                type="button"
                onClick={copyLink}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#C9C9C9] bg-[#F7F7F7] text-[#1B1B1B] transition hover:bg-[#ECECEC] cursor-pointer",
                  copied && "border-green-500 bg-green-50 text-green-700",
                )}
                aria-label={copied ? "Link copied" : "Copy link"}
                title={copied ? "Link copied" : "Copy link"}
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
              </button>
            </div>

            {copied && (
              <p className="-mt-2 text-center text-sm font-medium text-[#0F7B3B]">
                Link copied
              </p>
            )}

            <div className="min-w-0 overflow-hidden">
              <p className="mb-3 text-[13px] font-medium text-[#5A5A5A]">
                Share using
              </p>
              <div className="grid w-full grid-cols-3 gap-3">
                {shareActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    onClick={action.onClick}
                    className="group flex min-w-0 flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-[1.03]",
                        action.className,
                      )}
                    >
                      {action.icon}
                    </span>
                    <span className="w-full truncate text-center text-[11px] leading-tight text-[#1B1B1B]">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
