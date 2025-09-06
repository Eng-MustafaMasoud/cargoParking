import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Tag,
  Settings,
  Filter,
  X,
} from "lucide-react";

const CategoriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    rateNormal: "",
    rateSpecial: "",
  });

  const queryClient = useQueryClient();

  // Fetch categories data
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiClient.request("/admin/categories"),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) =>
      apiClient.request("/admin/categories", {
        method: "POST",
        body: JSON.stringify(categoryData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setShowModal(false);
      resetForm();
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...categoryData }) =>
      apiClient.request(`/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setShowModal(false);
      resetForm();
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) =>
      apiClient.request(`/admin/categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
    },
  });

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      rateNormal: "",
      rateSpecial: "",
    });
    setEditingCategory(null);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle create/edit category
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      
      const categoryData = {
        name: formData.name.trim(),
        rateNormal: parseFloat(formData.rateNormal),
        rateSpecial: parseFloat(formData.rateSpecial),
      };

      if (editingCategory) {
        updateCategoryMutation.mutate({
          id: editingCategory.id,
          ...categoryData,
        });
      } else {
        createCategoryMutation.mutate(categoryData);
      }
    },
    [formData, editingCategory, createCategoryMutation, updateCategoryMutation]
  );

  // Handle edit category
  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      rateNormal: category.rateNormal.toString(),
      rateSpecial: category.rateSpecial.toString(),
    });
    setShowModal(true);
  }, []);

  // Handle delete category
  const handleDelete = useCallback((category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  }, [deleteCategoryMutation]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  // Handle open create modal
  const handleCreate = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card variant="danger" className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger-700 mb-2">
            Error Loading Categories
          </h3>
          <p className="text-danger-600 mb-4">
            {categoriesError.message || "Failed to load categories data"}
          </p>
          <Button onClick={() => refetchCategories()} variant="danger">
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
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">
            Manage parking categories and pricing rates
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetchCategories()}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Tag className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Normal Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                ${categories.length > 0 
                  ? (categories.reduce((sum, cat) => sum + cat.rateNormal, 0) / categories.length).toFixed(2)
                  : "0.00"
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Settings className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Special Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                ${categories.length > 0 
                  ? (categories.reduce((sum, cat) => sum + cat.rateSpecial, 0) / categories.length).toFixed(2)
                  : "0.00"
                }
              </p>
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Special Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate Difference
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => {
                const rateDifference = category.rateSpecial - category.rateNormal;
                const rateDifferencePercent = ((rateDifference / category.rateNormal) * 100).toFixed(1);
                
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {category.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${category.rateNormal.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${category.rateSpecial.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          rateDifference > 0 ? 'text-success-600' : 'text-gray-500'
                        }`}>
                          +{rateDifferencePercent}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          (${rateDifference.toFixed(2)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by creating a new category."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Create New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rateNormal" className="block text-sm font-medium text-gray-700 mb-2">
                Normal Rate ($/hour)
              </label>
              <input
                type="number"
                id="rateNormal"
                name="rateNormal"
                value={formData.rateNormal}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="rateSpecial" className="block text-sm font-medium text-gray-700 mb-2">
                Special Rate ($/hour)
              </label>
              <input
                type="number"
                id="rateSpecial"
                name="rateSpecial"
                value={formData.rateSpecial}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                <LoadingSpinner size="sm" className="mr-2" />
              )}
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
