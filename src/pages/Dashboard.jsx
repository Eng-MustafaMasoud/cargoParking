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

  // Fetch parking state report
  const {
    data: parkingReport,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["parking-report"],
    queryFn: () => apiClient.request("/admin/reports/parking-state"),
  });

  // Fetch gates data
  const { data: gates = [], isLoading: gatesLoading } = useQuery({
    queryKey: ["master-gates"],
    queryFn: () => apiClient.request("/master/gates"),
  });

  // Fetch zones data
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["master-zones"],
    queryFn: () => apiClient.request("/master/zones"),
  });

  // Mock data for charts (in a real app, this would come from the API)
  const chartData = useMemo(
    () => ({
      occupancy: [
        { label: "Zone A", value: 85 },
        { label: "Zone B", value: 92 },
        { label: "Zone C", value: 78 },
        { label: "Zone D", value: 95 },
        { label: "Zone E", value: 88 },
        { label: "Zone F", value: 76 },
      ],
      dailyTraffic: [
        { label: "Mon", value: 120 },
        { label: "Tue", value: 135 },
        { label: "Wed", value: 148 },
        { label: "Thu", value: 142 },
        { label: "Fri", value: 165 },
        { label: "Sat", value: 98 },
        { label: "Sun", value: 75 },
      ],
      revenue: [
        { label: "Jan", value: 12500 },
        { label: "Feb", value: 14200 },
        { label: "Mar", value: 13800 },
        { label: "Apr", value: 15600 },
        { label: "May", value: 16200 },
        { label: "Jun", value: 14800 },
      ],
      vehicleTypes: [
        { label: "Cars", value: 65 },
        { label: "Trucks", value: 20 },
        { label: "Motorcycles", value: 10 },
        { label: "Buses", value: 5 },
      ],
    }),
    []
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!parkingReport) return null;

    const totalVehicles = parkingReport.totalVehicles || 0;
    const totalZones = parkingReport.totalZones || 0;
    const totalGates = parkingReport.totalGates || 0;
    const totalCategories = parkingReport.totalCategories || 0;

    const occupiedZones =
      parkingReport.zones?.filter((zone) => zone.occupied > 0).length || 0;
    const occupancyRate =
      totalZones > 0 ? Math.round((occupiedZones / totalZones) * 100) : 0;

    return {
      totalVehicles,
      totalZones,
      totalGates,
      totalCategories,
      occupiedZones,
      occupancyRate,
    };
  }, [parkingReport]);

  if (reportLoading || gatesLoading || zonesLoading) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dallas Cargo Dashboard
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
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
          change="+12%"
          changeType="positive"
          icon={Car}
          color="primary"
          delay={0}
        />
        <AnimatedStatCard
          title="Active Zones"
          value={stats?.occupiedZones || 0}
          change="+8%"
          changeType="positive"
          icon={MapPin}
          color="success"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          change="+5%"
          changeType="positive"
          icon={Activity}
          color="warning"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Total Gates"
          value={stats?.totalGates || 0}
          change="+2%"
          changeType="positive"
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
          <div className="mt-4 grid grid-cols-2 gap-4">
            {chartData.occupancy.slice(0, 4).map((zone, index) => (
              <div
                key={zone.label}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {zone.label}
                </span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${zone.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {zone.value}%
                  </span>
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
