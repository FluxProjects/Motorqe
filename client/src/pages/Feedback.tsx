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
  const session = useReviewSession();
  const submitReviewMutation = useSubmitReview();

  useEffect(() => {
    const data = sessionStorage.getItem('reviewData');
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
    setLocation("/review?showroomId=2&bookingId=1");
  };

  const handleSend = async () => {
    if (!reviewData) return;

    const updatedReviewData = {
      ...reviewData,
      rating,
      feedback
    };

    try {
      const response = await apiRequest("POST", "/api/reviews", updatedReviewData);
      const result = await response.json();
      
      // Store the final review data for confirmation page
      session.moveToConfirmation(updatedReviewData);
      setLocation("/confirmfeedback");
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (!reviewData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-medium text-gray-600 mb-2">How was the experience</h2>
          <h3 className="text-2xl font-medium text-gray-600">With this Service Provider</h3>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center mb-20">
          <StarRating 
            rating={rating} 
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        {/* Feedback Input */}
        <div className="mb-16">
          <label className="block text-gray-600 font-medium mb-6 text-center text-xl">
            Write you feedback <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <Textarea
            rows={4}
            placeholder="Share your experience with other customers"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full resize-none border-2 border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-[hsl(17,100%,60%)] focus:border-transparent bg-white text-gray-600"
          />
        </div>

        {/* Thank You Message */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-medium text-gray-600 mb-3">Thank you !</h3>
          <p className="text-gray-500 text-lg">for sharing your review</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 max-w-sm mx-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="w-full py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-medium text-lg bg-white"
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
      </div>
    </div>
  );
}
