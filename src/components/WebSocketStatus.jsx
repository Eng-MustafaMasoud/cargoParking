import { useState, useEffect } from "react";
import { webSocketService } from "../services/websocket.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

const WebSocketStatus = () => {
  const [status, setStatus] = useState("disconnected");
  const [lastMessage, setLastMessage] = useState(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Only connect WebSocket if user is authenticated
    if (isLoading || !user) {
      console.log(
        "WebSocketStatus - Skipping WebSocket connection (not authenticated)"
      );
      return;
    }

    console.log(
      "WebSocketStatus - Setting up WebSocket connection for authenticated user"
    );
    const handleConnected = () => {
      setStatus("connected");
    };

    const handleDisconnected = () => {
      setStatus("disconnected");
    };

    const handleError = (error) => {
      setStatus("error");
      console.error("WebSocket error:", error);
    };

    const handleMessage = (data) => {
      setLastMessage(data);
    };

    // Listen to WebSocket events
    webSocketService.on("connected", handleConnected);
    webSocketService.on("disconnected", handleDisconnected);
    webSocketService.on("error", handleError);
    webSocketService.on("zone-update", handleMessage);
    webSocketService.on("admin-update", handleMessage);

    // Connect WebSocket
    webSocketService.connect();

    return () => {
      webSocketService.off("connected", handleConnected);
      webSocketService.off("disconnected", handleDisconnected);
      webSocketService.off("error", handleError);
      webSocketService.off("zone-update", handleMessage);
      webSocketService.off("admin-update", handleMessage);
    };
  }, [user, isLoading]);

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-success-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-danger-600" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "WebSocket Connected";
      case "error":
        return "WebSocket Error";
      default:
        return "WebSocket Disconnected";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-success-600 bg-success-50 border-success-200";
      case "error":
        return "text-danger-600 bg-danger-50 border-danger-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {lastMessage && (
          <span className="text-xs opacity-75">
            (Last: {lastMessage.type || "message"})
          </span>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatus;
