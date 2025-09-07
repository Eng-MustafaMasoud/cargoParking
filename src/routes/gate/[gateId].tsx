import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useGates,
  useZones,
  useCategories,
  useCheckinTicket,
} from "../../services/api";
import { useWebSocket } from "../../services/ws";
import { useUIStore } from "../../store/uiStore";
import GateHeader from "../../components/GateHeader";
import ZoneCard from "../../components/ZoneCard";
import TicketModal from "../../components/TicketModal";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Users, Car, CheckCircle, AlertCircle } from "lucide-react";

const GateScreen = () => {
  const { gateId } = useParams<{ gateId: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Zustand store
  const {
    activeTab,
    selectedZone,
    subscriptionId,
    verifiedSubscription,
    showTicketModal,
    ticketData,
    setActiveTab,
    setSelectedZone,
    setSubscriptionId,
    setVerifiedSubscription,
    setShowTicketModal,
    setTicketData,
  } = useUIStore();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data using React Query hooks
  const { data: gates = [], isLoading: gatesLoading } = useGates();
  const {
    data: zones = [],
    isLoading: zonesLoading,
    error: zonesError,
  } = useZones(gateId || null);
  const { data: categories = [] } = useCategories();

  const currentGate = gates.find((gate) => gate.id === gateId);

  // WebSocket connection
  const { isConnected: wsConnected } = useWebSocket(gateId || null);

  // Check-in mutations
  const visitorCheckinMutation = useCheckinTicket();
  const subscriberCheckinMutation = useCheckinTicket();

  const handleZoneSelect = (zone: any) => {
    setSelectedZone(zone);
  };

  const handleVisitorCheckin = () => {
    if (selectedZone && gateId) {
      visitorCheckinMutation.mutate(
        {
          gateId,
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
    if (selectedZone && verifiedSubscription && gateId) {
      subscriberCheckinMutation.mutate(
        {
          gateId,
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

  const isZoneAvailableForVisitor = (zone: any) => {
    return zone.open && zone.availableForVisitors > 0;
  };

  const isZoneAvailableForSubscriber = (zone: any) => {
    return (
      zone.open &&
      zone.availableForSubscribers > 0 &&
      verifiedSubscription &&
      verifiedSubscription.category === zone.categoryId
    );
  };

  if (gatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no gate is selected, show gate selection
  if (!gateId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="w-4 h-4 mr-2">⏰</div>
                  {currentTime.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card title="Available Gates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gates.map((gate) => (
                <button
                  key={gate.id}
                  onClick={() => (window.location.href = `/gate/${gate.id}`)}
                  className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-primary-600 mr-3">📍</div>
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
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
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
      <GateHeader
        gateName={currentGate?.name || "Gate"}
        gateLocation={currentGate?.location}
        isConnected={wsConnected}
        currentTime={currentTime}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" role="tablist">
              <button
                onClick={() => setActiveTab("visitor")}
                className={`${
                  activeTab === "visitor"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                role="tab"
                aria-selected={activeTab === "visitor"}
                aria-controls="tabpanel-visitor"
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
                role="tab"
                aria-selected={activeTab === "subscriber"}
                aria-controls="tabpanel-subscriber"
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
                onClick={() => {
                  // This would need to be implemented with a subscription verification hook
                  console.log("Verify subscription:", subscriptionId);
                }}
                disabled={!subscriptionId.trim()}
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
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZone?.id === zone.id}
                  isAvailable={isAvailable}
                  activeTab={activeTab}
                  onSelect={handleZoneSelect}
                />
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
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticketData={ticketData}
        zone={selectedZone}
        gate={currentGate}
      />
    </div>
  );
};

export default GateScreen;
