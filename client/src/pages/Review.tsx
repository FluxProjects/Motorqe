import { useLocation, useSearchParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/ui/star-rating";
import { useReviewForm, useReviewSession } from "@/hooks/useReviewState";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Review() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const reviewForm = useReviewForm();
  const session = useReviewSession();
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Extract parameters from URL
  const showroomId = searchParams.get("showroomId");
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
  if ((!showroomId || !bookingId) && !hasRedirected) {
    toast({
      title: "Error",
      description: "Invalid review link - missing required parameters",
      variant: "destructive",
    });
    setHasRedirected(true); // avoid repeated redirect
    setLocation("/");
  }
}, [showroomId, bookingId, hasRedirected, setLocation]);

  useEffect(() => {
  let cancelled = false;

  const fetchShowroomData = async () => {
    if (!showroomId || !bookingId || cancelled) return;

    try {
      setIsLoading(true);

      const showroomResponse = await fetch(`/api/garages/${showroomId}`);
      if (!showroomResponse.ok) throw new Error("Garage not found");

      const bookingResponse = await fetch(`/api/service-booking/${bookingId}`);
      if (!bookingResponse.ok) throw new Error("Booking not found");

      const showroomData = await showroomResponse.json();
      const bookingData = await bookingResponse.json();

      if (!cancelled) {
        reviewForm.setServiceProvider({
          name: showroomData.name,
          location: showroomData.address,
          bookingDate: new Date(bookingData.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: `(From ${new Date(bookingData.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // change to false if you prefer 24-hour format
          })})`,
        });
      }

    } catch (error) {
      if (!cancelled) {
        toast({
          title: "Error",
          description: "Failed to load booking information",
          variant: "destructive",
        });
        setLocation("/");
      }
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  };

  fetchShowroomData();
  return () => { cancelled = true; }; // cleanup
}, [showroomId, bookingId]);


  const handleSubmit = () => {
    if (reviewForm.isValid) {
      const reviewData = reviewForm.getReviewData();
      session.moveToFeedback(reviewData);
      setLocation("/feedback");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          
          <div className="flex justify-center mb-8">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-8 mb-8 max-w-2xl mx-auto border border-gray-200">
            <Skeleton className="h-6 w-3/4 mb-8" />
            <Skeleton className="h-5 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            
            <div className="space-y-2 mb-6">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
            </div>
            
            <Skeleton className="h-24 w-full mb-8" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Service Booking Review</h1>
          <p className="text-gray-600">Now rate this provider in seconds with just a few clicks</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-motorqe-orange rounded-full flex items-center justify-center text-white font-medium">1</div>
            <span className="motorqe-orange font-medium">Service Review</span>
          </div>
        </div>

        {/* Service Provider Card */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8 max-w-2xl mx-auto border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-8">How Was Your Experience With This Service Provider:</h2>
          
          {reviewForm.serviceProvider && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-1">
                {reviewForm.serviceProvider.name}
                </h3>
                <p className="text-gray-900 text-sm mb-4">
                {reviewForm.serviceProvider.location}
                </p>

                <div className="space-y-1 text-sm">
                <div>
                    <span className="font-bold text-black">Booked On: </span>
                    <span className="text-gray-900">{reviewForm.serviceProvider.bookingDate}</span>
                </div>
                <div>
                    <span className="font-bold text-black">Time: </span>
                    <span className="text-gray-900">{reviewForm.serviceProvider.bookingTime}</span>
                </div>
                </div>
            </div>
            )}


          {/* Star Rating */}
          <div className="flex justify-center mb-8">
            <StarRating 
              rating={reviewForm.rating} 
              onRatingChange={reviewForm.updateRating}
              size="lg"
            />
          </div>

          {/* Feedback Section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">
              Write your feedback <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <Textarea
              rows={3}
              placeholder="Share your experience with other customers"
              value={reviewForm.feedback}
              onChange={(e) => reviewForm.updateFeedback(e.target.value)}
              className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[hsl(17,100%,60%)] focus:border-transparent"
            />
          </div>

          {/* Important Information */}
          <div>
            <div className="mb-4">
              <p className="font-bold text-black underline mb-1">Important Information</p>
              <p className="text-gray-900 text-sm">Terms & Conditions & Policies Apply.</p>
            </div>

            <div className="text-sm">
              <p className="font-bold text-black underline">Copyright © 2023 Motorqe.Com. All Rights Reserved.</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end items-center mb-8">
          <Button
            onClick={handleSubmit}
            disabled={!reviewForm.isValid}
            className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}