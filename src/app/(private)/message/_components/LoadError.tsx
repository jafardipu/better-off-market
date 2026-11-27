import { cn } from "@/lib/utils";

type Props = {
  message: string;
  onRetry: () => void;
  /** True while the socket is reconnecting after a retry. */
  busy?: boolean;
  className?: string;
};

export default function LoadError({ message, onRetry, busy, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm text-slate-500",
        className,
      )}
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={busy}
        className="rounded-full bg-primary-color px-4 py-1.5 font-medium text-white cursor-pointer hover:bg-primary-color/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Reconnecting…" : "Try again"}
      </button>
    </div>
  );
}
