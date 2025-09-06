import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

// Admin reports
export const useParkingStateReport = () => {
  return useQuery({
    queryKey: ["admin", "reports", "parking-state"],
    queryFn: () => apiClient.getParkingStateReport(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Admin categories
export const useCategoriesAdmin = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiClient.getCategoriesAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["master", "categories"] });
    },
  });
};

// Admin zones
export const useZonesAdmin = () => {
  return useQuery({
    queryKey: ["admin", "zones"],
    queryFn: () => apiClient.getZonesAdmin(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
    },
  });
};

export const useToggleZoneOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, open }) => apiClient.toggleZoneOpen(id, open),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
};

// Admin gates
export const useGatesAdmin = () => {
  return useQuery({
    queryKey: ["admin", "gates"],
    queryFn: () => apiClient.getGatesAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createGate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
    },
  });
};

export const useUpdateGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateGate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
    },
  });
};

export const useDeleteGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.deleteGate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["master", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
    },
  });
};

// Admin rush hours
export const useRushHours = () => {
  return useQuery({
    queryKey: ["admin", "rush-hours"],
    queryFn: () => apiClient.getRushHours(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createRushHour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useUpdateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateRushHour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useDeleteRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.deleteRushHour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

// Admin vacations
export const useVacations = () => {
  return useQuery({
    queryKey: ["admin", "vacations"],
    queryFn: () => apiClient.getVacations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createVacation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useUpdateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateVacation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useDeleteVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.deleteVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

// Admin subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => apiClient.getSubscriptions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
    },
  });
};

// Admin users
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
    mutationFn: (data) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// Admin tickets
export const useTickets = (status = null) => {
  return useQuery({
    queryKey: ["admin", "tickets", status],
    queryFn: () => apiClient.getTickets(status),
    staleTime: 30 * 1000, // 30 seconds
  });
};
