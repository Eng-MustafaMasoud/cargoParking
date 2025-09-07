import { useState } from "react";
import { MapPin, Users, Car, AlertCircle } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  categoryId: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean;
}

interface ZoneCardProps {
  zone: Zone;
  isSelected: boolean;
  isAvailable: boolean;
  activeTab: "visitor" | "subscriber";
  onSelect: (zone: Zone) => void;
}

const ZoneCard = ({
  zone,
  isSelected,
  isAvailable,
  activeTab,
  onSelect,
}: ZoneCardProps) => {
  const getAvailabilityColor = (zone: Zone) => {
    if (!zone.open) return "text-gray-500";
    if (zone.availableForVisitors > 0) return "text-green-600";
    if (zone.availableForSubscribers > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityText = (zone: Zone) => {
    if (!zone.open) return "Closed";
    if (zone.availableForVisitors > 0)
      return `${zone.availableForVisitors} visitor slots`;
    if (zone.availableForSubscribers > 0)
      return `${zone.availableForSubscribers} subscriber slots`;
    return "Full";
  };

  const getAvailabilityIcon = (zone: Zone) => {
    if (!zone.open) return <AlertCircle className="h-4 w-4" />;
    if (zone.availableForVisitors > 0) return <Users className="h-4 w-4" />;
    if (zone.availableForSubscribers > 0) return <Car className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div
      className={`p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-primary-500 bg-primary-50"
          : isAvailable
          ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
      }`}
      onClick={() => isAvailable && onSelect(zone)}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      aria-label={`Select ${zone.name} zone`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isAvailable) {
            onSelect(zone);
          }
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          {zone.name}
        </h3>
        <span
          className={`text-sm font-medium flex items-center ${getAvailabilityColor(
            zone
          )}`}
        >
          {getAvailabilityIcon(zone)}
          <span className="ml-1">{getAvailabilityText(zone)}</span>
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total Slots:</span>
          <span>{zone.totalSlots}</span>
        </div>
        <div className="flex justify-between">
          <span>Occupied:</span>
          <span>{zone.occupied}</span>
        </div>
        <div className="flex justify-between">
          <span>Free:</span>
          <span>{zone.free}</span>
        </div>
        <div className="flex justify-between">
          <span>Reserved:</span>
          <span>{zone.reserved}</span>
        </div>
        <div className="flex justify-between">
          <span>Available (Visitors):</span>
          <span>{zone.availableForVisitors}</span>
        </div>
        <div className="flex justify-between">
          <span>Available (Subscribers):</span>
          <span>{zone.availableForSubscribers}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span>Rate (Normal):</span>
          <span>${zone.rateNormal}/hr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Rate (Special):</span>
          <span
            className={zone.specialActive ? "font-bold text-orange-600" : ""}
          >
            ${zone.rateSpecial}/hr
            {zone.specialActive && (
              <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">
                ACTIVE
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ZoneCard;
