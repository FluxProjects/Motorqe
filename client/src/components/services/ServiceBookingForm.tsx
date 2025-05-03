// components/services/ServiceBookingForm.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ShowroomService } from "@shared/schema";
import { insertServiceBookingSchema } from "@shared/schema";
import { useState } from "react";

interface ServiceBookingFormProps {
  service: ShowroomService;
  userId?: number;
  onSuccess?: () => void;
}

export function ServiceBookingForm({ service, userId, onSuccess }: ServiceBookingFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('10:00');

  const form = useForm({
    resolver: zodResolver(insertServiceBookingSchema),
    defaultValues: {
      notes: '',
    }
  });

  const bookService = useMutation({
    mutationFn: (data: { scheduledAt: string; notes?: string }) => 
      fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          userId,
          showroomServiceId: service.id 
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['service-bookings']);
      onSuccess?.();
    }
  });

  const onSubmit = (data: { notes?: string }) => {
    if (!date) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes);
    
    bookService.mutate({
      scheduledAt: scheduledAt.toISOString(),
      notes: data.notes
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>{t('service.date')}</label>
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
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label>{t('service.time')}</label>
          <Input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            min="09:00" 
            max="17:00" 
            step="1800" // 30 minute increments
          />
        </div>
      </div>

      <div className="space-y-2">
        <label>{t('service.notes')}</label>
        <Textarea
          {...form.register('notes')}
          placeholder={t('service.notesPlaceholder')}
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="font-semibold">
          {service.price} {service.currency}
        </div>
        <Button type="submit" disabled={bookService.isLoading}>
          {bookService.isLoading ? t('common.booking') : t('service.confirmBooking')}
        </Button>
      </div>
    </form>
  );
}