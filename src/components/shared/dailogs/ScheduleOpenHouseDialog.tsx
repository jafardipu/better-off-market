"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUpdatePropertyMutation } from "@/redux/api/propertiesApi";
import { errorModification } from "@/lib/errors/errorModification";
import { toast } from "sonner";
import { IOpenHouse } from "@/types";
import { revalidateProperties } from "@/lib/actions/revalidate";
import { formatDateUS, formatTimeUS } from "@/utils/formatDateUS";

const scheduleOpenHouseSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ScheduleOpenHouseValues = z.infer<typeof scheduleOpenHouseSchema>;

const maskedPickerClass =
  "border-[#F3B896] text-transparent caret-transparent focus-visible:border-[#1F4E8B] focus-visible:ring-[#1F4E8B]/20 py-5 [&::-webkit-datetime-edit]:text-transparent";

function PickerValue({
  value,
  placeholder,
}: {
  value?: string;
  placeholder: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-y-0 left-3 right-8 flex items-center text-sm",
        value ? "text-primary-black" : "text-primary-gray",
      )}
    >
      {value || placeholder}
    </span>
  );
}

interface ScheduleOpenHouseDialogProps {
  id: string;
  openHouse: IOpenHouse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleOpenHouseDialog({
  open,
  onOpenChange,
  id,
  openHouse,
}: ScheduleOpenHouseDialogProps) {
  const [updateProperty, { isLoading }] = useUpdatePropertyMutation();

  const form = useForm<ScheduleOpenHouseValues>({
    resolver: zodResolver(scheduleOpenHouseSchema),
    defaultValues: {
      date: openHouse?.date?.slice(0, 10) ?? "",
      startTime: openHouse?.startTime?.slice(0, 5) ?? "",
      endTime: openHouse?.endTime?.slice(0, 5) ?? "",
    },
  });
  const date = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  const handleSubmit = async (values: ScheduleOpenHouseValues) => {
    try {
      await updateProperty({
        id,
        formData: {
          openHouse: values,
        },
      }).unwrap();
      onOpenChange(false);
      await revalidateProperties();
      toast.success("Open house scheduled successfully!");
    } catch (error) {
      const errorMessage = errorModification(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-115 rounded-lg p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 px-6 py-5 border-b border-primary-border-color">
          <DialogTitle className="text-xl font-bold text-primary-black">
            Schedule Open House
          </DialogTitle>
          <DialogClose className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <X className="size-5 text-primary-black" />
          </DialogClose>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-5">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm font-bold text-primary-black">
                      Open House Date
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {/* <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                        <Input
                          {...field}
                          type="date"
                          className={maskedPickerClass}
                        />
                        <PickerValue
                          value={field.value ? formatDateUS(field.value) : ""}
                          placeholder="MM-DD-YYYY"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-primary-black">
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                          <Input
                            {...field}
                            type="time"
                            className={maskedPickerClass}
                          />
                          <PickerValue
                            value={formatTimeUS(field.value)}
                            placeholder="h:mm AM"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-primary-black">
                        End Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary-black" /> */}
                          <Input
                            {...field}
                            type="time"
                            className={maskedPickerClass}
                          />
                          <PickerValue
                            value={formatTimeUS(field.value)}
                            placeholder="h:mm AM"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {date && startTime && endTime ? (
                <p className="text-sm font-medium text-primary-black">
                  {formatDateUS(date)} · {formatTimeUS(startTime)} -{" "}
                  {formatTimeUS(endTime)}
                </p>
              ) : null}

              <div className="flex gap-2.5 rounded-lg bg-[#F2F4F6] border border-[#E2E8F0] p-4">
                <Info className="size-4 text-[#594139] mt-0.5 shrink-0" />
                <p className="text-sm text-[#594139] leading-relaxed">
                  This event will be visible to all potential buyers. RSVP
                  notifications will be sent directly to your dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-primary-border-color bg-[#F2F4F6] rounded-md">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="p-5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  " bg-primary-color p-5 cursor-pointer",
                  isLoading && "cursor-progress",
                )}
              >
                Schedule Event
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
