import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/ui/star-rating";
import type { ReviewData } from "@shared/schema";
import { useReviewSession } from "@/hooks/useReviewState";

export default function ConfirmFeedback() {
  const [, setLocation] = useLocation();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const session = useReviewSession();

  useEffect(() => {
    const data = session.loadFromSession('submittedReview');
    if (data) {
      setReviewData(data);
    } else {
      setLocation("/");
    }
  }, [setLocation, session]);

  if (!reviewData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Service Booking Review</h1>
          <p className="text-gray-600">now rate this provider in seconds with just a few clicks</p>
        </div>

        {/* Success Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-motorqe-orange rounded-full flex items-center justify-center text-white font-medium">
              <Check className="h-4 w-4" />
            </div>
            <span className="motorqe-orange font-medium">Service Review Submitted</span>
          </div>
        </div>

        {/* Service Provider Card with Review */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-black mb-8">How Was Your Experience With This Service Provider:</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">{reviewData.serviceProvider}</h3>
            <p className="text-gray-900 text-base mb-4">{reviewData.location}</p>
            
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-bold text-black">Booked On: </span>
                <span className="text-gray-900">{reviewData.bookingDate}</span>
              </div>
              <div>
                <span className="font-bold text-black">Time: </span>
                <span className="text-gray-900">{reviewData.bookingTime}</span>
              </div>
            </div>
          </div>

          {/* Submitted Rating */}
          <div className="flex justify-center mb-10">
            <StarRating 
              rating={reviewData.rating} 
              size="lg"
              readonly
            />
          </div>

          {/* Submitted Feedback */}
          <div className="mb-10">
            <label className="block text-gray-600 font-medium mb-4 text-center text-lg">
              Write you feedback <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="max-w-md mx-auto">
              <div className="w-full p-4 border border-gray-300 rounded-lg text-gray-600 min-h-[120px] bg-white">
                {reviewData.feedback || "The garage did a great job in and managed to identify & fix the problem instantly without any difficulty. Overall I would recommend to anyone."}
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-orange-500 mb-2">Thank you !</h3>
            <p className="text-orange-500 text-lg">for sharing your review</p>
          </div>

          {/* Important Information */}
          <div className="space-y-6">
            <div>
              <p className="font-bold text-black underline mb-2 text-lg">Important Information</p>
              <p className="text-gray-900">Terms & Conditions & Policies Apply.</p>
            </div>

            <div>
              <p className="font-bold text-black underline text-lg">Copyright © 2025 Motorqe.Com. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
