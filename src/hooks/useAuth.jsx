import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => {
      console.log("useLogin - Calling apiClient.login with:", credentials);
      return apiClient.login(credentials);
    },
    onSuccess: (data) => {
      console.log("useLogin - Success:", data);
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      console.error("useLogin - Error:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      apiClient.clearToken();
      localStorage.removeItem("user");
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries and reset cache
      queryClient.clear();
    },
  });
};
