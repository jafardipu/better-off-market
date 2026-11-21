"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Plus, Send, X, Paperclip, SmilePlus } from "lucide-react";
import type { MessagePropertyInfo } from "./types";
import PropertyReference from "./PropertyReference";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (content: string, files?: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
  propertyInfo?: MessagePropertyInfo | null;
  onClearProperty?: () => void;
};

type Attachment = {
  file: File;
  previewUrl: string | null; // object URL for images, null for other file types
};

export default function MessageInput({
  onSend,
  onTyping,
  disabled,
  propertyInfo,
  onClearProperty,
}: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(emojiPickerRef as React.RefObject<HTMLElement>, () =>
    setShowEmojiPicker(false),
  );

  // clean up object URLs when attachments change/unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
  }, [attachments]);

  const handleSend = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(
      trimmed,
      attachments.length ? attachments.map((a) => a.file) : undefined,
    );
    attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    setValue("");
    setAttachments([]);
    setShowEmojiPicker(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping?.();
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const withPreviews: Attachment[] = selected.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setAttachments((prev) => [...prev, ...withPreviews]);
    e.target.value = ""; // allow re-selecting the same file
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="border-t border-primary-border-color">
      {propertyInfo?.address ? (
        <div className="px-4 pt-3 sm:px-5">
          <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F4F7FB] px-2 py-2">
            <span className="min-w-0 flex-1">
              <PropertyReference property={propertyInfo} />
            </span>
            {onClearProperty ? (
              <button
                type="button"
                onClick={onClearProperty}
                aria-label="Remove property reference"
                className="size-5 shrink-0 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 sm:px-5">
          {attachments.map((a, i) =>
            a.previewUrl ? (
              <div
                key={`${a.file.name}-${i}`}
                className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-slate-200 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.previewUrl}
                  alt={a.file.name}
                  className="size-full object-cover"
                />
                <button
                  onClick={() => removeAttachment(i)}
                  aria-label={`Remove ${a.file.name}`}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div
                key={`${a.file.name}-${i}`}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs rounded-full pl-2.5 pr-1 py-1 max-w-45 h-fit"
              >
                <Paperclip className="size-3 shrink-0" />
                <span className="truncate">{a.file.name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  aria-label={`Remove ${a.file.name}`}
                  className="size-4 shrink-0 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <X className="size-3" />
                </button>
              </div>
            ),
          )}
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3 sm:px-5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files"
          disabled={disabled}
          className="size-9 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 mb-0.5 disabled:opacity-50"
        >
          <Plus className="size-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className={cn(
            "flex-1 min-w-0 resize-none bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-700",
            "placeholder:text-slate-400 outline-none leading-relaxed",
            "max-h-30 overflow-y-auto",
          )}
        />

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="Add emoji"
            disabled={disabled}
            className="size-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 mb-0.5 disabled:opacity-50"
          >
            <SmilePlus className="size-5" />
          </button>

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-50">
              <EmojiPicker open={showEmojiPicker} onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={disabled}
          aria-label="Send message"
          className="size-9 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 mb-0.5 group cursor-pointer disabled:opacity-50"
        >
          <Send className="size-4 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}