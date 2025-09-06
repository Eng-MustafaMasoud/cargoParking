// Authentication hooks
export { useLogin, useLogout } from "./useAuth.jsx";

// Master data hooks
export {
  useGates,
  useZones,
  useCategories,
  useSubscription,
} from "./useMasterData.jsx";

// Ticket hooks
export {
  useTicket,
  useCheckinTicket,
  useCheckoutTicket,
} from "./useTickets.jsx";

// Admin hooks
export {
  useParkingStateReport,
  useCategoriesAdmin,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useZonesAdmin,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useToggleZoneOpen,
  useGatesAdmin,
  useCreateGate,
  useUpdateGate,
  useDeleteGate,
  useRushHours,
  useCreateRushHour,
  useUpdateRushHour,
  useDeleteRushHour,
  useVacations,
  useCreateVacation,
  useUpdateVacation,
  useDeleteVacation,
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useUsers,
  useCreateUser,
  useTickets,
} from "./useAdmin.jsx";

// WebSocket hook
export { useWebSocket } from "./useWebSocket.jsx";
