import { useLocation, useParams } from "wouter";
import { useEffect, useState } from "react";
import { AdminCarListing, CarMake, CarModel } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function FeatureAdUpgrade() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const listingId = Number(params.id);

  const [selectedPlan, setSelectedPlan] = useState<{
    label: string;
    price: number;
    days: number;
  } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    { label: "7 Days", price: 100, days: 7 },
    { label: "14 Days", price: 150, days: 14 },
    { label: "30 Days", price: 200, days: 30 },
    { label: "1 Week Homepage", price: 350, days: 7 },
  ];

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
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
      if (!res.ok) throw new Error("Failed to fetch listing");
      return res.json();
    },
    enabled: !!listingId && isAuthenticated,
  });

  const { data: make } = useQuery<CarMake>({
    queryKey: ["car-make", listing?.make_id],
    queryFn: () =>
      fetch(`/api/car-makes/${listing?.make_id}`).then((res) => res.json()),
    enabled: !!listing?.make_id,
  });

  const { data: model } = useQuery<CarModel>({
    queryKey: ["car-model", listing?.model_id],
    queryFn: () =>
      fetch(`/api/car-model/${listing?.model_id}`).then((res) => res.json()),
    enabled: !!listing?.model_id,
  });

  if (!isAuthenticated || isLoading)
    return <div className="text-center mt-10">{t("common.loading")}</div>;
  if (isError)
    return (
      <div className="text-center mt-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );

  const handleSubmit = async () => {
    if (!selectedPlan || !acceptedTerms || !user?.id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listing-feature-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          requestedBy: user.id,
          requestedDays: selectedPlan.days,
          price: selectedPlan.price,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit upgrade request");

      const data = await response.json();
      console.log("Created feature upgrade request:", data);

      // Navigate using the new request's ID
      navigate(`/feature-upgrade-confirmation/${data.id}?price=${selectedPlan.price}&currency=${selectedPlan.currency || "QAR"}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900">Feature Plan</h3>
          <p className="text-neutral-500 text-center">
            Sell your car in seconds with just a few clicks
          </p>
        </div>
        <div className="bg-white min-h-screen py-8">
          <div className="max-w-xl mx-auto px-4">
            {/* Step Indicator */}
            <div className="flex justify-center items-center mb-10">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-orange-500 text-white flex items-center justify-center">
                  1
                </div>
                <span className="ml-2 font-semibold text-orange-500">
                  Select Type Of Ad
                </span>
              </div>
              <span className="mx-2 text-gray-400">➔</span>
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-gray-300 text-white flex items-center justify-center">
                  2
                </div>
                <span className="ml-2 text-gray-400">Confirm</span>
              </div>
            </div>

            {/* Listing Details */}
            <div className="text-center mb-10">
              <h3 className="text-xl font-bold text-gray-900">
                Select Featured Ad
              </h3>
            </div>
            <div className="text-left mb-10">
              <p className="mt-2 text-lg font-bold">
                {listing?.year} {make?.name} {model?.name}
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

            {/* Plan Selection */}
            <div className="grid gap-3 mb-4 pl-20 pr-20">
              {plans.map((plan) => (
                <button
                  key={plan.label}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`py-3 rounded-md font-semibold ${
                    selectedPlan?.label === plan.label
                      ? "bg-orange-500 text-white"
                      : "bg-blue-900 text-white"
                  }`}
                >
                  {plan.label} (QR.
                  {plan?.price != null
                    ? Number(plan.price).toLocaleString("en-US")
                    : "-"}
                  )
                </button>
              ))}
            </div>

            {/* Terms */}
            <div className="border p-4 rounded-md mb-4">
              <p className="text-sm text-gray-600 mb-2">
                * Your Ad will stay among the top listings of the same make &
                model. <br />* Homepage Ad: Your Featured Ad will be listed on
                the homepage & stay among the top listings.
              </p>
            </div>

            {/* Total Price */}
            <div className="bg-orange-500 text-white p-4 text-center">
              <div className="text-xl justify-end items-end text-right font-bold">
                Total Price:{" "}
                {selectedPlan?.price != null
                  ? Number(selectedPlan.price).toLocaleString("en-US")
                  : "-"}
              </div>
              <label className="flex items-center justify-end space-x-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                />
                <span className="text-sm text-right">
                  Yes, I agree to Terms & Conditions and Privacy Policy
                </span>
              </label>
            </div>
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedPlan || !acceptedTerms || isSubmitting}
            className={`w-[150px] py-3 rounded-md font-bold ${
              !selectedPlan || !acceptedTerms || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 text-white"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
