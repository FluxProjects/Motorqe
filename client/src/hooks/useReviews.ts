import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Review, InsertReview } from "@shared/schema";

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: string) => [...reviewKeys.lists(), { filters }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: number) => [...reviewKeys.details(), id] as const,
};

// Get single review
export function useReview(id: number) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: async (): Promise<Review> => {
      const response = await apiRequest("GET", `/api/reviews/${id}`);
      return await response.json();
    },
    enabled: !!id,
  });
}

// Get all reviews (for future use)
export function useReviews() {
  return useQuery({
    queryKey: reviewKeys.lists(),
    queryFn: async (): Promise<Review[]> => {
      const response = await apiRequest("GET", "/api/reviews");
      return await response.json();
    },
  });
}

// Submit review mutation
export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: InsertReview): Promise<Review> => {
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      return await response.json();
    },
    onSuccess: (newReview) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      
      // Add the new review to the cache
      queryClient.setQueryData(reviewKeys.detail(newReview.id), newReview);
    },
  });
}

// Update review mutation (for future use)
export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertReview> }): Promise<Review> => {
      const response = await apiRequest("PATCH", `/api/reviews/${id}`, data);
      return await response.json();
    },
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.setQueryData(reviewKeys.detail(updatedReview.id), updatedReview);
    },
  });
}

// Delete review mutation (for future use)
export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.removeQueries({ queryKey: reviewKeys.detail(deletedId) });
    },
  });
}