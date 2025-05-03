// components/showroom/ServiceBookingCalendar.tsx
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ServiceBooking } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ServiceBookingCalendar() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: bookings = [] } = useQuery<ServiceBooking[]>({
    queryKey: ['service-bookings', date],
    queryFn: () => fetch(`/api/service-bookings?date=${date?.toISOString()}`).then(res => res.json())
  });

  const dayBookings = bookings.filter(booking => 
    isSameDay(new Date(booking.scheduledAt), date!)
  );

  return (
    <div className="flex gap-6">
      <div className="w-[300px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon size={20} />
          <h3 className="text-xl font-semibold">
            {date && format(date, 'PPPP')}
          </h3>
          {isToday(date!) && (
            <Badge variant="secondary">{t('common.today')}</Badge>
          )}
        </div>
        
        {dayBookings.length > 0 ? (
          <div className="space-y-3">
            {dayBookings.map(booking => (
              <div key={booking.id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{booking.service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.scheduledAt), 'hh:mm a')}
                    </p>
                  </div>
                  <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                    {t(`booking.status.${booking.status}`)}
                  </Badge>
                </div>
                <p className="mt-2">{booking.notes}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('booking.noBookings')}</p>
        )}
      </div>
    </div>
  );
}