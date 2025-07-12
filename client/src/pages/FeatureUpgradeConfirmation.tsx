import { useLocation, useParams } from "wouter";
import { useEffect, useState } from "react";
import { AdminCarListing, CarMake, CarModel } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function FeatureUpgradeConfirmation() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [showroom, setShowroom] = useState(null);
  const [, navigate] = useLocation();
  const { id: requestId } = useParams();
  const [location] = useLocation();
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const price = params.get("price");
const currency = params.get("currency") || "QAR";


  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch the feature upgrade request by ID
  const {
    data: featureRequest,
    isLoading: isFeatureLoading,
    error: featureError,
  } = useQuery({
    queryKey: ["listing-feature-upgrade", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/listing-feature-upgrade/${requestId}`);
      if (!res.ok) throw new Error("Failed to fetch feature upgrade request");
      return res.json();
    },
    enabled: !!requestId && isAuthenticated,
  });

  const listingId = featureRequest?.listing_id;

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

  useEffect(() => {
    const fetchShowroom = async () => {
      if (listing?.is_business && listing?.user_id) {
        try {
          const res = await fetch(`/api/showrooms/user/${listing?.user_id}`);
          if (!res.ok) throw new Error("Failed to fetch showroom data");

          const data = await res.json();
          console.log("showroom", showroom[0]);
          setShowroom(data);
        } catch (error) {
          console.error("❌ Showroom fetch error:", error);
        }
      }
    };

    fetchShowroom();
  }, [listing?.is_business, listing?.user_id]);

  const { data: make } = useQuery<CarMake>({
    queryKey: ["/api/car-makes", listing?.make_id],
    queryFn: () =>
      fetch(`/api/car-makes/${listing?.make_id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch make");
        return res.json();
      }),
    enabled: !!listing?.make_id,
  });

  const { data: model } = useQuery<CarModel>({
    queryKey: ["/api/car-model", listing?.model_id],
    queryFn: () =>
      fetch(`/api/car-model/${listing?.model_id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch model");
        return res.json();
      }),
    enabled: !!listing?.model_id,
  });

  console.log("listing", listing);

  const isOwner = (listing && user?.id === listing.user_id) || user?.roleId > 6;

  const createdAt = featureRequest?.created_at
    ? new Date(featureRequest.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  if (!isAuthenticated) {
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

  if (listingId && listing && !isOwner) {
    return (
      <div className="text-center mt-10 text-red-500">
        {t("errors.unauthorizedEdit")}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900">Feature Plan</h3>
          <p className="text-neutral-500 text-center">
            Sell your car in seconds with just a few clicks
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-10">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 bg-blue-900 text-white flex items-center justify-center">
              1
            </div>
            <span className="ml-2 font-semibold text-blue-900">
              Select Type Of Ad
            </span>
          </div>
          <span className="mx-2 text-gray-400">➔</span>

          {/* Step 2 */}
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 bg-orange-500 text-white flex items-center justify-center">
              2
            </div>
            <span className="ml-2 font-semibold text-orange-500">Confirm</span>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900">
            Please wait for one of our representatives to contact you !
          </h3>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full mx-auto">
          {/* Company Logo/Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-blue-700 mb-1">
                Feature Ad
              </h2>
              <p className="text-gray-700 text-base">
                {listing?.showroom?.name}{" "}
                {listing?.showroom?.address || listing?.showroom?.address_ar}
              </p>
              <p>
                <span className="font-bold">Car:</span>{" "}
                <span>
                  {listing?.year} {make?.name} {model?.name}
                </span>
              </p>
              <p>
                <span className="font-bold">Mileage:</span>{" "}
                <span>
                  {listing?.mileage != null
                    ? Number(listing.mileage).toLocaleString("en-US")
                    : "-"}{" "}
                  kms
                </span>
              </p>
              <p>
                <span className="font-bold">Price:</span>{" "}
                <span>
                  {listing?.currency}{" "}
                  {listing?.price != null
                    ? Number(listing.price).toLocaleString("en-US")
                    : "-"}
                </span>
              </p>
            </div>
          </div>

          {/* Payment Note & Selected Work Section */}
          <div className="px-6 pb-4">
            {/* Selected Work Box */}
            <div className="border-2 border-gray-400 rounded-md overflow-hidden">
              {/* Header */}
              <div className="bg-white p-4 border-b border-gray-300">
                <h3 className="text-center text-xl font-medium text-blue-600">
                  Selected Plan
                </h3>
                <div className="w-20 h-1 bg-orange-500 mx-auto mt-1"></div>
              </div>

              {/* Work Items */}
              <div className="bg-white p-4 space-y-4">
                <div className="grid grid-cols-[200px_1fr] gap-y-2 items-start">
                  <div className="text-neutral-800 font-bold">
                    Order Placed On:
                  </div>
                  <div className="text-neutral-800 font-medium">
                    {createdAt}
                  </div>

                  <div className="text-neutral-800 font-bold">Plan:</div>
                  <div className="text-neutral-800 font-medium">
                    Featue Ad {featureRequest?.requested_days} days
                  </div>

                  <div className="text-neutral-800 font-bold">Price:</div>
                  <div className="text-neutral-800 font-medium">
                    {currency}{" "}
                    {price != null
                      ? Number(price).toLocaleString("en-US")
                      : "-"}
                  </div>

                  <div className="text-neutral-800 font-bold col-span-2">
                    Note: No Prepayment needed now! You may pay our
                    representative upon their visit.
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-blue-900 text-white p-4 text-center">
                <div className="text-xl justify-end items-end text-right font-bold">
                  Total Price:{" "}
                  {price != null
                    ? Number(price).toLocaleString("en-US")
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="p-6 bg-white">
            <h4 className="font-bold text-gray-900 mb-2 text-base underline">
              Important Information
            </h4>
            <p className="text-gray-700 mb-4 text-base">
              Terms & Conditions & Policies Apply.
            </p>
            <p className="text-gray-900 text-base">
              <span className="font-bold underline">
                Copyright © 2025 Motorqe.com. All Rights Reserved.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
