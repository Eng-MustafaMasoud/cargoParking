import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/Card.jsx";
import { Car, User, Lock } from "lucide-react";

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    console.log("Login attempt with credentials:", credentials);

    try {
      const result = await login(credentials);
      console.log("Login successful:", result);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-hero-pattern opacity-5 pointer-events-none"></div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-float pointer-events-none"></div>
      <div
        className="fixed bottom-20 right-10 w-32 h-32 bg-accent-200 rounded-full opacity-20 animate-float pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed top-1/2 left-1/4 w-16 h-16 bg-success-200 rounded-full opacity-20 animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-glow">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Cargo
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Parking Management System
          </p>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center">
            <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
            Dallas, Texas
          </p>
        </div>

        {/* Login Form */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-12 pr-4 py-3 text-sm block w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-12 pr-4 py-3 text-sm block w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 animate-fade-in">
                <p className="text-sm text-danger-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
