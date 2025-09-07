import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { useAuth } from '../store/authStore'
import { Search, Car, Clock, DollarSign, AlertCircle } from 'lucide-react'

const CheckpointScreen = () => {
  const [ticketId, setTicketId] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Fetch ticket data
  const { data: ticketData, refetch: fetchTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiClient.getTicket(ticketId),
    enabled: false,
  })

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (data: any) => apiClient.checkoutTicket(data),
    onSuccess: (data) => {
      setCheckoutData(data)
    },
  })

  const handleSearch = async () => {
    if (!ticketId.trim()) return
    
    setLoading(true)
    try {
      await fetchTicket()
      setTicket(ticketData)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (forceConvertToVisitor = false) => {
    if (!ticket) return

    checkoutMutation.mutate({
      ticketId: ticket.id,
      forceConvertToVisitor,
    })
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-gray-600">
            Please log in to access the checkpoint.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Checkpoint - Check Out
              </h1>
              <p className="text-sm text-gray-600">
                Employee: {user.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Search */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Ticket Lookup</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="input flex-1"
              placeholder="Enter ticket ID or scan QR code"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !ticketId.trim()}
              className="btn-primary disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Ticket Details */}
        {ticket && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">Ticket Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                  <p className="text-lg font-mono">{ticket.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="capitalize">{ticket.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-in Time</label>
                  <p>{new Date(ticket.checkinAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Zone</label>
                  <p>{ticket.zone?.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Results */}
        {checkoutData && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">Checkout Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Duration</span>
                </div>
                <span className="font-semibold">
                  {formatDuration(checkoutData.durationHours)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Breakdown:</h3>
                {checkoutData.breakdown?.map((segment: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {segment.rateMode} ({segment.hours}h @ ${segment.rate}/hr)
                    </span>
                    <span>${segment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg border-t">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                  <span className="font-semibold">Total Amount</span>
                </div>
                <span className="text-xl font-bold text-primary-600">
                  ${checkoutData.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {ticket && !checkoutData && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleCheckout(false)}
              disabled={checkoutMutation.isPending}
              className="btn-primary flex-1"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Check Out'}
            </button>
            
            {ticket.type === 'subscriber' && (
              <button
                onClick={() => handleCheckout(true)}
                disabled={checkoutMutation.isPending}
                className="btn-secondary flex-1"
              >
                Convert to Visitor
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {checkoutData && (
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Checkout Successful
                </h3>
                <p className="text-sm text-green-700">
                  The vehicle has been checked out successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {checkoutMutation.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{checkoutMutation.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckpointScreen
