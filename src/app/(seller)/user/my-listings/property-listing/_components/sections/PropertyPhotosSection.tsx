"use client";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { PropertyListingFormValues } from "@/lib/validations/property-listing.schema";
import { CameraIcon, GripVertical, ImageIcon, ImagesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_PHOTOS = 5;

type PhotoItem = File | string;

function PhotoThumb({
  file,
  index,
  isDragging,
  isDropTarget,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  file: PhotoItem;
  index: number;
  isDragging: boolean;
  isDropTarget: boolean;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const [src, setSrc] = useState<string>(
    typeof file === "string" ? file : "",
  );

  useEffect(() => {
    if (typeof file === "string") {
      setSrc(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
        onDragStart();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 border-transparent active:cursor-grabbing",
        isDragging && "opacity-40",
        isDropTarget && "border-primary-color",
      )}
    >
      {src ? (
        <img
          src={src}
          alt={`photo-${index + 1}`}
          className="size-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : null}

      <div className="absolute left-1 top-1 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-1 text-white">
        <GripVertical className="size-3.5" />
        <span className="text-[10px] font-semibold">{index + 1}</span>
      </div>

      {index === 0 && (
        <span className="absolute bottom-1 left-1 rounded bg-primary-color px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Cover
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`Remove photo ${index + 1}`}
      >
        ✕
      </button>
    </div>
  );
}

export function PropertyPhotosSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<PropertyListingFormValues>();
  const dragFromIndex = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="mb-1 flex items-center gap-2">
          <ImagesIcon className="text-primary-blue size-5" />
          <h2 className="text-xl font-semibold text-primary-color">
            Property Photos<span className="text-red-500">*</span>
          </h2>
        </div>

        <span className="text-xs text-gray-400">
          Minimum {MIN_PHOTOS} high-res photos required · Drag to reorder
        </span>
      </div>

      <Controller
        name="photos"
        control={control}
        render={({ field }) => {
          const files = ((field.value ?? []) as PhotoItem[]) || [];

          const addFiles = (newFiles: FileList | File[]) => {
            field.onChange([...files, ...Array.from(newFiles)]);
          };

          const removeFile = (index: number) => {
            field.onChange(files.filter((_, i) => i !== index));
          };

          const movePhoto = (from: number, to: number) => {
            if (from === to || from < 0 || to < 0) return;
            if (from >= files.length || to >= files.length) return;
            const next = [...files];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            field.onChange(next);
          };

          return (
            <>
              <label
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length)
                    addFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#004AC64D] bg-[#004AC60D] px-4 py-10 text-center"
              >
                <CameraIcon className="mb-3 size-8 text-primary-blue" />
                <p className="font-semibold text-2xl text-[#434655]">
                  Drag and drop images here
                </p>
                <p className="mb-4 text-sm text-[#737686]">
                  Or click to browse from your device
                </p>
                <Button
                  type="button"
                  asChild
                  className="py-5 px-5 bg-primary-color"
                >
                  <span>Upload Photos</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {files.map((file, index) => (
                    <PhotoThumb
                      key={
                        typeof file === "string"
                          ? file
                          : `${file.name}-${file.size}-${file.lastModified}-${index}`
                      }
                      file={file}
                      index={index}
                      isDragging={draggingIndex === index}
                      isDropTarget={
                        dropIndex === index && draggingIndex !== index
                      }
                      onRemove={() => removeFile(index)}
                      onDragStart={() => {
                        dragFromIndex.current = index;
                        setDraggingIndex(index);
                      }}
                      onDragEnter={() => setDropIndex(index)}
                      onDragEnd={() => {
                        dragFromIndex.current = null;
                        setDraggingIndex(null);
                        setDropIndex(null);
                      }}
                      onDrop={() => {
                        const from = dragFromIndex.current;
                        if (from == null) return;
                        movePhoto(from, index);
                        dragFromIndex.current = null;
                        setDraggingIndex(null);
                        setDropIndex(null);
                      }}
                    />
                  ))}
                  {Array.from({
                    length: Math.max(0, MIN_PHOTOS - files.length),
                  }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="flex aspect-square items-center justify-center rounded-lg bg-gray-100"
                    >
                      <ImageIcon className="size-6 text-gray-300" />
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        }}
      />
      {errors.photos && (
        <p className="mt-2 text-xs text-red-500">
          {errors.photos.message as string}
        </p>
      )}
    </section>
  );
}
