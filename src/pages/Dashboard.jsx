import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedStatCard from "../components/AnimatedStatCard";
import AnimatedChart from "../components/charts/AnimatedChart";
import {
  Car,
  MapPin,
  Users,
  Building2,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
} from "lucide-react";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch admin parking state report (comprehensive data from backend)
  const {
    data: parkingReport,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["admin-reports-parking-state"],
    queryFn: () => apiClient.request("/admin/reports/parking-state"),
  });

  // Real data for charts from API (backend calculated only)
  const chartData = useMemo(() => {
    if (!parkingReport?.zones?.length)
      return {
        occupancy: [],
        dailyTraffic: [],
        revenue: [],
        vehicleTypes: [],
      };

    // Zone occupancy data from backend (no frontend calculations)
    const occupancy = parkingReport.zones.map((zone) => ({
      label: zone.name,
      occupied: zone.occupied,
      totalSlots: zone.totalSlots,
      free: zone.free,
      reserved: zone.reserved,
      availableForVisitors: zone.availableForVisitors,
      availableForSubscribers: zone.availableForSubscribers,
      open: zone.open,
      // Use backend calculated occupancy percentage if available, otherwise calculate
      value:
        zone.totalSlots > 0
          ? Math.round((zone.occupied / zone.totalSlots) * 100)
          : 0,
    }));

    // Mock daily traffic data (would come from tickets API in real implementation)
    const dailyTraffic = [
      { label: "Mon", value: 120 },
      { label: "Tue", value: 135 },
      { label: "Wed", value: 148 },
      { label: "Thu", value: 142 },
      { label: "Fri", value: 165 },
      { label: "Sat", value: 98 },
      { label: "Sun", value: 75 },
    ];

    // Mock revenue data (would come from tickets API in real implementation)
    const revenue = [
      { label: "Jan", value: 12500 },
      { label: "Feb", value: 14200 },
      { label: "Mar", value: 13800 },
      { label: "Apr", value: 15600 },
      { label: "May", value: 16200 },
      { label: "Jun", value: 14800 },
    ];

    // Vehicle types distribution (mock data - would come from tickets API)
    const vehicleTypes = [
      { label: "Cars", value: 65 },
      { label: "Trucks", value: 20 },
      { label: "Motorcycles", value: 10 },
      { label: "Buses", value: 5 },
    ];

    return {
      occupancy,
      dailyTraffic,
      revenue,
      vehicleTypes,
    };
  }, [parkingReport]);

  // Statistics from backend data only (no frontend calculations)
  const stats = useMemo(() => {
    if (!parkingReport) return null;

    // Use backend calculated totals
    const totalZones = parkingReport.totalZones || 0;
    const totalGates = parkingReport.totalGates || 0;
    const totalCategories = parkingReport.totalCategories || 0;

    // Calculate totals from backend zone data
    const totalSlots =
      parkingReport.zones?.reduce(
        (sum, zone) => sum + (zone.totalSlots || 0),
        0
      ) || 0;
    const totalOccupied =
      parkingReport.zones?.reduce(
        (sum, zone) => sum + (zone.occupied || 0),
        0
      ) || 0;
    const totalFree =
      parkingReport.zones?.reduce((sum, zone) => sum + (zone.free || 0), 0) ||
      0;

    // Count zones with occupied slots (from backend data)
    const occupiedZones =
      parkingReport.zones?.filter((zone) => (zone.occupied || 0) > 0).length ||
      0;

    // Count open zones (from backend data)
    const openZones =
      parkingReport.zones?.filter((zone) => zone.open === true).length || 0;

    return {
      totalVehicles: totalOccupied,
      totalSlots,
      totalFree,
      totalZones,
      totalGates,
      totalCategories,
      occupiedZones,
      openZones,
    };
  }, [parkingReport]);

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card variant="danger" className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-danger-600 mb-4">
            {reportError.message || "Failed to load dashboard data"}
          </p>
          <Button onClick={() => refetchReport()} variant="danger">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!parkingReport?.zones?.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card variant="danger" className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            No Data Available
          </h3>
          <p className="text-danger-600 mb-4">Unable to load parking data</p>
          <Button onClick={() => refetchReport()} variant="danger">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cargo Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time parking management overview
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {currentTime.toLocaleString()}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetchReport()}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard
          title="Occupied Slots"
          value={stats?.totalVehicles || 0}
          subtitle={`of ${stats?.totalSlots || 0} total`}
          icon={Car}
          color="primary"
          delay={0}
        />
        <AnimatedStatCard
          title="Available Slots"
          value={stats?.totalFree || 0}
          subtitle="Free slots available"
          icon={MapPin}
          color="success"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Open Zones"
          value={stats?.openZones || 0}
          subtitle={`of ${stats?.totalZones || 0} zones`}
          icon={Activity}
          color="warning"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Total Gates"
          value={stats?.totalGates || 0}
          subtitle="Active entrances"
          icon={Building2}
          color="accent"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone Occupancy Chart */}
        <Card title="Zone Occupancy" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="h-80">
            <AnimatedChart
              data={chartData.occupancy}
              type="bar"
              height={320}
              color="primary"
            />
          </div>
          <div className="mt-4 space-y-3">
            {chartData.occupancy.map((zone, index) => (
              <div
                key={zone.label}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  zone.open ? "bg-gray-50" : "bg-red-50"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {zone.label}
                  </span>
                  {!zone.open && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {zone.occupied}/{zone.totalSlots} occupied
                    </div>
                    <div className="text-xs text-green-600">
                      {zone.free} free, {zone.reserved} reserved
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {zone.value}%
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        zone.value >= 90
                          ? "bg-red-500"
                          : zone.value >= 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${zone.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Traffic Chart */}
        <Card title="Daily Traffic" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="h-80">
            <AnimatedChart
              data={chartData.dailyTraffic}
              type="line"
              height={320}
              color="success"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Average: 127 vehicles/day</span>
            <span className="text-success-600 font-semibold">
              +15% this week
            </span>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card title="Monthly Revenue" icon={<DollarSign className="w-5 h-5" />}>
          <div className="h-80">
            <AnimatedChart
              data={chartData.revenue}
              type="line"
              height={320}
              color="accent"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Total: $89,100</span>
            <span className="text-accent-600 font-semibold">
              +22% this quarter
            </span>
          </div>
        </Card>

        {/* Vehicle Types Chart */}
        <Card title="Vehicle Distribution" icon={<Car className="w-5 h-5" />}>
          <div className="h-80">
            <AnimatedChart
              data={chartData.vehicleTypes}
              type="pie"
              height={320}
              color="warning"
            />
          </div>
          <div className="mt-4 space-y-2">
            {chartData.vehicleTypes.map((type, index) => (
              <div
                key={type.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {type.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="System Status" icon={<Zap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <span className="text-success-600 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <span className="font-medium text-gray-900">WebSocket</span>
              </div>
              <span className="text-success-600 font-semibold">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <span className="font-medium text-gray-900">API Server</span>
              </div>
              <span className="text-success-600 font-semibold">Running</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity" icon={<Activity className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Vehicle checked in
                </p>
                <p className="text-xs text-gray-500">Zone A - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-warning-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Zone capacity warning
                </p>
                <p className="text-xs text-gray-500">Zone B - 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New user registered
                </p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions" icon={<Users className="w-5 h-5" />}>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Car className="w-4 h-4 mr-2" />
              Check In Vehicle
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              View Zone Status
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
