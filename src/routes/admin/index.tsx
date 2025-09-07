import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useWebSocket } from "../../services/ws";
import {
  useParkingStateReport,
  useCategoriesAdmin,
  useSubscriptions,
  useUpdateCategory,
  useToggleZone,
  useCreateRushHour,
  useCreateVacation,
} from "../../services/api";
import AdminReports from "../../components/AdminReports";

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Zustand stores
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    adminActiveTab,
    showRushHourModal,
    showVacationModal,
    showCategoryModal,
    selectedCategory,
    setAdminActiveTab,
    setShowRushHourModal,
    setShowVacationModal,
    setShowCategoryModal,
    setSelectedCategory,
  } = useUIStore();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket connection for admin updates
  const { isConnected: wsConnected, adminLog } = useWebSocket("admin");

  // React Query hooks
  const { data: parkingReport = [], isLoading: reportLoading } =
    useParkingStateReport();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesAdmin();
  const { data: subscriptions = [], isLoading: subscriptionsLoading } =
    useSubscriptions();

  // Mutations
  const updateCategoryMutation = useUpdateCategory();
  const toggleZoneMutation = useToggleZone();
  const createRushHourMutation = useCreateRushHour();
  const createVacationMutation = useCreateVacation();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      window.location.href = "/login";
    }
  }, [isAuthenticated, user]);

  const handleToggleZone = (zoneId: string, open: boolean) => {
    toggleZoneMutation.mutate({ id: zoneId, open });
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = (categoryId: string, data: any) => {
    updateCategoryMutation.mutate(
      { id: categoryId, data },
      {
        onSuccess: () => {
          setShowCategoryModal(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const handleAddRushHour = (data: any) => {
    createRushHourMutation.mutate(data, {
      onSuccess: () => {
        setShowRushHourModal(false);
      },
    });
  };

  const handleAddVacation = (data: any) => {
    createVacationMutation.mutate(data, {
      onSuccess: () => {
        setShowVacationModal(false);
      },
    });
  };

  // If not authenticated or not admin, show loading
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminReports
      parkingReport={parkingReport}
      categories={categories}
      subscriptions={subscriptions}
      isLoading={{
        report: reportLoading,
        categories: categoriesLoading,
        subscriptions: subscriptionsLoading,
      }}
      onToggleZone={handleToggleZone}
      onEditCategory={handleEditCategory}
      onUpdateCategory={handleUpdateCategory}
      onAddRushHour={handleAddRushHour}
      onAddVacation={handleAddVacation}
      adminLog={adminLog}
    />
  );
};

export default AdminDashboard;
