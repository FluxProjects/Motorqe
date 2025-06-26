import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { MultiSelect } from "../ui/multiselect";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, formatServiceTimeRange, generateTimeSlots } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import React from "react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

// Define the schema for service booking
export const serviceBookingFormSchema = z.object({
  userId: z.string(),
  showroomId: z.string(),
  showroomServiceIds: z.array(z.number()),
  servicePrices: z.array(
    z.object({
      serviceId: z.number(),
      price: z.number(),
      currency: z.string(),
    })
  ),
  scheduledAt: z.string(),
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
});

export function ServiceBookingForm({
  service, // optional single service
  userId,
  onSuccess,
  services = [],
  selectedServices = [], // ✅ <-- new prop
  showroomId,
  isOpen,
  availability,
}: {
  service?: { id: number; name: string; price: number; currency: string };
  userId: string;
  onSuccess?: () => void;
  services?: { id: number; name: string; price: number; currency: string }[];
  selectedServices?: {
    id: number;
    name: string;
    price: number;
    currency: string;
  }[];
  showroomId?: string;
  isOpen?: boolean;
  availability?: Record<
    string,
    { day: string; isOpen: boolean; startTime: string; endTime: string }
  >;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(
    service ? [service.id] : []
  );

  const form = useForm({
    resolver: zodResolver(serviceBookingFormSchema),
    defaultValues: {
      userId,
      showroomId,
      showroomServiceIds:
        selectedServices?.length > 0
          ? selectedServices.map((s) => s.id)
          : service
          ? [service.id]
          : [],
      servicePrices: [],
      scheduledAt: "",
      notes: "",
      totalPrice: 0,
    },
  });

  // Get unique services by ID (not just name) to prevent duplicates
  const uniqueServices = React.useMemo(() => {
    const seen = new Set<number>();
    return (
      services?.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      }) ?? []
    );
  }, [services]);

  const currentlySelectedServices = uniqueServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const servicePrices = currentlySelectedServices.map((s) => ({
    serviceId: s.id,
    price: s.price,
    currency: s.currency,
  }));

  const totalPrice = currentlySelectedServices.reduce(
    (sum, s) => sum + s.price,
    0
  );
  const currency = currentlySelectedServices[0]?.currency || "";

  const bookService = useMutation({
    mutationFn: async (payload: z.infer<typeof serviceBookingFormSchema>) => {
      const res = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to book service");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-bookings"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Booking failed:", error);
    },
  });

  const onSubmit = (formData: { notes?: string }) => {
    console.log("formdata", formData);
    if (!date) {
      console.error("Date not selected");
      return;
    }

    if (selectedServiceIds.length === 0) {
      console.error("No services selected");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);

    const startTime = currentAvailability?.startTime || "09:00";
    const endTime = currentAvailability?.endTime || "17:00";

    const selectedMinutes = hours * 60 + minutes;
    const startMinutes =
      Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);
    const endMinutes =
      Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

    if (selectedMinutes < startMinutes || selectedMinutes >= endMinutes) {
      console.error("Selected time is outside the allowed range");
      return;
    }

    // if (isNaN(hours) || isNaN(minutes) || hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
    //   console.error("Time must be between 09:00 and 17:00");
    //   return;
    // }

    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const payload = {
      userId,
      showroomId,
      showroomServiceIds: selectedServiceIds,
      servicePrices,
      scheduledAt: scheduledAt.toISOString(),
      notes: formData.notes || "",
      totalPrice,
    };

    console.log("Submitting payload:", payload);
    bookService.mutate(payload);
    toast({
      title: "Booking confirmed",
      description: "Your appointment has been scheduled.",
      variant: "default", // optionally use custom variant
    }); // ✅ Show toast

    onSuccess?.();
  };

  useEffect(() => {
    if (isOpen) {
      const defaultSelectedIds =
        selectedServices?.length > 0
          ? selectedServices.map((s) => s.id)
          : service
          ? [service.id]
          : [];

      setSelectedServiceIds(defaultSelectedIds);
      form.setValue("showroomServiceIds", defaultSelectedIds);
      form.setValue("userId", userId);
      form.setValue("showroomId", showroomId || "");
      form.setValue("servicePrices", []);
      form.setValue("scheduledAt", "");
      form.setValue("notes", "");
      form.setValue("totalPrice", 0);
      setDate(new Date());
      setTime("10:00");
    }
  }, [isOpen, selectedServices, service, form, userId, showroomId]);

  const getDayKey = (date: Date): string => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[date.getDay()];
  };

  const currentDayKey = date ? getDayKey(date) : "mon";

  const currentAvailability = React.useMemo(() => {
  if (!date || !availability) return undefined;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const key = days[date.getDay()];
  return availability[key];
}, [date, availability]);

const timeSlots = React.useMemo(() => {
  if (!currentAvailability?.isOpen) return [];
  return generateTimeSlots(currentAvailability.startTime, currentAvailability.endTime);
}, [currentAvailability]);

  console.log("Selected date:", date);
  console.log("Derived dayKey:", currentDayKey);
  console.log("Current availability:", currentAvailability);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("Validation errors:", errors);
      })}
      className="space-y-4"
    >
      {currentlySelectedServices.length > 0 && (
        <div className="space-y-1">
          <h3 className="font-semibold">{t("services.selectedServices")}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {currentlySelectedServices.map((s) => (
              <li key={s.id}>
                {s.name} - {s.price} {s.currency}
              </li>
            ))}
          </ul>
          <div className="font-semibold">
            {t("services.total")}: {totalPrice} {currency}
          </div>
        </div>
      )}

      {services && (
        <div className="space-y-2">
          <label>{t("services.selectServices")}</label>
          <MultiSelect
            options={uniqueServices.map((s) => ({
              label: s.name,
              value: s.id.toString(),
            }))}
            selected={selectedServiceIds.map(String)}
            onChange={(ids) => {
              const numericIds = ids.map(Number);
              setSelectedServiceIds(numericIds);
              form.setValue("showroomServiceIds", numericIds);
            }}
            placeholder={t("services.selectServicesPlaceholder")}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>{t("services.date")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span>{t("services.pickDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  const dayKey = getDayKey(date); // safely get "mon", "tue", etc.
                  const isDayOpen = availability?.[dayKey]?.isOpen;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // normalize to midnight

                  return !isDayOpen || date < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label>{t("services.time")}</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          >
            <option value="" disabled>{t("services.selectTime")}</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {formatServiceTimeRange(slot)}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="space-y-2">
        <label>{t("services.notes")}</label>
        <Textarea
          {...form.register("notes")}
          placeholder={t("services.notesPlaceholder")}
          className="min-h-[100px]"
        />
      </div>

      {bookService.isError && (
        <p className="text-sm text-red-500 mt-2">
          {bookService.error?.message || t("services.bookingFailed")}
        </p>
      )}

      <Button
        className="bg-orange-500"
        onClick={() => {
          const scheduled_at =
            date && time
              ? new Date(`${format(date, "yyyy-MM-dd")}T${time}`)
              : null;

          form.setValue("userId", userId?.toString());
          form.setValue("showroomId", showroomId?.toString());
          form.setValue("showroomServiceIds", selectedServiceIds);
          form.setValue("scheduledAt", scheduled_at?.toString());

          form.handleSubmit(onSubmit)(); // <-- now run with updated values
        }}
      >
        {t("services.confirmBooking")}
      </Button>

      
    </form>
  );
}
