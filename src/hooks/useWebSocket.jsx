import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const WS_URL = "ws://localhost:3000/api/v1/ws";

export const useWebSocket = (gateId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!gateId) return;

    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          setError(null);

          // Subscribe to the gate
          ws.send(
            JSON.stringify({
              type: "subscribe",
              payload: { gateId },
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);

            if (message.type === "zone-update") {
              // Invalidate zones queries to trigger refetch
              queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
              queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
              queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
            } else if (message.type === "admin-update") {
              // Handle admin updates
              console.log("Admin update received:", message.payload);

              // Invalidate relevant queries based on the update type
              const { targetType, action } = message.payload;

              switch (targetType) {
                case "category":
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "categories"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["master", "categories"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["master", "zones"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "zones"],
                  });
                  break;
                case "zone":
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "zones"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["master", "zones"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "reports"],
                  });
                  break;
                case "gate":
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "gates"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["master", "gates"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "zones"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["master", "zones"],
                  });
                  break;
                case "vacation":
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "vacations"],
                  });
                  break;
                case "rush":
                  queryClient.invalidateQueries({
                    queryKey: ["admin", "rush-hours"],
                  });
                  break;
                default:
                  // Invalidate all queries for unknown types
                  queryClient.invalidateQueries();
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (gateId) {
              connect();
            }
          }, 3000);
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
          setError("WebSocket connection error");
        };
      } catch (err) {
        console.error("Error creating WebSocket:", err);
        setError("Failed to create WebSocket connection");
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gateId, queryClient]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return {
    isConnected,
    error,
    sendMessage,
  };
};
