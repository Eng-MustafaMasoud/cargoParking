import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../config/api";

const WS_URL = API_CONFIG.WS_URL;

export interface WebSocketMessage {
  type: "zone-update" | "admin-update";
  payload: any;
}

export interface AdminUpdatePayload {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  timestamp: string;
}

export const useWebSocket = (gateId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminLog, setAdminLog] = useState<AdminUpdatePayload[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log("WebSocket message received:", message);

            if (message.type === "zone-update") {
              // Invalidate zones queries to trigger refetch
              queryClient.invalidateQueries({ queryKey: ["master", "zones"] });
              queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
              queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
            } else if (message.type === "admin-update") {
              // Handle admin updates
              console.log("Admin update received:", message.payload);

              const adminUpdate = message.payload as AdminUpdatePayload;

              // Add to admin log
              setAdminLog((prev) => {
                const newLog = [adminUpdate, ...prev].slice(0, 50); // Keep last 50 entries
                return newLog;
              });

              // Invalidate relevant queries based on the update type
              const { targetType, action } = adminUpdate;

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

          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
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
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gateId, queryClient]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return {
    isConnected,
    error,
    adminLog,
    sendMessage,
    disconnect,
  };
};

// WebSocket connection manager for multiple gates
export const useWebSocketManager = () => {
  const [connections, setConnections] = useState<Map<string, WebSocket>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = (gateId: string) => {
    if (connections.has(gateId)) {
      return; // Already connected
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log(`WebSocket connected for gate ${gateId}`);
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

      ws.onclose = () => {
        console.log(`WebSocket disconnected for gate ${gateId}`);
        setConnections((prev) => {
          const newConnections = new Map(prev);
          newConnections.delete(gateId);
          return newConnections;
        });

        if (connections.size === 0) {
          setIsConnected(false);
        }
      };

      ws.onerror = (err) => {
        console.error(`WebSocket error for gate ${gateId}:`, err);
        setError(`WebSocket connection error for gate ${gateId}`);
      };

      setConnections((prev) => new Map(prev).set(gateId, ws));
    } catch (err) {
      console.error(`Error creating WebSocket for gate ${gateId}:`, err);
      setError(`Failed to create WebSocket connection for gate ${gateId}`);
    }
  };

  const disconnect = (gateId: string) => {
    const ws = connections.get(gateId);
    if (ws) {
      ws.close();
      setConnections((prev) => {
        const newConnections = new Map(prev);
        newConnections.delete(gateId);
        return newConnections;
      });
    }
  };

  const disconnectAll = () => {
    connections.forEach((ws) => ws.close());
    setConnections(new Map());
    setIsConnected(false);
  };

  return {
    isConnected,
    error,
    connect,
    disconnect,
    disconnectAll,
  };
};
