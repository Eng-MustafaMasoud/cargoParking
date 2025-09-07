import { Clock, Wifi, WifiOff } from "lucide-react";

interface GateHeaderProps {
  gateName: string;
  gateLocation?: string;
  isConnected: boolean;
  currentTime: Date;
}

const GateHeader = ({
  gateName,
  gateLocation,
  isConnected,
  currentTime,
}: GateHeaderProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {gateName} - Check-in
            </h1>
            {gateLocation && <p className="text-gray-600">{gateLocation}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="ml-2 text-sm text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-lg font-mono">{formatTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GateHeader;
