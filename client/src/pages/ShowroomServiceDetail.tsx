import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Phone,
  ChevronLeft,
  Heart,
  Share,
  Flag,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CarMake, CarService, Showroom } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "@/components/forms/AuthForm/AuthForms";

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
  const response = await apiRequest(
    "GET",
    `/api/showroom/services/${serviceId}`
  );
  return await response.json();
};

export default function ShowroomServiceDetails() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | "forget-password" | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const params = useParams();
  const serviceId = params.id;

  const { data, isLoading, error } = useQuery<ServiceDetailData>({
    queryKey: ["service-detail", serviceId],
    queryFn: () => fetchServiceDetail(serviceId),
  });

  // Fetch favorite status if logged in
  const { data: favoriteData } = useQuery<any>({
    queryKey: ["/api/favorites/services/check", serviceId],
    enabled: isAuthenticated && !!serviceId,
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

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }

    try {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/showrooms/${id}`, {});
        setIsFavorited(false);
        toast({
          title: t("showroom.removedFromFavorites"),
          description: t("showroom.removedFromFavoritesDesc"),
        });
      } else {
        await apiRequest("POST", "/api/favorites/showrooms", {
          showroomId: parseInt(id),
        });
        setIsFavorited(true);
        toast({
          title: t("showroom.addedToFavorites"),
          description: t("showroom.addedToFavoritesDesc"),
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("showroom.favoriteError"),
        variant: "destructive",
      });
    }
  };

  const { service, showroom, makes, price, currency, description, isFeatured } =
    data;

  return (
    <div className="bg-white-100 pb-16">

      <div className="bg-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center mb-6">
            <Link href="/browse-services">
              <Button variant="ghost" className="flex items-center text-blue-900">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t("common.backToServices")}
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={
                  isFavorited
                    ? "rounded-full hover:text-red-500 hover:border-red-500 bg-red-500 text-white"
                    : "rounded-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                }
                onClick={handleFavoriteToggle}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {isFavorited
                  ? t("common.removeFromFavorites")
                  : t("common.addToFavorites")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-blue-900 border-blue-500 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: showroom.name,
                        url: window.location.href,
                      })
                      .catch((err) => console.error("Error sharing:", err));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: t("common.linkCopied"),
                      description: t("common.linkCopiedDesc"),
                    });
                  }
                }}
              >
                <Share size={16} className="mr-1" />
                {t("common.share")}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-red-500 hover:bg-black"
                onClick={() => setReportDialogOpen(true)}
              >
                <Flag size={16} className="mr-1" />
                {t("common.report")}
              </Button>
            </div>
          </div>

        </div>
      </div>
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Service Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {service.name}
                  {isFeatured && (
                    <Badge className="ml-3 bg-blue-900">
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
                  <h3 className="font-semibold mb-2">
                    {t("services.description")}
                  </h3>
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
                              <AvatarFallback>
                                {make.name.charAt(0)}
                              </AvatarFallback>
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
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={showroom.logo} alt={showroom.name} />
                  <AvatarFallback>{showroom.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {showroom.name}
                {showroom.isMainBranch && (
                  <Badge className="ml-3 bg-orange-500">{t("showroom.mainBranch")}</Badge>
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
                    <a
                      href={`tel:${showroom.phone}`}
                      className="hover:underline"
                    >
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

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-300">
            <AuthForms
              initialView={authModal}
              onClose={() => setAuthModal(null)}
              onSwitchView={(view) => setAuthModal(view)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
