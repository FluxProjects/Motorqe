import { useState, useCallback } from "react";
import type { ReviewData, ServiceProvider } from "@shared/schema";

// Review form state management
export function useReviewForm() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null);

  const resetForm = useCallback(() => {
    setRating(0);
    setFeedback("");
    setIsSubmitting(false);
  }, []);

  const updateRating = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const updateFeedback = useCallback((newFeedback: string) => {
    setFeedback(newFeedback);
  }, []);

  const getReviewData = useCallback((): ReviewData => {
     if (!serviceProvider) {
      throw new Error("Service provider data not loaded");
    }
    return {
      rating,
      feedback,
      serviceProvider: serviceProvider.name,
      location: serviceProvider.location,
      bookingDate: serviceProvider.bookingDate,
      bookingTime: serviceProvider.bookingTime
    };
  }, [rating, feedback, serviceProvider]);

   const isValid = rating > 0 && serviceProvider !== null;

  return {
    // State
    rating,
    feedback,
    serviceProvider,
    isSubmitting,
    isValid,
    
    // Actions
    updateRating,
    updateFeedback,
    setServiceProvider,
    setIsSubmitting,
    resetForm,
    getReviewData
  };
}

// Review session management
export function useReviewSession() {
  const [currentStep, setCurrentStep] = useState<'review' | 'feedback' | 'confirmation'>('review');
  const [submittedReview, setSubmittedReview] = useState<ReviewData | null>(null);

  const saveToSession = useCallback((key: string, data: any) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  }, []);

  const loadFromSession = useCallback((key: string) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('reviewData');
    sessionStorage.removeItem('submittedReview');
    setSubmittedReview(null);
    setCurrentStep('review');
  }, []);

  const moveToFeedback = useCallback((reviewData: ReviewData) => {
    saveToSession('reviewData', reviewData);
    setCurrentStep('feedback');
  }, [saveToSession]);

  const moveToConfirmation = useCallback((finalReviewData: ReviewData) => {
    saveToSession('submittedReview', finalReviewData);
    setSubmittedReview(finalReviewData);
    setCurrentStep('confirmation');
  }, [saveToSession]);

  const goBack = useCallback(() => {
    if (currentStep === 'feedback') {
      setCurrentStep('review');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('feedback');
    }
  }, [currentStep]);

  return {
    // State
    currentStep,
    submittedReview,
    
    // Actions
    saveToSession,
    loadFromSession,
    clearSession,
    moveToFeedback,
    moveToConfirmation,
    goBack,
    setCurrentStep
  };
}