import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Car, 
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'employee' })
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  // Fetch parking state report
  const { data: parkingReport = [], isLoading: reportLoading, error: reportError } = useQuery({
    queryKey: ['parking-report'],
    queryFn: () => apiClient.getParkingStateReport(),
    retry: 3,
    retryDelay: 1000,
  })

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData) => apiClient.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      setNewUser({ username: '', password: '', role: 'employee' })
    },
  })

  // Update zone status mutation
  const updateZoneMutation = useMutation({
    mutationFn: ({ zoneId, isOpen }) => apiClient.updateZoneStatus(zoneId, isOpen),
    onSuccess: () => {
      queryClient.invalidateQueries(['parking-report'])
    },
  })

  // Update category rates mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, rates }) => apiClient.updateCategoryRates(categoryId, rates),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['parking-report'])
    },
  })

  const handleCreateUser = (e) => {
    e.preventDefault()
    createUserMutation.mutate(newUser)
  }

  const handleZoneToggle = (zoneId, isOpen) => {
    updateZoneMutation.mutate({ zoneId, isOpen: !isOpen })
  }

  const handleCategoryRateUpdate = (categoryId, newRates) => {
    updateCategoryMutation.mutate({ categoryId, rates: newRates })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'control', label: 'Control Panel', icon: Settings },
  ]

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-600">
            Admin access required.
          </p>
        </div>
      </div>
    )
  }

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
              <p className="text-sm text-gray-600">
                Welcome, {user.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Error Display */}
            {reportError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Unable to load parking data
                    </h3>
                    <p className="text-sm text-red-600 mt-1">
                      {reportError.message || "Please check your connection and try again."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Data Display */}
            {!reportLoading && !reportError && parkingReport.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      No Data Available
                    </h3>
                    <p className="text-sm text-yellow-600 mt-1">
                      No parking zones found. Please check your backend connection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-primary-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Zones</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupied</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.reduce((sum, zone) => sum + zone.occupied, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.reduce((sum, zone) => sum + zone.free, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {parkingReport.reduce((sum, zone) => sum + (zone.subscriberCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parking Zones Table */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Parking Zones</h3>
                <button
                  onClick={() => queryClient.invalidateQueries(['parking-report'])}
                  className="btn-secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>

              {reportLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading parking data...</p>
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
                          Occupied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Free
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reserved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parkingReport.map((zone) => (
                        <tr key={zone.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {zone.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {zone.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              zone.open
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {zone.open ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {zone.occupied}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {zone.free}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {zone.reserved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleZoneToggle(zone.id, zone.open)}
                              disabled={updateZoneMutation.isPending}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                zone.open
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              } disabled:opacity-50`}
                            >
                              {updateZoneMutation.isPending ? 'Updating...' : zone.open ? 'Close' : 'Open'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Create New Employee</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input"
                    required
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="input"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">All Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel Tab */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Category Rate Management</h3>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-600">
                        Normal: ${category.rateNormal} | Special: ${category.rateSpecial || 'N/A'}
                      </p>
                    </div>
                    <button className="btn-secondary">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Rates
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
