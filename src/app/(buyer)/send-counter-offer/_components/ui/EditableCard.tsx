import type { ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCardProps {
  title: string;
  icon?: ReactNode;
  isEditing: boolean;
  isChanged: boolean;
  onEdit: () => void;
  onCancel: () => void;
  /** Keep edits and leave edit mode. */
  onDone?: () => void;
  /** Rendered when isEditing is true. */
  editContent: ReactNode;
  /** Rendered when isChanged is true and isEditing is false. */
  changedContent?: ReactNode;
  /** Rendered when neither editing nor changed. */
  viewContent: ReactNode;
  className?: string;
}

/**
 * Every section in the counter-offer editor is one of three states:
 *  - idle:     plain summary + "Edit" link
 *  - changed:  highlighted "Changed" card with a Current vs Original comparison + "Change" link
 *  - editing:  live form fields + "Cancel" link
 */
export function EditableCard({
  title,
  icon,
  isEditing,
  isChanged,
  onEdit,
  onCancel,
  onDone,
  editContent,
  changedContent,
  viewContent,
  className,
}: EditableCardProps) {
  const highlighted = isChanged && !isEditing;

  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-5 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] sm:p-6 relative",
        highlighted
          ? "border-primary ring-1 ring-primary-color"
          : "border-primary-border-color",
        className
      )}
    >
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-color md:text-xl mb-3">
          {icon ? <span className="text-primary">{icon}</span> : null}
          {title}
          {highlighted ? (
            <span className="rounded bg-primary-color px-2.5 py-0.5 text-sm font-medium text-white">
              Changed
            </span>
          ) : null}
        </h3>

        {highlighted ? (
          <span className=" absolute top-0 right-0 rounded-bl-lg rounded-tr-lg bg-primary-color px-2.5 py-1 text-xs font-semibold tracking-wide text-white">
            MODIFIED
          </span>
        ) : !isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1F4E8B] hover:underline"
          >
            <Pencil size={13} />
            Edit
          </button>
        ) : null}

        {isEditing ? (
          <div className="mb-4 flex items-center gap-3">
            {onDone ? (
              <button
                type="button"
                onClick={onDone}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#1F4E8B] cursor-pointer hover:underline"
              >
                Done
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-500 cursor-pointer hover:text-destructive"
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        ) : null}
      </div>

    

      {highlighted ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[#1F4E8B] hover:underline"
          >
            <Pencil size={13} />
            Change
          </button>
        </div>
      ) : null}

      {isEditing ? editContent : highlighted ? changedContent ?? viewContent : viewContent}
    </section>
  );
}
