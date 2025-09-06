import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Home, AlertTriangle } from "lucide-react";
import Button from "../components/Button.jsx";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 to-danger-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-warning-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg">
            You don't have permission to access this resource.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            What does this mean?
          </h2>

          <ul className="text-left text-gray-600 space-y-2 mb-6">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
              You may need to log in with a different account
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
              Your current role doesn't have access to this feature
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
              Contact your administrator for access
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="primary"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
