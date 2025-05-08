import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CarMake, CarService, Showroom } from "@shared/schema";

interface ExtendedCarService extends CarService {
  description?: string;
  descriptionAr?: string;
}

interface ServiceDetailData {
  service: ExtendedCarService;
  showrooms: Showroom[];
  makes: CarMake[];
  price: number;
  currency: string;
  isFeatured: boolean;
}

const fetchServiceDetail = async (serviceId: string) => {
  const response = await apiRequest("GET", `/api/services/${serviceId}`);
  return await response.json();
};

const PLACEHOLDER_IMG = "https://placehold.co/400x400";

export default function ServiceDetails() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const params = useParams();
  const serviceId = params.id;

  const { data, isLoading, error } = useQuery<ServiceDetailData>({
    queryKey: ["service-detail", serviceId],
    queryFn: () => fetchServiceDetail(serviceId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    toast({
      title: t("common.error"),
      description: t("services.failedToLoad"),
      variant: "destructive",
    });
    return (
      <div className="text-center py-12 text-neutral-500">
        {t("services.failedToLoad")}
      </div>
    );
  }

  const { service, showrooms, makes, price, currency, isFeatured } = data;
  const description =
    i18n.language === "ar" && service.descriptionAr
      ? service.descriptionAr
      : service.description || t("services.noDescription");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/browse-services">
          <Button variant="ghost" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("common.backToServices")}
          </Button>
        </Link>
      </div>

      <div className="bg-white min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info Card */}
            <Card>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                {/* Left: Image */}
                <div className="w-full md:w-1/6 flex justify-center md:justify-start">
                  <Avatar className="h-40 w-40 rounded-xl">
                    <AvatarImage
                      src={service.image || PLACEHOLDER_IMG}
                      alt={service.name}
                    />
                    <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-5/6 space-y-4">
                  {/* Title and Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-2xl font-semibold flex items-center gap-2">
                      {service.name}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-1">
                      {service.description || service.descriptionAr}
                    </h3>
                  </div>

                  {/* Makes */}
                  {makes && makes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">
                        {t("services.availableFor")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {makes.map((make) => (
                          <Badge
                            key={make.id}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={make.image || PLACEHOLDER_IMG}
                                alt={make.name}
                              />
                              <AvatarFallback>
                                {make.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {make.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Showrooms Grid */}
            <div className="space-y-6">
              {showrooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {showrooms.map((showroom) => (
                    <Card
                      key={showroom.id}
                      className="h-full flex flex-col justify-between"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage
                              src={showroom.logo || PLACEHOLDER_IMG}
                              alt={showroom.name}
                            />
                            <AvatarFallback>
                              {showroom.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{showroom.name}</span>
                          {showroom.isMainBranch && (
                            <Badge className="ml-3 inline-flex items-center justify-center h-6 px-3 text-xs font-medium whitespace-nowrap">
                              {t("showroom.mainBranch")}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-grow">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-neutral-500 mt-1" />
                          <span>
                            {showroom.address ||
                              showroom.location ||
                              t("showroom.noAddress")}
                          </span>
                        </div>
                        {showroom.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                            <a
                              href={`tel:${showroom.phone}`}
                              className="hover:underline"
                            >
                              {showroom.phone}
                            </a>
                          </div>
                        )}
                      </CardContent>
                      <div className="px-6 pb-6">
                        <Link href={`/showrooms/${showroom.id}`}>
                          <Button variant="outline" className="w-full">
                            {t("services.viewShowroom")}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-neutral-500">
                    {t("services.noShowroomsAvailable")}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
