import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiService } from "../services/api.jsx";
import { useWebSocket } from "../hooks/useWebSocket.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import {
  CardSkeleton,
  MetricCardSkeleton,
  ChartSkeleton,
} from "../components/SkeletonLoader.jsx";
import {
  Settings,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  MapPin,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import { BarChart, PieChart, LineChart, AreaChart } from "../components/charts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRushHourModal, setShowRushHourModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adminLog, setAdminLog] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Chart colors
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  // Helper functions for data processing
  const processZoneData = (zones) => {
    return zones.map((zone) => ({
      name: zone.name,
      occupied: zone.occupied || 0,
      capacity: zone.totalSlots || zone.capacity || 0,
      available: (zone.totalSlots || zone.capacity || 0) - (zone.occupied || 0),
      occupancyRate: (
        ((zone.occupied || 0) / (zone.totalSlots || zone.capacity || 1)) *
        100
      ).toFixed(1),
      status: zone.open ? "Open" : "Closed",
    }));
  };

  const processOccupancyData = (zones) => {
    return zones.map((zone) => ({
      name: zone.name,
      occupied: zone.occupied || 0,
      available: (zone.totalSlots || zone.capacity || 0) - (zone.occupied || 0),
    }));
  };

  const processRevenueData = (zones) => {
    // Mock revenue data - in real app this would come from API
    return zones.map((zone) => ({
      name: zone.name,
      revenue: Math.floor(Math.random() * 1000) + 500,
      tickets: Math.floor(Math.random() * 50) + 10,
    }));
  };

  const queryClient = useQueryClient();
  const { addListener, isConnected } = useWebSocket();

  // WebSocket connection for admin updates
  useEffect(() => {
    console.log("AdminDashboard - Setting up WebSocket listeners");

    // Set up event listeners
    const handleConnected = () => {
      console.log("AdminDashboard - WebSocket connected");
      setWsConnected(true);
    };

    const handleDisconnected = () => {
      console.log("AdminDashboard - WebSocket disconnected");
      setWsConnected(false);
    };

    const handleAdminUpdate = (update) => {
      console.log("AdminDashboard - Admin update received:", update);
      setAdminLog((prev) => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
      // Invalidate relevant queries
      queryClient.invalidateQueries(["parking-report"]);
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["subscriptions"]);
    };

    // Add event listeners using the hook
    addListener("connected", handleConnected);
    addListener("disconnected", handleDisconnected);
    addListener("admin-update", handleAdminUpdate);

    // Update connection status
    setWsConnected(isConnected);
  }, [queryClient, addListener, isConnected]);

  // Fetch parking state report
  const { data: parkingReport = [], isLoading: reportLoading } = useQuery({
    queryKey: ["parking-report"],
    queryFn: () => apiService.getParkingStateReport(),
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiService.getCategories(),
  });

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading: subscriptionsLoading } =
    useQuery({
      queryKey: ["subscriptions"],
      queryFn: () => apiService.getSubscriptions(),
    });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setShowCategoryModal(false);
      setSelectedCategory(null);
    },
  });

  // Toggle zone mutation
  const toggleZoneMutation = useMutation({
    mutationFn: ({ id, open }) => apiService.toggleZoneOpen(id, open),
    onSuccess: () => {
      queryClient.invalidateQueries(["parking-report"]);
    },
  });

  // Create rush hour mutation
  const createRushHourMutation = useMutation({
    mutationFn: (data) => apiService.createRushHour(data),
    onSuccess: () => {
      setShowRushHourModal(false);
    },
  });

  // Create vacation mutation
  const createVacationMutation = useMutation({
    mutationFn: (data) => apiService.createVacation(data),
    onSuccess: () => {
      setShowVacationModal(false);
    },
  });

  const handleUpdateCategory = (categoryId, newRates) => {
    updateCategoryMutation.mutate({
      id: categoryId,
      data: newRates,
    });
  };

  const handleToggleZone = (zoneId, open) => {
    toggleZoneMutation.mutate({
      id: zoneId,
      open,
    });
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleRushHourSubmit = (data) => {
    createRushHourMutation.mutate(data);
  };

  const handleVacationSubmit = (data) => {
    createVacationMutation.mutate(data);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "zones", name: "Zones", icon: Settings },
    { id: "categories", name: "Categories", icon: DollarSign },
    { id: "subscriptions", name: "Subscriptions", icon: Users },
    { id: "settings", name: "Settings", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage parking system settings and monitor status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {wsConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="ml-2 text-sm text-gray-600">
                  {wsConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPin className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Zones
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {parkingReport.filter((z) => z.open).length} open
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Active Subscriptions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {subscriptions.filter((s) => s.active).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subscriptions.length} total
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Occupied
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.reduce(
                        (sum, zone) => sum + (zone.occupied || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {parkingReport.reduce(
                        (sum, zone) =>
                          sum + (zone.totalSlots || zone.capacity || 0),
                        0
                      )}{" "}
                      total capacity
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Avg Occupancy
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.length > 0
                        ? (
                            parkingReport.reduce(
                              (sum, zone) =>
                                sum +
                                ((zone.occupied || 0) /
                                  (zone.totalSlots || zone.capacity || 1)) *
                                  100,
                              0
                            ) / parkingReport.length
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-500">across all zones</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Chart */}
              <Card title="Zone Occupancy">
                {reportLoading ? (
                  <ChartSkeleton />
                ) : (
                  <BarChart
                    data={processOccupancyData(parkingReport)}
                    title="Zone Occupancy"
                    height={300}
                    showLegend={true}
                    showGrid={true}
                    colors={["#3B82F6", "#10B981"]}
                  />
                )}
              </Card>

              {/* Occupancy Distribution Pie Chart */}
              <Card title="Occupancy Distribution">
                {reportLoading ? (
                  <ChartSkeleton />
                ) : (
                  <PieChart
                    data={processZoneData(parkingReport)}
                    title="Occupancy Distribution"
                    height={300}
                    showLegend={true}
                    colors={COLORS}
                  />
                )}
              </Card>
            </div>

            {/* Revenue and Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card title="Zone Revenue (Mock Data)">
                <AreaChart
                  data={processRevenueData(parkingReport)}
                  title="Zone Revenue"
                  height={300}
                  showLegend={false}
                  showGrid={true}
                  colors={["#8B5CF6"]}
                />
              </Card>

              {/* Activity Chart */}
              <Card title="Ticket Activity (Mock Data)">
                <LineChart
                  data={processRevenueData(parkingReport)}
                  title="Ticket Activity"
                  height={300}
                  showLegend={false}
                  showGrid={true}
                  colors={["#F59E0B"]}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Zone Status">
                {reportLoading ? (
                  <ChartSkeleton />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Zone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Occupancy
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parkingReport.map((zone) => (
                          <tr key={zone.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {zone.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  zone.open
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {zone.open ? "Open" : "Closed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {zone.occupied} / {zone.totalSlots}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {zone.availableForVisitors} visitors,{" "}
                              {zone.availableForSubscribers} subscribers
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                size="sm"
                                variant={zone.open ? "danger" : "success"}
                                onClick={() =>
                                  handleToggleZone(zone.id, !zone.open)
                                }
                                isLoading={toggleZoneMutation.isPending}
                              >
                                {zone.open ? "Close" : "Open"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Admin Activity Log">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {adminLog.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  ) : (
                    adminLog.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {log.action
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Zones Tab */}
        {activeTab === "zones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Zone Management
                </h2>
                <p className="text-gray-600">
                  Monitor and manage parking zones
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/zones")}
                variant="primary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Zones
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Zone Status Overview">
                {reportLoading ? (
                  <ChartSkeleton />
                ) : (
                  <div className="space-y-4">
                    {parkingReport.map((zone) => (
                      <div
                        key={zone.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {zone.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {zone.location}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                zone.open
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {zone.open ? "Open" : "Closed"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {zone.occupied || 0} /{" "}
                              {zone.totalSlots || zone.capacity || 0} occupied
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={zone.open ? "danger" : "success"}
                            onClick={() =>
                              handleToggleZone(zone.id, !zone.open)
                            }
                            isLoading={toggleZoneMutation.isPending}
                          >
                            {zone.open ? "Close" : "Open"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Zone Occupancy Chart">
                {reportLoading ? (
                  <ChartSkeleton />
                ) : (
                  <BarChart
                    data={processOccupancyData(parkingReport)}
                    title="Zone Occupancy"
                    height={300}
                    showLegend={true}
                    showGrid={true}
                    colors={["#3B82F6", "#10B981"]}
                  />
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <Card title="Category Management">
            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <MetricCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Normal Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${category.rateNormal}/hr
                          </p>
                          <p className="text-sm text-gray-500">Special Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${category.rateSpecial}/hr
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Subscription Management
                </h2>
                <p className="text-gray-600">
                  Monitor and manage user subscriptions
                </p>
              </div>
            </div>

            {/* Subscription Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Active Subscriptions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {subscriptions.filter((s) => s.active).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Expired Subscriptions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {subscriptions.filter((s) => !s.active).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Subscriptions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {subscriptions.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Chart */}
              <Card title="Subscription Status Distribution">
                {subscriptionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <CardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <PieChart
                    data={[
                      {
                        name: "Active",
                        value: subscriptions.filter((s) => s.active).length,
                      },
                      {
                        name: "Inactive",
                        value: subscriptions.filter((s) => !s.active).length,
                      },
                    ]}
                    title="Subscription Status"
                    height={300}
                    showLegend={true}
                    colors={["#10B981", "#EF4444"]}
                  />
                )}
              </Card>

              {/* Category Distribution */}
              <Card title="Subscriptions by Category">
                {subscriptionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <CardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <BarChart
                    data={Object.entries(
                      subscriptions.reduce((acc, sub) => {
                        acc[sub.category] = (acc[sub.category] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([category, count]) => ({
                      name: category,
                      value: count,
                    }))}
                    title="Subscriptions by Category"
                    height={300}
                    showLegend={false}
                    showGrid={true}
                    colors={["#3B82F6"]}
                  />
                )}
              </Card>
            </div>

            {/* Subscription Table */}
            <Card title="All Subscriptions">
              {subscriptionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cars
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subscription.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscription.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                subscription.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {subscription.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscription.cars?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              subscription.expiresAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Rush Hours">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Rush Hours
                </h3>
                <Button size="sm" onClick={() => setShowRushHourModal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rush Hour
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Configure special rate periods for all categories
              </p>
            </Card>

            <Card title="Vacations">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Vacations
                </h3>
                <Button size="sm" onClick={() => setShowVacationModal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Vacation
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Configure vacation periods for special rates
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Rush Hour Modal */}
      <Modal
        isOpen={showRushHourModal}
        onClose={() => setShowRushHourModal(false)}
        title="Add Rush Hour"
      >
        <RushHourForm onSubmit={handleRushHourSubmit} />
      </Modal>

      {/* Vacation Modal */}
      <Modal
        isOpen={showVacationModal}
        onClose={() => setShowVacationModal(false)}
        title="Add Vacation"
      >
        <VacationForm onSubmit={handleVacationSubmit} />
      </Modal>

      {/* Category Edit Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Edit Category Rates"
      >
        {selectedCategory && (
          <CategoryEditForm
            category={selectedCategory}
            onSubmit={handleUpdateCategory}
          />
        )}
      </Modal>
    </div>
  );
};

// Rush Hour Form Component
const RushHourForm = ({ onSubmit }) => {
  const validationSchema = Yup.object({
    weekDay: Yup.number()
      .min(0, "Invalid day")
      .max(6, "Invalid day")
      .required("Day of week is required"),
    from: Yup.string()
      .required("Start time is required")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    to: Yup.string()
      .required("End time is required")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .test(
        "time-comparison",
        "End time must be after start time",
        function (value) {
          const { from } = this.parent;
          if (from && value) {
            return (
              new Date(`2000-01-01T${value}`) > new Date(`2000-01-01T${from}`)
            );
          }
          return true;
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      weekDay: 1,
      from: "07:00",
      to: "09:00",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Day of Week
        </label>
        <select
          name="weekDay"
          value={formik.values.weekDay}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={1}>Monday</option>
          <option value={2}>Tuesday</option>
          <option value={3}>Wednesday</option>
          <option value={4}>Thursday</option>
          <option value={5}>Friday</option>
          <option value={6}>Saturday</option>
          <option value={0}>Sunday</option>
        </select>
        {formik.touched.weekDay && formik.errors.weekDay && (
          <p className="mt-1 text-sm text-danger-600">
            {formik.errors.weekDay}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="time"
            name="from"
            value={formik.values.from}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.from && formik.errors.from && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.from}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="time"
            name="to"
            value={formik.values.to}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.to && formik.errors.to && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.to}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
          {formik.isSubmitting ? "Adding..." : "Add Rush Hour"}
        </Button>
      </div>
    </form>
  );
};

// Vacation Form Component
const VacationForm = ({ onSubmit }) => {
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Vacation name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    from: Yup.date()
      .required("Start date is required")
      .min(new Date(), "Start date cannot be in the past"),
    to: Yup.date()
      .required("End date is required")
      .min(Yup.ref("from"), "End date must be after start date"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      from: "",
      to: "",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vacation Name
        </label>
        <input
          type="text"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Eid, Christmas"
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-1 text-sm text-danger-600">{formik.errors.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="date"
            name="from"
            value={formik.values.from}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.from && formik.errors.from && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.from}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="date"
            name="to"
            value={formik.values.to}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.to && formik.errors.to && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.to}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
          {formik.isSubmitting ? "Adding..." : "Add Vacation"}
        </Button>
      </div>
    </form>
  );
};

// Category Edit Form Component
const CategoryEditForm = ({ category, onSubmit }) => {
  const validationSchema = Yup.object({
    rateNormal: Yup.number()
      .required("Normal rate is required")
      .min(0, "Rate must be positive")
      .max(1000, "Rate cannot exceed $1000/hr"),
    rateSpecial: Yup.number()
      .required("Special rate is required")
      .min(0, "Rate must be positive")
      .max(1000, "Rate cannot exceed $1000/hr"),
  });

  const formik = useFormik({
    initialValues: {
      rateNormal: category.rateNormal,
      rateSpecial: category.rateSpecial,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(category.id, values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Edit {category.name} Rates
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Normal Rate ($/hr)
          </label>
          <input
            type="number"
            name="rateNormal"
            step="0.01"
            value={formik.values.rateNormal}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.rateNormal && formik.errors.rateNormal && (
            <p className="mt-1 text-sm text-danger-600">
              {formik.errors.rateNormal}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Rate ($/hr)
          </label>
          <input
            type="number"
            name="rateSpecial"
            step="0.01"
            value={formik.values.rateSpecial}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {formik.touched.rateSpecial && formik.errors.rateSpecial && (
            <p className="mt-1 text-sm text-danger-600">
              {formik.errors.rateSpecial}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
          {formik.isSubmitting ? "Updating..." : "Update Rates"}
        </Button>
      </div>
    </form>
  );
};

export default AdminDashboard;
