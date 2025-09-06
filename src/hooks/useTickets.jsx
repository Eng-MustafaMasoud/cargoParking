import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

export const useTicket = (ticketId) => {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiClient.getTicket(ticketId),
    enabled: !!ticketId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCheckinTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.checkinTicket(data),
    onSuccess: (data) => {
      // Invalidate zones to refresh availability
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (error) => {
      console.error("Checkin error:", error);
    },
  });
};

export const useCheckoutTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.checkoutTicket(data),
    onSuccess: (data) => {
      // Invalidate zones to refresh availability
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (error) => {
      console.error("Checkout error:", error);
    },
  });
};
