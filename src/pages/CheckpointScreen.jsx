import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../services/apiClient.jsx";
import { useWebSocket } from "../hooks/useWebSocket.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import {
  Car,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
  ArrowRight,
  Wifi,
  WifiOff,
  LogOut,
} from "lucide-react";

const CheckpointScreen = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // WebSocket connection for real-time updates
  const { isConnected: wsConnected } = useWebSocket("checkpoint");

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => apiClient.login(credentials),
    onSuccess: (response) => {
      setUser(response.user);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      localStorage.setItem("user", JSON.stringify(response.user));
    },
    onError: (error) => {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message);
    },
  });

  // Ticket lookup mutation
  const ticketLookupMutation = useMutation({
    mutationFn: (id) => apiClient.getTicket(id),
    onSuccess: (ticket) => {
      setTicketData(ticket);
      // If it's a subscriber ticket, fetch subscription data
      if (ticket.type === "subscriber" && ticket.subscriptionId) {
        fetchSubscriptionData(ticket.subscriptionId);
      }
    },
    onError: (error) => {
      console.error("Ticket lookup failed:", error);
      setTicketData(null);
      alert("Ticket not found: " + error.message);
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (data) => apiClient.checkoutTicket(data),
    onSuccess: (response) => {
      setCheckoutData(response);
      setShowCheckoutModal(true);
      setTicketData(null);
      setTicketId("");
    },
    onError: (error) => {
      console.error("Checkout failed:", error);
      alert("Checkout failed: " + error.message);
    },
  });

  // Fetch subscription data
  const fetchSubscriptionData = async (subscriptionId) => {
    try {
      const subscription = await apiClient.getSubscription(subscriptionId);
      setSubscriptionData(subscription);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      setSubscriptionData(null);
    }
  };

  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setTicketData(null);
    setCheckoutData(null);
    setSubscriptionData(null);
    setTicketId("");
  };

  const handleTicketLookup = () => {
    if (ticketId.trim()) {
      ticketLookupMutation.mutate(ticketId.trim());
    }
  };

  const handleCheckout = (forceConvertToVisitor = false) => {
    if (ticketData) {
      checkoutMutation.mutate({
        ticketId: ticketData.id,
        forceConvertToVisitor,
      });
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Employee Checkpoint
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access the checkout system
            </p>
          </div>

          <Card>
            <EmployeeLoginForm
              onSubmit={handleLogin}
              isLoading={loginMutation.isPending}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Checkpoint - Check-out
              </h1>
              <p className="text-gray-600">
                Welcome, {user?.username || user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {wsConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span className="ml-2 text-sm text-gray-600">
                  {wsConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-lg font-mono">
                  {formatTime(currentTime)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Input Section */}
        <Card title="Ticket Checkout" className="mb-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket ID (Scan or Paste)
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter ticket ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleTicketLookup();
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleTicketLookup}
                  disabled={!ticketId.trim() || ticketLookupMutation.isPending}
                  isLoading={ticketLookupMutation.isPending}
                  size="lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Lookup
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Ticket Details */}
        {ticketData && (
          <Card title="Ticket Details" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Ticket ID
                      </p>
                      <p className="text-lg font-mono text-gray-600">
                        {ticketData.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {ticketData.type}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {ticketData.zoneName || "Zone " + ticketData.zoneId}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">Check-in Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(ticketData.checkinAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subscription Details (if applicable) */}
                {ticketData.type === "subscriber" && subscriptionData && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Subscription Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Subscriber:</span>
                        <span className="font-medium text-blue-900">
                          {subscriptionData.userName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Category:</span>
                        <span className="font-medium text-blue-900">
                          {subscriptionData.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cars:</span>
                        <span className="font-medium text-blue-900">
                          {subscriptionData.cars?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Car Verification (if subscription) */}
                {ticketData.type === "subscriber" && subscriptionData && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-3">
                      Car Verification
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Please verify the car matches the subscription:
                    </p>
                    <div className="space-y-2">
                      {subscriptionData.cars?.map((car, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {car.plate}
                            </p>
                            <p className="text-sm text-gray-500">
                              {car.brand} {car.model} ({car.color})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checkout Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => handleCheckout(false)}
                    disabled={checkoutMutation.isPending}
                    isLoading={checkoutMutation.isPending}
                    size="lg"
                    className="w-full"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Process Checkout
                  </Button>

                  {ticketData.type === "subscriber" && (
                    <Button
                      onClick={() => handleCheckout(true)}
                      disabled={checkoutMutation.isPending}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Convert to Visitor Rate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Checkout Results Modal */}
        <Modal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          title="Checkout Complete"
        >
          {checkoutData && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Payment Processed Successfully
                </h3>
              </div>

              {/* Duration and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDuration(checkoutData.durationHours)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${checkoutData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Rate Breakdown</h4>
                <div className="space-y-2">
                  {checkoutData.breakdown?.map((segment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(segment.from).toLocaleTimeString()} -{" "}
                          {new Date(segment.to).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDuration(segment.hours)} @{" "}
                          {segment.rateMode === "normal" ? "Normal" : "Special"}{" "}
                          Rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${segment.rate}/hr
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          ${segment.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                >
                  Close
                </Button>
                <Button onClick={() => window.print()} variant="primary">
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

// Employee Login Form Component
const EmployeeLoginForm = ({ onSubmit, isLoading }) => {
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(2, "Username must be at least 2 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(4, "Password must be at least 4 characters"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your username"
        />
        {formik.touched.username && formik.errors.username && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your password"
        />
        {formik.touched.password && formik.errors.password && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !formik.isValid}
        isLoading={isLoading}
        size="lg"
        className="w-full"
      >
        <User className="h-5 w-5 mr-2" />
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
};

export default CheckpointScreen;
