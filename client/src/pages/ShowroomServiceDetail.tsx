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
  showroom: Showroom;
  makes: CarMake[];
  price: number;
  currency: string;
  isFeatured: boolean;
}


const fetchServiceDetail = async (serviceId: string) => {
  const response = await apiRequest("GET", `/api/showroom/services/${serviceId}`);
  return await response.json();
};

export default function ShowroomServiceDetails() {
  const { t } = useTranslation();
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

  const { service, showroom, makes, price, currency, description, isFeatured } = data;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/services">
          <Button variant="ghost" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("common.backToServices")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Service Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {service.name}
                  {isFeatured && (
                    <Badge className="ml-3">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {t("services.featured")}
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {price} {currency}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <Avatar className="h-40 w-40 rounded-lg mx-auto">
                    <AvatarImage src={service.image} alt={service.name} />
                    <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="font-semibold mb-2">{t("services.description")}</h3>
                  <p className="text-neutral-600 mb-4">
                    {service.description || t("services.noDescription")}
                  </p>

                  {makes && makes.length > 0 && (
                    <>
                      <h3 className="font-semibold mb-2">
                        {t("services.availableFor")}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {makes.map((make) => (
                          <Badge key={make.id} variant="outline">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={make.image} alt={make.name} />
                              <AvatarFallback>{make.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {make.name}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>{t("services.specifications")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-neutral-500">
                    {t("services.serviceName")}
                  </h4>
                  <p>{service.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-500">
                    {t("services.price")}
                  </h4>
                  <p>
                    {price} {currency}
                  </p>
                </div>
                {service.description && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-neutral-500">
                      {t("services.fullDescription")}
                    </h4>
                    <p>{description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Showroom Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={showroom.logo} alt={showroom.name} />
                  <AvatarFallback>{showroom.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {showroom.name}
                {showroom.isMainBranch && (
                  <Badge className="ml-3">{t("showroom.mainBranch")}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                  <span>{showroom.address || showroom.location}</span>
                </div>

                {showroom.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                    <a href={`tel:${showroom.phone}`} className="hover:underline">
                      {showroom.phone}
                    </a>
                  </div>
                )}

                <Link href={`/showrooms/${showroom.id}`}>
                  <Button variant="outline" className="w-full">
                    {t("services.viewShowroom")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("services.contactAboutService")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("common.call")}
                  </Button>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t("common.directions")}
                  </Button>
                </div>
                <Button className="w-full">
                  {t("services.bookAppointment")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}