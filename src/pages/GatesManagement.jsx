import { useState, useEffect } from "react";
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
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const GatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGate, setSelectedGate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    zoneIds: [],
  });

  const queryClient = useQueryClient();

  // Fetch gates (admin endpoint)
  const {
    data: gates = [],
    isLoading: gatesLoading,
    error: gatesError,
    refetch: refetchGates,
  } = useQuery({
    queryKey: ["admin-gates"],
    queryFn: () => apiClient.request("/admin/gates"),
  });

  // Fetch zones for dropdown (public endpoint)
  const {
    data: zones = [],
    isLoading: zonesLoading,
  } = useQuery({
    queryKey: ["master-zones"],
    queryFn: () => apiClient.request("/master/zones"),
  });

  // Create gate mutation
  const createGateMutation = useMutation({
    mutationFn: (gateData) =>
      apiClient.request("/admin/gates", {
        method: "POST",
        body: JSON.stringify(gateData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gates"]);
      setShowCreateModal(false);
      resetForm();
    },
  });

  // Update gate mutation
  const updateGateMutation = useMutation({
    mutationFn: ({ id, ...gateData }) =>
      apiClient.request(`/admin/gates/${id}`, {
        method: "PUT",
        body: JSON.stringify(gateData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gates"]);
      setShowEditModal(false);
      resetForm();
    },
  });

  // Delete gate mutation
  const deleteGateMutation = useMutation({
    mutationFn: (id) =>
      apiClient.request(`/admin/gates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gates"]);
      setShowDeleteModal(false);
      setSelectedGate(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      zoneIds: [],
    });
  };

  const handleCreateGate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditGate = (gate) => {
    setSelectedGate(gate);
    setFormData({
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zoneIds || [],
    });
    setShowEditModal(true);
  };

  const handleDeleteGate = (gate) => {
    setSelectedGate(gate);
    setShowDeleteModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showCreateModal) {
      createGateMutation.mutate(formData);
    } else if (showEditModal) {
      updateGateMutation.mutate({ id: selectedGate.id, ...formData });
    }
  };

  const handleZoneToggle = (zoneId) => {
    setFormData((prev) => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter((id) => id !== zoneId)
        : [...prev.zoneIds, zoneId],
    }));
  };

  // Filter gates based on search
  const filteredGates = gates.filter((gate) => {
    const matchesSearch = gate.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      gate.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });


  if (gatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (gatesError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card variant="danger" className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            Error Loading Gates
          </h3>
          <p className="text-danger-600 mb-4">
            {gatesError.message || "Failed to load gates data"}
          </p>
          <Button onClick={() => refetchGates()} variant="danger">
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
          <h1 className="text-3xl font-bold text-gray-900">Gates Management</h1>
          <p className="text-gray-600 mt-1">
            Manage parking gates and their zone assignments
          </p>
        </div>
        <Button onClick={handleCreateGate} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Gate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gates</p>
              <p className="text-2xl font-bold text-gray-900">{gates.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <MapPin className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Gates</p>
              <p className="text-2xl font-bold text-gray-900">
                {gates.filter((gate) => gate.zoneIds?.length > 0).length}
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
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
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
                placeholder="Search gates by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetchGates()}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Gates Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Zones
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
              {filteredGates.map((gate) => (
                <tr key={gate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {gate.name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {gate.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {gate.location || "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {gate.zoneIds?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {gate.zoneIds.map((zoneId) => {
                            const zone = zones.find((z) => z.id === zoneId);
                            return (
                              <span
                                key={zoneId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {zone?.name || zoneId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No zones assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gate.zoneIds?.length > 0
                          ? "bg-success-100 text-success-800"
                          : "bg-warning-100 text-warning-800"
                      }`}
                    >
                      {gate.zoneIds?.length > 0 ? (
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
                        onClick={() => handleEditGate(gate)}
                        className="flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteGate(gate)}
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

          {filteredGates.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No gates found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating a new gate"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {showCreateModal ? "Create New Gate" : "Edit Gate"}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Gate Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter gate name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter gate location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign Zones
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {zones.map((zone) => (
                              <label
                                key={zone.id}
                                className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.zoneIds.includes(zone.id)}
                                  onChange={() => handleZoneToggle(zone.id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                  {zone.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    isLoading={
                      createGateMutation.isPending ||
                      updateGateMutation.isPending
                    }
                    className="w-full sm:w-auto sm:ml-3"
                  >
                    {showCreateModal ? "Create Gate" : "Update Gate"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedGate(null);
              }}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-danger-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Gate
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the gate{" "}
                        <span className="font-medium text-gray-900">
                          "{selectedGate.name}"
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={() => deleteGateMutation.mutate(selectedGate.id)}
                  isLoading={deleteGateMutation.isPending}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedGate(null);
                  }}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatesManagement;
