import { create } from "zustand";

interface UIState {
  // Gate Screen State
  activeTab: "visitor" | "subscriber";
  selectedZone: any | null;
  subscriptionId: string;
  verifiedSubscription: any | null;
  showTicketModal: boolean;
  ticketData: any | null;

  // Checkpoint Screen State
  ticketId: string;
  checkoutData: any | null;
  showCheckoutModal: boolean;
  subscriptionData: any | null;

  // Admin Dashboard State
  adminActiveTab: string;
  showRushHourModal: boolean;
  showVacationModal: boolean;
  showCategoryModal: boolean;
  selectedCategory: any | null;

  // Global UI State
  currentTime: Date;
  sidebarOpen: boolean;

  // Actions
  setActiveTab: (tab: "visitor" | "subscriber") => void;
  setSelectedZone: (zone: any | null) => void;
  setSubscriptionId: (id: string) => void;
  setVerifiedSubscription: (subscription: any | null) => void;
  setShowTicketModal: (show: boolean) => void;
  setTicketData: (data: any | null) => void;

  setTicketId: (id: string) => void;
  setCheckoutData: (data: any | null) => void;
  setShowCheckoutModal: (show: boolean) => void;
  setSubscriptionData: (data: any | null) => void;

  setAdminActiveTab: (tab: string) => void;
  setShowRushHourModal: (show: boolean) => void;
  setShowVacationModal: (show: boolean) => void;
  setShowCategoryModal: (show: boolean) => void;
  setSelectedCategory: (category: any | null) => void;

  setCurrentTime: (time: Date) => void;
  setSidebarOpen: (open: boolean) => void;

  // Reset functions
  resetGateState: () => void;
  resetCheckpointState: () => void;
  resetAdminState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  activeTab: "visitor",
  selectedZone: null,
  subscriptionId: "",
  verifiedSubscription: null,
  showTicketModal: false,
  ticketData: null,

  ticketId: "",
  checkoutData: null,
  showCheckoutModal: false,
  subscriptionData: null,

  adminActiveTab: "overview",
  showRushHourModal: false,
  showVacationModal: false,
  showCategoryModal: false,
  selectedCategory: null,

  currentTime: new Date(),
  sidebarOpen: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  setSubscriptionId: (id) => set({ subscriptionId: id }),
  setVerifiedSubscription: (subscription) =>
    set({ verifiedSubscription: subscription }),
  setShowTicketModal: (show) => set({ showTicketModal: show }),
  setTicketData: (data) => set({ ticketData: data }),

  setTicketId: (id) => set({ ticketId: id }),
  setCheckoutData: (data) => set({ checkoutData: data }),
  setShowCheckoutModal: (show) => set({ showCheckoutModal: show }),
  setSubscriptionData: (data) => set({ subscriptionData: data }),

  setAdminActiveTab: (tab) => set({ adminActiveTab: tab }),
  setShowRushHourModal: (show) => set({ showRushHourModal: show }),
  setShowVacationModal: (show) => set({ showVacationModal: show }),
  setShowCategoryModal: (show) => set({ showCategoryModal: show }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Reset functions
  resetGateState: () =>
    set({
      activeTab: "visitor",
      selectedZone: null,
      subscriptionId: "",
      verifiedSubscription: null,
      showTicketModal: false,
      ticketData: null,
    }),

  resetCheckpointState: () =>
    set({
      ticketId: "",
      checkoutData: null,
      showCheckoutModal: false,
      subscriptionData: null,
    }),

  resetAdminState: () =>
    set({
      adminActiveTab: "overview",
      showRushHourModal: false,
      showVacationModal: false,
      showCategoryModal: false,
      selectedCategory: null,
    }),
}));
