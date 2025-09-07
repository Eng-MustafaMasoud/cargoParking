import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../services/api'
import { wsService } from '../../services/ws'
import { Car, Users, Wifi, WifiOff } from 'lucide-react'

const GateScreen = () => {
  const { gateId } = useParams<{ gateId: string }>()
  const [activeTab, setActiveTab] = useState<'visitor' | 'subscriber'>('visitor')
  const [selectedZone, setSelectedZone] = useState<any>(null)
  const [subscriptionId, setSubscriptionId] = useState('')
  const [ticketModal, setTicketModal] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [wsConnected, setWsConnected] = useState(false)
  const queryClient = useQueryClient()

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // WebSocket connection
  useEffect(() => {
    wsService.connect('ws://localhost:3000/ws')
    
    const unsubscribe = wsService.subscribe('zone-update', (data) => {
      queryClient.invalidateQueries(['zones', gateId])
    })

    setWsConnected(wsService.isConnected)

    return () => {
      unsubscribe()
    }
  }, [gateId, queryClient])

  // Fetch gate data
  const { data: gate } = useQuery({
    queryKey: ['gate', gateId],
    queryFn: () => apiClient.getGates().then(gates => gates.find((g: any) => g.id === gateId)),
  })

  // Fetch zones
  const { data: zones = [] } = useQuery({
    queryKey: ['zones', gateId],
    queryFn: () => apiClient.getZones(gateId!),
  })

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: (data: any) => apiClient.checkinTicket(data),
    onSuccess: (ticket) => {
      setTicketModal(ticket)
      queryClient.invalidateQueries(['zones', gateId])
    },
  })

  const handleCheckin = () => {
    if (!selectedZone) return

    const data = {
      gateId,
      zoneId: selectedZone.id,
      type: activeTab,
      ...(activeTab === 'subscriber' && { subscriptionId }),
    }

    checkinMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gate {gate?.name || gateId}
              </h1>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {wsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'visitor', label: 'Visitor', icon: Users },
                { id: 'subscriber', label: 'Subscriber', icon: Car },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'visitor' | 'subscriber')}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Subscriber ID Input */}
        {activeTab === 'subscriber' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription ID
            </label>
            <input
              type="text"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="input max-w-md"
              placeholder="Enter subscription ID"
            />
          </div>
        )}

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {zones.map((zone: any) => (
            <div
              key={zone.id}
              className={`card cursor-pointer transition-all ${
                selectedZone?.id === zone.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : zone.open && zone.availableForVisitors > 0
                  ? 'hover:shadow-lg'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => zone.open && zone.availableForVisitors > 0 && setSelectedZone(zone)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {zone.name}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  zone.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {zone.open ? 'Open' : 'Closed'}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Category: {zone.category}</p>
                <p>Occupied: {zone.occupied}</p>
                <p>Free: {zone.free}</p>
                <p>Available for Visitors: {zone.availableForVisitors}</p>
                <div className="flex justify-between">
                  <span>Normal Rate: ${zone.rateNormal}</span>
                  {zone.rateSpecial && (
                    <span className="text-warning-600 font-medium">
                      Special: ${zone.rateSpecial}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Check-in Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCheckin}
            disabled={!selectedZone || checkinMutation.isPending}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
          >
            {checkinMutation.isPending ? 'Processing...' : 'Check In'}
          </button>
        </div>

        {/* Error Display */}
        {checkinMutation.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{checkinMutation.error.message}</p>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Check-in Successful</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Ticket ID:</strong> {ticketModal.id}</p>
              <p><strong>Check-in Time:</strong> {new Date(ticketModal.checkinAt).toLocaleString()}</p>
              <p><strong>Zone:</strong> {selectedZone?.name}</p>
              <p><strong>Gate:</strong> {gate?.name}</p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1"
              >
                Print Ticket
              </button>
              <button
                onClick={() => setTicketModal(null)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GateScreen
