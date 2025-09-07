import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  useGates,
  useZones,
  useCategories,
  useSubscription,
} from "../hooks/useMasterData.jsx";
import { useCheckinTicket, useCheckoutTicket } from "../hooks/useTickets.jsx";
import { useWebSocket } from "../hooks/useWebSocket.jsx";
import { apiClient } from "../services/apiClient.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { CardSkeleton } from "../components/SkeletonLoader.jsx";
import {
  Car,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

const GateScreen = () => {
  const { gateId } = useParams();
  const [activeTab, setActiveTab] = useState("visitor");
  const [selectedZone, setSelectedZone] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [verifiedSubscription, setVerifiedSubscription] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedGateId, setSelectedGateId] = useState(gateId);
  const [adminLog, setAdminLog] = useState([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selectedGateId when gateId from URL changes
  useEffect(() => {
    if (gateId) {
      setSelectedGateId(gateId);
    }
  }, [gateId]);

  // Fetch data using new hooks
  const { data: gates = [], isLoading: gatesLoading } = useGates();
  const {
    data: zones = [],
    isLoading: zonesLoading,
    error: zonesError,
  } = useZones(selectedGateId);
  const { data: categories = [] } = useCategories();
  const { data: subscription, isLoading: subscriptionLoading } =
    useSubscription(verifiedSubscription?.id);

  const currentGate = gates.find((gate) => gate.id === selectedGateId);

  // Debug zones data
  useEffect(() => {
    console.log("Zones data:", zones);
    console.log("Zones loading:", zonesLoading);
    console.log("Zones error:", zonesError);
    console.log("Selected gate ID:", selectedGateId);
  }, [zones, zonesLoading, zonesError, selectedGateId]);

  // WebSocket connection
  const { isConnected: wsConnected } = useWebSocket(selectedGateId);

  // Check-in mutations
  const visitorCheckinMutation = useCheckinTicket();
  const subscriberCheckinMutation = useCheckinTicket();

  // Verify subscription
  const verifySubscriptionMutation = useMutation({
    mutationFn: (id) => apiClient.getSubscription(id),
    onSuccess: (subscription) => {
      setVerifiedSubscription(subscription);
    },
    onError: (error) => {
      console.error("Subscription verification failed:", error);
      setVerifiedSubscription(null);
      alert("Invalid subscription: " + error.message);
    },
  });

  const handleVerifySubscription = () => {
    if (subscriptionId.trim()) {
      verifySubscriptionMutation.mutate(subscriptionId.trim());
    }
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  };

  const handleVisitorCheckin = () => {
    if (selectedZone) {
      visitorCheckinMutation.mutate(
        {
          gateId: selectedGateId,
          zoneId: selectedZone.id,
          type: "visitor",
        },
        {
          onSuccess: (response) => {
            setTicketData(response.ticket);
            setShowTicketModal(true);
          },
          onError: (error) => {
            console.error("Visitor check-in failed:", error);
            alert("Check-in failed: " + error.message);
          },
        }
      );
    }
  };

  const handleSubscriberCheckin = () => {
    if (selectedZone && verifiedSubscription) {
      subscriberCheckinMutation.mutate(
        {
          gateId: selectedGateId,
          zoneId: selectedZone.id,
          type: "subscriber",
          subscriptionId: verifiedSubscription.id,
        },
        {
          onSuccess: (response) => {
            setTicketData(response.ticket);
            setShowTicketModal(true);
          },
          onError: (error) => {
            console.error("Subscriber check-in failed:", error);
            alert("Check-in failed: " + error.message);
          },
        }
      );
    }
  };

  const isZoneAvailableForVisitor = (zone) => {
    return zone.open && zone.availableForVisitors > 0;
  };

  const isZoneAvailableForSubscriber = (zone) => {
    return (
      zone.open &&
      zone.availableForSubscribers > 0 &&
      verifiedSubscription &&
      verifiedSubscription.category === zone.categoryId
    );
  };

  const getAvailabilityColor = (zone) => {
    if (!zone.open) return "text-gray-500";
    if (zone.availableForVisitors > 0) return "text-green-600";
    if (zone.availableForSubscribers > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityText = (zone) => {
    if (!zone.open) return "Closed";
    if (zone.availableForVisitors > 0)
      return `${zone.availableForVisitors} visitor slots`;
    if (zone.availableForSubscribers > 0)
      return `${zone.availableForSubscribers} subscriber slots`;
    return "Full";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  if (gatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no gate is selected, show gate selection
  if (!selectedGateId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full mb-3">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cargo Gates
                </h1>
                <p className="text-gray-600 mt-1">
                  Choose a gate to view zone availability
                </p>
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {currentTime.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card title="Available Gates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gates.map((gate) => (
                <button
                  key={gate.id}
                  onClick={() => setSelectedGateId(gate.id)}
                  className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{gate.name}</h3>
                      <p className="text-sm text-gray-500">{gate.location}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (zonesLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">
            Error loading zones: {zonesError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentGate?.name || "Gate"} - Check-in
              </h1>
              <p className="text-gray-600">
                {currentGate?.location || "Parking Gate"}
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
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("visitor")}
                className={`${
                  activeTab === "visitor"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Users className="h-4 w-4 mr-2" />
                Visitor
              </button>
              <button
                onClick={() => setActiveTab("subscriber")}
                className={`${
                  activeTab === "subscriber"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Car className="h-4 w-4 mr-2" />
                Subscriber
              </button>
            </nav>
          </div>
        </div>

        {/* Subscriber Subscription Verification */}
        {activeTab === "subscriber" && (
          <Card title="Verify Subscription" className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  placeholder="Enter subscription ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <Button
                onClick={handleVerifySubscription}
                disabled={
                  !subscriptionId.trim() || verifySubscriptionMutation.isPending
                }
                isLoading={verifySubscriptionMutation.isPending}
              >
                Verify
              </Button>
            </div>
            {verifiedSubscription && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Subscription verified for {verifiedSubscription.userName}
                    </p>
                    <p className="text-xs text-green-600">
                      Category: {verifiedSubscription.category} | Cars:{" "}
                      {verifiedSubscription.cars?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Zone Selection */}
        <Card title="Select Zone">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => {
              const isAvailable =
                activeTab === "visitor"
                  ? isZoneAvailableForVisitor(zone)
                  : isZoneAvailableForSubscriber(zone);

              return (
                <div
                  key={zone.id}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedZone?.id === zone.id
                      ? "border-primary-500 bg-primary-50"
                      : isAvailable
                      ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => isAvailable && handleZoneSelect(zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{zone.name}</h3>
                    <span
                      className={`text-sm font-medium ${getAvailabilityColor(
                        zone
                      )}`}
                    >
                      {getAvailabilityText(zone)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Slots:</span>
                      <span>{zone.totalSlots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occupied:</span>
                      <span>{zone.occupied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span>{zone.free}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved:</span>
                      <span>{zone.reserved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available (Visitors):</span>
                      <span>{zone.availableForVisitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available (Subscribers):</span>
                      <span>{zone.availableForSubscribers}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span>Rate (Normal):</span>
                      <span>${zone.rateNormal}/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rate (Special):</span>
                      <span>${zone.rateSpecial}/hr</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Check-in Button */}
        {selectedZone && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={
                activeTab === "visitor"
                  ? handleVisitorCheckin
                  : handleSubscriberCheckin
              }
              disabled={
                activeTab === "visitor"
                  ? !isZoneAvailableForVisitor(selectedZone) ||
                    visitorCheckinMutation.isPending
                  : !isZoneAvailableForSubscriber(selectedZone) ||
                    subscriberCheckinMutation.isPending
              }
              isLoading={
                activeTab === "visitor"
                  ? visitorCheckinMutation.isPending
                  : subscriberCheckinMutation.isPending
              }
              size="lg"
              className="px-8 py-3"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Check In {activeTab === "visitor" ? "Visitor" : "Subscriber"}
            </Button>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Check-in Successful"
      >
        {ticketData && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ticket Generated Successfully
              </h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ticket Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket ID:</span>
                  <span className="font-mono font-medium">{ticketData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{ticketData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zone:</span>
                  <span>{selectedZone?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gate:</span>
                  <span>{currentGate?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in Time:</span>
                  <span>{new Date(ticketData.checkinAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowTicketModal(false)}
              >
                Close
              </Button>
              <Button onClick={() => window.print()} variant="primary">
                Print Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GateScreen;
