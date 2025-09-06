import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Users,
  Settings,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

const ZonesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    gateIds: [],
  });

  const queryClient = useQueryClient();

  // Fetch zones
  const {
    data: zones = [],
    isLoading: zonesLoading,
    error: zonesError,
    refetch: refetchZones,
  } = useQuery({
    queryKey: ["zones"],
    queryFn: () => apiClient.request("/master/zones"),
  });

  // Fetch gates for dropdown
  const { data: gates = [], isLoading: gatesLoading } = useQuery({
    queryKey: ["gates"],
    queryFn: () => apiClient.request("/master/gates"),
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      capacity: "",
      gateIds: [],
    });
  }, []);

  const handleCreateZone = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const handleEditZone = useCallback((zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      capacity: zone.capacity?.toString() || "",
      gateIds: zone.gateIds || [],
    });
    setShowEditModal(true);
  }, []);

  const handleDeleteZone = useCallback((zone) => {
    setSelectedZone(zone);
    setShowDeleteModal(true);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // Implementation would go here for create/update
      console.log("Zone form submitted:", formData);
    },
    [formData]
  );

  const handleGateToggle = useCallback((gateId) => {
    setFormData((prev) => ({
      ...prev,
      gateIds: prev.gateIds.includes(gateId)
        ? prev.gateIds.filter((id) => id !== gateId)
        : [...prev.gateIds, gateId],
    }));
  }, []);

  // Memoized filtered zones for better performance
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchesSearch = zone.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [zones, searchTerm]);

  const getGateNames = useCallback(
    (gateIds) => {
      return gateIds
        .map((id) => gates.find((gate) => gate.id === id)?.name)
        .filter(Boolean)
        .join(", ");
    },
    [gates]
  );

  if (zonesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card variant="danger" className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            Error Loading Zones
          </h3>
          <p className="text-danger-600 mb-4">
            {zonesError.message || "Failed to load zones data"}
          </p>
          <Button onClick={() => refetchZones()} variant="danger">
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
          <h1 className="text-3xl font-bold text-gray-900">Zones Management</h1>
          <p className="text-gray-600 mt-1">
            Manage parking zones and their gate assignments
          </p>
        </div>
        <Button onClick={handleCreateZone} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Zone
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <Building2 className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">
                {zones.filter((zone) => zone.gateIds?.length > 0).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gates</p>
              <p className="text-2xl font-bold text-gray-900">{gates.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search zones by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetchZones()}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Zones Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Gates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {zone.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {zone.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {zone.capacity || "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {zone.gateIds?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {zone.gateIds.map((gateId) => {
                            const gate = gates.find((g) => g.id === gateId);
                            return (
                              <span
                                key={gateId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {gate?.name || gateId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          No gates assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        zone.gateIds?.length > 0
                          ? "bg-success-100 text-success-800"
                          : "bg-warning-100 text-warning-800"
                      }`}
                    >
                      {zone.gateIds?.length > 0 ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditZone(zone)}
                        className="flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteZone(zone)}
                        className="flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredZones.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No zones found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating a new zone"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ZonesManagement;
