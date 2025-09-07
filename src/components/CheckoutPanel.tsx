import { useState } from "react";
import {
  DollarSign,
  AlertCircle,
  ArrowRight,
  User,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";
import Button from "./Button";
import Card from "./Card";

interface User {
  username: string;
  name?: string;
}

interface TicketData {
  id: string;
  type: string;
  zoneId: string;
  checkinAt: string;
  subscriptionId?: string;
}

interface SubscriptionData {
  id: string;
  userName: string;
  category: string;
  cars: Array<{
    plate: string;
    brand: string;
    model: string;
    color: string;
  }>;
}

interface CheckoutData {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: Array<{
    from: string;
    to: string;
    hours: number;
    rateMode: string;
    rate: number;
    amount: number;
  }>;
  amount: number;
}

interface CheckoutPanelProps {
  isAuthenticated: boolean;
  user: User | null;
  wsConnected: boolean;
  currentTime: Date;
  onLogin: (credentials: { username: string; password: string }) => void;
  onLogout: () => void;
  onTicketLookup: (ticketId: string) => void;
  onCheckout: (forceConvertToVisitor?: boolean) => void;
  ticketId: string;
  setTicketId: (id: string) => void;
  ticketData: TicketData | null;
  subscriptionData: SubscriptionData | null;
  checkoutData: CheckoutData | null;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
  isLoading: {
    login: boolean;
    ticketLookup: boolean;
    checkout: boolean;
  };
}

const CheckoutPanel = ({
  isAuthenticated,
  user,
  wsConnected,
  currentTime,
  onLogin,
  onLogout,
  onTicketLookup,
  onCheckout,
  ticketId,
  setTicketId,
  ticketData,
  subscriptionData,
  checkoutData,
  showCheckoutModal,
  setShowCheckoutModal,
  isLoading,
}: CheckoutPanelProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Employee Checkpoint
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access the checkout system
            </p>
          </div>

          <Card>
            <EmployeeLoginForm onSubmit={onLogin} isLoading={isLoading.login} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                onClick={onLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                      onTicketLookup(ticketId);
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => onTicketLookup(ticketId)}
                  disabled={!ticketId.trim() || isLoading.ticketLookup}
                  isLoading={isLoading.ticketLookup}
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
          <TicketDetails
            ticketData={ticketData}
            subscriptionData={subscriptionData}
            onCheckout={onCheckout}
            isLoading={isLoading.checkout}
          />
        )}

        {/* Checkout Results Modal */}
        {showCheckoutModal && checkoutData && (
          <CheckoutModal
            checkoutData={checkoutData}
            onClose={() => setShowCheckoutModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Employee Login Form Component
const EmployeeLoginForm = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (credentials: { username: string; password: string }) => void;
  isLoading: boolean;
}) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your password"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
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

// Ticket Details Component
const TicketDetails = ({
  ticketData,
  subscriptionData,
  onCheckout,
  isLoading,
}: {
  ticketData: TicketData;
  subscriptionData: SubscriptionData | null;
  onCheckout: (forceConvertToVisitor?: boolean) => void;
  isLoading: boolean;
}) => {
  return (
    <Card title="Ticket Details" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-5 w-5 text-green-500 mr-3">✓</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ticket ID</p>
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
                Zone {ticketData.zoneId}
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
                      <p className="font-medium text-gray-900">{car.plate}</p>
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
              onClick={() => onCheckout(false)}
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="w-full"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Process Checkout
            </Button>

            {ticketData.type === "subscriber" && (
              <Button
                onClick={() => onCheckout(true)}
                disabled={isLoading}
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
  );
};

// Checkout Modal Component
const CheckoutModal = ({
  checkoutData,
  onClose,
}: {
  checkoutData: CheckoutData;
  onClose: () => void;
}) => {
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 text-green-500 mx-auto mb-4">✓</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Payment Processed Successfully
                </h3>
              </div>

              {/* Duration and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="h-8 w-8 text-blue-500 mx-auto mb-2">⏰</div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDuration(checkoutData.durationHours)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="h-8 w-8 text-green-500 mx-auto mb-2">$</div>
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
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => window.print()} variant="primary">
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPanel;
