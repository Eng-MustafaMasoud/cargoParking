import React from "react";
import { useGates, useZones, useCheckinTicket } from "../hooks";

// Example component showing how to use the new React Query hooks
const ExampleUsage = () => {
  // Fetch gates data
  const {
    data: gates,
    isLoading: gatesLoading,
    error: gatesError,
  } = useGates();

  // Fetch zones for a specific gate
  const { data: zones, isLoading: zonesLoading } = useZones("gate_1");

  // Check-in mutation
  const checkinMutation = useCheckinTicket();

  const handleCheckin = () => {
    checkinMutation.mutate(
      {
        gateId: "gate_1",
        zoneId: "zone_1",
        type: "visitor",
      },
      {
        onSuccess: (data) => {
          console.log("Check-in successful:", data);
        },
        onError: (error) => {
          console.error("Check-in failed:", error);
        },
      }
    );
  };

  if (gatesLoading) return <div>Loading gates...</div>;
  if (gatesError) return <div>Error loading gates: {gatesError.message}</div>;

  return (
    <div>
      <h2>Gates</h2>
      {gates?.map((gate) => (
        <div key={gate.id}>{gate.name}</div>
      ))}

      <h2>Zones</h2>
      {zonesLoading ? (
        <div>Loading zones...</div>
      ) : (
        zones?.map((zone) => (
          <div key={zone.id}>
            {zone.name} - Available: {zone.availableForVisitors}
          </div>
        ))
      )}

      <button onClick={handleCheckin} disabled={checkinMutation.isPending}>
        {checkinMutation.isPending ? "Checking in..." : "Check In"}
      </button>
    </div>
  );
};

export default ExampleUsage;
