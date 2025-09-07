import { useState } from "react";
import {
  MapPin,
  Users,
  Activity,
  TrendingUp,
  Settings,
  Edit,
  Plus,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { BarChart, PieChart } from "./charts";

interface Zone {
  id: string;
  name: string;
  location?: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  rateNormal: number;
  rateSpecial: number;
}

interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Array<any>;
  expiresAt: string;
}

interface AdminReportsProps {
  parkingReport: Zone[];
  categories: Category[];
  subscriptions: Subscription[];
  isLoading: {
    report: boolean;
    categories: boolean;
    subscriptions: boolean;
  };
  onToggleZone: (zoneId: string, open: boolean) => void;
  onEditCategory: (category: Category) => void;
  onUpdateCategory: (categoryId: string, data: any) => void;
  onAddRushHour: (data: any) => void;
  onAddVacation: (data: any) => void;
  adminLog: Array<{
    action: string;
    timestamp: string;
    adminId: string;
  }>;
}

const AdminReports = ({
  parkingReport,
  categories,
  subscriptions,
  isLoading,
  onToggleZone,
  onEditCategory,
  onUpdateCategory,
  onAddRushHour,
  onAddVacation,
  adminLog,
}: AdminReportsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

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
  const processZoneData = (zones: Zone[]) => {
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

  const processOccupancyData = (zones: Zone[]) => {
    return zones.map((zone) => ({
      name: zone.name,
      occupied: zone.occupied || 0,
      available: (zone.totalSlots || zone.capacity || 0) - (zone.occupied || 0),
    }));
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "zones", name: "Zones", icon: Settings },
    { id: "categories", name: "Categories", icon: MapPin },
    { id: "subscriptions", name: "Subscriptions", icon: Users },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" role="tablist">
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
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
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
          <div
            id="tabpanel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
          >
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
                  {isLoading.report ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
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
                  {isLoading.report ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Zone Status">
                  {isLoading.report ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
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
                                    onToggleZone(zone.id, !zone.open)
                                  }
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
                      <p className="text-gray-500 text-sm">
                        No recent activity
                      </p>
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
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div
            id="tabpanel-categories"
            role="tabpanel"
            aria-labelledby="tab-categories"
          >
            <Card title="Category Management">
              {isLoading.categories ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
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
                            <p className="text-sm text-gray-500">
                              Special Rate
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${category.rateSpecial}/hr
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditCategory(category)}
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
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div
            id="tabpanel-settings"
            role="tabpanel"
            aria-labelledby="tab-settings"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Rush Hours">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Manage Rush Hours
                  </h3>
                  <Button size="sm" onClick={() => onAddRushHour({})}>
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
                  <Button size="sm" onClick={() => onAddVacation({})}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vacation
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Configure vacation periods for special rates
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
