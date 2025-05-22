// components/services/ServiceBrowser.tsx
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ShowroomService } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { ServiceBookingForm } from "./ServiceBookingForm";
import { useState } from "react";

export function ServiceBrowser() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<ShowroomService | null>(null);

  const { data: services = [] } = useQuery<ShowroomService[]>({
    queryKey: ['available-services', searchTerm],
    queryFn: () => fetch(`/api/showroom/services?search=${searchTerm}`).then(res => res.json())
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('service.searchPlaceholder')}
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg">{service.service.name}</h3>
            <p className="text-primary font-semibold my-2">
              {service.price} {service.currency}
            </p>
            <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
            <Button 
              size="sm" 
              onClick={() => setSelectedService(service)}
            >
              {t('service.bookNow')}
            </Button>
          </div>
        ))}
      </div>

      {selectedService && (
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('service.bookService')}: {selectedService.service.name}
              </DialogTitle>
            </DialogHeader>
            <ServiceBookingForm 
              service={selectedService} 
              userId={auth.user?.id} 
              onSuccess={() => setSelectedService(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}