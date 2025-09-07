import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

// Master data hooks (public endpoints)
export const useGates = () => {
  return useQuery({
    queryKey: ["master", "gates"],
    queryFn: () => apiClient.getGates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZones = (gateId: string | null = null) => {
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

export const useSubscription = (subscriptionId: string | null) => {
  return useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: () => apiClient.getSubscription(subscriptionId!),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Ticket hooks
export const useTicket = (ticketId: string | null) => {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiClient.getTicket(ticketId!),
    enabled: !!ticketId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCheckinTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      gateId: string;
      zoneId: string;
      type: "visitor" | "subscriber";
      subscriptionId?: string;
    }) => apiClient.checkinTicket(data),
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
    mutationFn: (data: { ticketId: string; forceConvertToVisitor?: boolean }) =>
      apiClient.checkoutTicket(data),
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

// Authentication hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      apiClient.login(credentials),
    onSuccess: (response) => {
      // Store token and user data
      if (response.token) {
        apiClient.setToken(response.token);
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

// Admin hooks
export const useParkingStateReport = () => {
  return useQuery({
    queryKey: ["admin", "reports", "parking-state"],
    queryFn: () => apiClient.getParkingStateReport(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCategoriesAdmin = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiClient.getCategoriesAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
    },
  });
};

export const useToggleZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, open }: { id: string; open: boolean }) =>
      apiClient.toggleZoneOpen(id, open),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
};

export const useCreateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { weekDay: number; from: string; to: string }) =>
      apiClient.createRushHour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; from: string; to: string }) =>
      apiClient.createVacation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => apiClient.getSubscriptions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string; password: string; role: string }) =>
      apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
