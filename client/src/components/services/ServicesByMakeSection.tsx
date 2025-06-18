import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CarMake, CarService } from "@shared/schema";

export default function ServicesByMake() {
  const { t } = useTranslation();
  const [expandedMake, setExpandedMake] = useState<number | null>(null);
  const [visibleMakesCount, setVisibleMakesCount] = useState(20);

  // Fetch all car makes
  const { data: makes = [], isLoading: isLoadingMakes } = useQuery<CarMake[]>({
    queryKey: ["/api/car-makes"],
  });

  // Fetch all services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<CarService[]>({
    queryKey: ["/api/services"],
  });

  // Group makes into responsive rows
  const makeRows = [];
  const itemsPerRow = {
    base: 2,    // Mobile: 2 columns
    sm: 3,      // Tablet: 3 columns
    lg: 5       // Desktop: 5 columns
  };
  
  // Create rows based on the largest breakpoint (lg:5)
  for (let i = 0; i < Math.min(visibleMakesCount, makes.length); i += 5) {
    makeRows.push(makes.slice(i, i + 5));
  }

  if (isLoadingMakes || isLoadingServices) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {makeRows.map((row, rowIndex) => {
        const isRowExpanded = row.some(make => make.id === expandedMake);
        const expandedMakeServices = expandedMake 
          ? services.filter(service => service.id === expandedMake)
          : [];

        return (
          <div key={`row-${rowIndex}`} className="space-y-4">
            {/* Makes Row - Responsive columns */}
            <div className={`
              grid 
              grid-cols-2     /* Mobile: 2 columns */
              sm:grid-cols-3  /* Tablet: 3 columns */
              lg:grid-cols-5  /* Desktop: 5 columns */
              gap-4
            `}>
              {row.map(make => (
                <div
                  key={`make-${make.id}`}
                  className={`
                    flex flex-col items-center p-4 rounded-lg cursor-pointer border-2
                    transition-colors hover:bg-gray-50
                    ${expandedMake === make.id ? 
                      'border-orange-500' : 
                      'border-transparent hover:border-gray-200'}
                  `}
                  onClick={() => setExpandedMake(expandedMake === make.id ? null : make.id)}
                >
                  <Avatar className="h-16 w-16 mb-2 rounded-none">
                    <AvatarImage className="rounded-none" src={make.image || undefined} />
                    <AvatarFallback>
                      {make.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-center">
                    {make.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Services Row - Same responsive columns as makes */}
            {isRowExpanded && (
              <div className={`
                grid 
                grid-cols-2     /* Mobile: 2 columns */
                sm:grid-cols-3  /* Tablet: 3 columns */
                lg:grid-cols-5  /* Desktop: 5 columns */
                gap-4 bg-gray-50 p-4
              `}>
                {expandedMakeServices.length > 0 ? (
                  expandedMakeServices.map(service => (
                    <div
                      key={`service-${service.id}`}
                      className="flex flex-col items-center p-4 bg-white border hover:shadow-sm"
                    >
                      <Avatar className="h-16 w-16 mb-2 rounded-none">
                        <AvatarImage className="rounded-none" src={service.image || undefined} />
                        <AvatarFallback>
                          {service.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-center">
                        {service.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-gray-500">
                    No services available for this make
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        {visibleMakesCount < makes.length ? (
          <Button className="bg-orange-500 text-white" onClick={() => setVisibleMakesCount(prev => prev + 20)}>
            {t("common.showMore")}
          </Button>
        ) : (
          makes.length > 20 && (
            <Button
              className="border-orange-500 text-orange-500 bg-white"
              onClick={() => {
                setVisibleMakesCount(20);
                setExpandedMake(null);
              }}
            >
              {t("common.showLess")}
            </Button>
          )
        )}
      </div>
    </div>
  );
}