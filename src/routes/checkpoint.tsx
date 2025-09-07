import { useState, useEffect } from "react";
import { useLogin, useTicket, useCheckoutTicket } from "../services/api";
import { useWebSocket } from "../services/ws";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import CheckoutPanel from "../components/CheckoutPanel";

const CheckpointScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Zustand stores
  const {
    user,
    isAuthenticated,
    login: authLogin,
    logout: authLogout,
  } = useAuthStore();
  const {
    ticketId,
    ticketData,
    checkoutData,
    showCheckoutModal,
    subscriptionData,
    setTicketId,
    setTicketData,
    setCheckoutData,
    setShowCheckoutModal,
    setSubscriptionData,
  } = useUIStore();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket connection
  const { isConnected: wsConnected } = useWebSocket("checkpoint");

  // React Query hooks
  const loginMutation = useLogin();
  const ticketLookupMutation = useTicket(ticketId || null);
  const checkoutMutation = useCheckoutTicket();

  // Handle login
  const handleLogin = (credentials: { username: string; password: string }) => {
    loginMutation.mutate(credentials, {
      onSuccess: (response) => {
        authLogin(response.user, response.token);
      },
      onError: (error) => {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
      },
    });
  };

  // Handle logout
  const handleLogout = () => {
    authLogout();
    setTicketData(null);
    setCheckoutData(null);
    setSubscriptionData(null);
    setTicketId("");
  };

  // Handle ticket lookup
  const handleTicketLookup = (id: string) => {
    if (id.trim()) {
      setTicketId(id.trim());
      // The useTicket hook will automatically fetch when ticketId changes
    }
  };

  // Handle checkout
  const handleCheckout = (forceConvertToVisitor = false) => {
    if (ticketData) {
      checkoutMutation.mutate(
        {
          ticketId: ticketData.id,
          forceConvertToVisitor,
        },
        {
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
        }
      );
    }
  };

  // Update ticket data when lookup succeeds
  useEffect(() => {
    if (ticketLookupMutation.data) {
      setTicketData(ticketLookupMutation.data);
      // If it's a subscriber ticket, fetch subscription data
      if (
        ticketLookupMutation.data.type === "subscriber" &&
        ticketLookupMutation.data.subscriptionId
      ) {
        // This would need to be implemented with a subscription hook
        console.log(
          "Fetch subscription data for:",
          ticketLookupMutation.data.subscriptionId
        );
      }
    }
  }, [ticketLookupMutation.data, setTicketData]);

  return (
    <CheckoutPanel
      isAuthenticated={isAuthenticated}
      user={user}
      wsConnected={wsConnected}
      currentTime={currentTime}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onTicketLookup={handleTicketLookup}
      onCheckout={handleCheckout}
      ticketId={ticketId}
      setTicketId={setTicketId}
      ticketData={ticketData}
      subscriptionData={subscriptionData}
      checkoutData={checkoutData}
      showCheckoutModal={showCheckoutModal}
      setShowCheckoutModal={setShowCheckoutModal}
      isLoading={{
        login: loginMutation.isPending,
        ticketLookup: ticketLookupMutation.isLoading,
        checkout: checkoutMutation.isPending,
      }}
    />
  );
};

export default CheckpointScreen;
