import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

// Master data hooks (public endpoints)
export const useGates = () => {
  return useQuery({
    queryKey: ["master", "gates"],
    queryFn: () => apiClient.getGates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZones = (gateId = null) => {
  return useQuery({
    queryKey: ["master", "zones", gateId],
    queryFn: () => apiClient.getZones(gateId),
    staleTime: 30 * 1000, // 30 seconds (zones change frequently)
    enabled: true, // Always enabled, gateId can be null
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["master", "categories"],
    queryFn: () => apiClient.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubscription = (subscriptionId) => {
  return useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: () => apiClient.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
