import { ListingForm } from "@/components/forms/CarListingForm/ListingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminCarListing, CarListing, CarPart, CarTyre, Showroom } from "@shared/schema";


export default function SellCar() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
const listingId = params.id;

console.log("editing listingId",listingId);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery<AdminCarListing>({
    queryKey: ["car-listing", listingId],
    queryFn: async () => { 
      const res = await fetch(`/api/car-listings/${listingId}`);
      console.log("Response received:", res);

        const data = await res.json();
        console.log("Fetched seller data:", data);
        return data;
    },
    enabled: !!listingId && isAuthenticated,
  });

  const canEdit =
  listing &&
  (user?.id === listing?.user_id || (user?.roleId ?? 0) > 6);

  if (!isAuthenticated) {
    console.log("not Authenticated");
    return null; // Prevent flash before redirect
  }

  if (listingId && isLoading) {
    return <div className="text-center mt-10">{t("common.loading")}</div>;
  }

  if (listingId && isError) {
    return (
      <div className="text-center mt-10 text-red-500">
        {t("errors.failedToLoadListing")}
        <div className="text-sm mt-2">{(error as Error).message}</div>
      </div>
    );
  }

  if (listingId && !listing) {
    return (
      <div className="text-center mt-10 text-red-500">
        {t("errors.listingNotFound")}
      </div>
    );
  }

  if (listingId && listing && !canEdit) {
    return (
      <div className="text-center mt-10 text-red-500">
        {t("errors.unauthorizedEdit")}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("common.sellCar")}
          </h1>
          <div className="w-40 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="md:flex md:gap-6">
          <div className="w-full">
            <ListingForm
              listing={listingId && listing && canEdit ? listing : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
