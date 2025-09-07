import { CheckCircle, Printer } from "lucide-react";
import Button from "./Button";

interface TicketData {
  id: string;
  type: string;
  zoneId: string;
  gateId: string;
  checkinAt: string;
}

interface Zone {
  name: string;
}

interface Gate {
  name: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: TicketData | null;
  zone?: Zone;
  gate?: Gate;
}

const TicketModal = ({
  isOpen,
  onClose,
  ticketData,
  zone,
  gate,
}: TicketModalProps) => {
  if (!isOpen || !ticketData) return null;

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={onClose}
            ></div>
          </div>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ticket Generated Successfully
                  </h3>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Ticket Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket ID:</span>
                      <span className="font-mono font-medium">
                        {ticketData.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{ticketData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span>{zone?.name || "Zone " + ticketData.zoneId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gate:</span>
                      <span>{gate?.name || "Gate " + ticketData.gateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Time:</span>
                      <span>
                        {new Date(ticketData.checkinAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={() => window.print()} variant="primary">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Ticket
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Ticket */}
      <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">PARKING TICKET</h1>
          <div className="border-2 border-black p-4 max-w-md mx-auto">
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="font-medium">Ticket ID:</span>
                <span className="font-mono">{ticketData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{ticketData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Zone:</span>
                <span>{zone?.name || "Zone " + ticketData.zoneId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gate:</span>
                <span>{gate?.name || "Gate " + ticketData.gateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in:</span>
                <span>{new Date(ticketData.checkinAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-400 text-center">
              <p className="text-sm text-gray-600">
                Present this ticket at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketModal;
