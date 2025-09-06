import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BarChart3,
  TrendingUp,
  Users,
  Car,
  MapPin,
  Building2,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";

const Reports = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [reportType, setReportType] = useState("overview");

  // Fetch parking state report
  const {
    data: parkingReport,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["parking-report", dateRange],
    queryFn: () => apiClient.request("/admin/reports/parking-state"),
  });

  const handleExportReport = () => {
    // Implementation for exporting reports
    console.log("Exporting report...");
  };

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
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            Error Loading Reports
          </h3>
          <p className="text-danger-600 mb-4">
            {reportError.message || "Failed to load reports data"}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            View parking statistics and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => refetchReport()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="overview">Overview</option>
              <option value="zones">Zone Analysis</option>
              <option value="gates">Gate Usage</option>
              <option value="users">User Activity</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Vehicles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {parkingReport?.totalVehicles || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <MapPin className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">
                {parkingReport?.totalZones || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Building2 className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gates</p>
              <p className="text-2xl font-bold text-gray-900">
                {parkingReport?.totalGates || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Users className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Categories
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {parkingReport?.totalCategories || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zone Occupancy
            </h3>
            <div className="space-y-4">
              {parkingReport?.zones?.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {zone.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(zone.occupied / zone.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {zone.occupied}/{zone.capacity}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No zone data available
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    Vehicle checked in
                  </span>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    Zone capacity warning
                  </span>
                </div>
                <span className="text-xs text-gray-500">5 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    New user registered
                  </span>
                </div>
                <span className="text-xs text-gray-500">10 min ago</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
