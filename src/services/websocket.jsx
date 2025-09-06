class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        console.log(
          "No authentication token found for WebSocket connection - skipping connection"
        );
        return;
      }

      // Include token in WebSocket URL or headers
      const WS_BASE_URL =
        import.meta.env.VITE_WS_URL || "ws://localhost:3000/api/v1/ws";
      const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
      console.log("Connecting to WebSocket with authentication...");
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected with authentication");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.payload);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        this.isConnected = false;

        // Check if it's an authentication error
        if (event.code === 1008 || event.code === 1002) {
          console.error("WebSocket authentication failed");
          this.emit("error", new Error("Authentication failed"));
          // Don't attempt reconnection for auth errors
          return;
        }

        this.emit("disconnected");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  subscribeToGate(gateId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          payload: { gateId },
        })
      );
    }
  }

  unsubscribeFromGate(gateId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          payload: { gateId },
        })
      );
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in WebSocket listener:", error);
        }
      });
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  onZoneUpdate(callback) {
    this.on("zone-update", callback);
  }

  onAdminUpdate(callback) {
    this.on("admin-update", callback);
  }

  onConnected(callback) {
    this.on("connected", callback);
  }

  onDisconnected(callback) {
    this.on("disconnected", callback);
  }

  onError(callback) {
    this.on("error", callback);
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Cannot send message:", message);
    }
  }
}

export const webSocketService = new WebSocketService();
