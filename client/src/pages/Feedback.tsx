import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/ui/star-rating";
import type { ReviewData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useReviewSession } from "@/hooks/useReviewState";
import { useSubmitReview } from "@/hooks/useReviews";

export default function Feedback() {
  const [, setLocation] = useLocation();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false); // NEW
  const session = useReviewSession();
  const submitReviewMutation = useSubmitReview();

  useEffect(() => {
    const data = sessionStorage.getItem("reviewData");
    if (data) {
      const parsed = JSON.parse(data);
      setReviewData(parsed);
      setFeedback(parsed.feedback || "");
      setRating(parsed.rating || 0);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const handleBack = () => {
    if (reviewData?.showroomId && reviewData?.bookingId) {
      setLocation(`/review?showroomId=${reviewData.showroomId}&bookingId=${reviewData.bookingId}`);
    } else {
      setLocation("/");
    }
  };

  const handleSend = async () => {
    if (!reviewData) return;

    const updatedReviewData = {
      ...reviewData,
      rating,
      feedback,
    };

    try {
      await apiRequest("POST", "/api/reviews", updatedReviewData);
      session.moveToConfirmation(updatedReviewData);

      // Instead of navigating, show Thank You message here
      setShowThankYou(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (!reviewData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-20">
      <div className="max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Service Booking Review</h1>
          <p className="text-gray-600">Now rate this provider in seconds with just a few clicks</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">2</div>
            <span className="text-orange-500 font-medium">Service Review Submit</span>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl font-medium text-gray-600 mb-2">How was the experience</h2>
          <h3 className="text-2xl font-medium text-gray-600">With this Service Provider</h3>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center mb-12">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>

        {/* Feedback Input */}
        <div className="mb-16">
          <label className="block text-gray-600 font-medium mb-6 text-center text-xl">
            Write your feedback <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <Textarea
            rows={4}
            placeholder="Share your experience with other customers"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full resize-none border-2 border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-[hsl(17,100%,60%)] focus:border-transparent bg-white text-gray-600"
          />
        </div>

        {/* Thank You Message (after submission) */}
        {showThankYou && (
          <div className="text-center mb-16 transition-opacity duration-500">
            <h3 className="text-2xl font-medium text-orange-500 mb-3">Thank you!</h3>
            <p className="text-orange-500 text-lg">for sharing your review</p>
          </div>
        )}

        {/* Action Buttons */}
        {!showThankYou && (
          <div className="space-y-4 max-w-sm mx-auto">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full py-4 border-2 border-orange-500 text-blue-600 hover:bg-orange-600 hover:text-white rounded-lg font-medium text-lg bg-white"
            >
              Back
            </Button>
            <Button
              onClick={handleSend}
              disabled={submitReviewMutation.isPending || rating === 0}
              className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium text-lg"
            >
              {submitReviewMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
