import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../services/apiClient.jsx";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("AuthContext - Checking stored auth data:", {
      storedToken: !!storedToken,
      storedUser: !!storedUser,
    });

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log("AuthContext - Restored user:", parsedUser);
      } catch (error) {
        console.error("AuthContext - Error parsing stored user:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);


  const login = async (credentials) => {
    try {
      setError(null);
      console.log("AuthContext - Login attempt for:", credentials.username);

      // Trim whitespace from username and password
      const trimmedCredentials = {
        username: credentials.username?.trim(),
        password: credentials.password?.trim(),
      };

      const response = await apiClient.login(trimmedCredentials);
      console.log("AuthContext - Login response:", response);

      const { user: userData, token: userToken } = response;

      setUser(userData);
      setToken(userToken);

      // Store in localStorage
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("AuthContext - User logged in successfully:", userData);
      return response;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      console.error("AuthContext - Login failed:", errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
