# Cargo Parking System - Frontend

A modern React-based frontend for the Cargo Parking System, built with TypeScript, React Query, and Zustand for state management.

## 🏗️ Project Structure

```
/src
  /components          # Reusable UI components
    GateHeader.tsx     # Gate screen header with connection status
    ZoneCard.tsx       # Individual zone display card
    TicketModal.tsx    # Printable ticket modal
    CheckoutPanel.tsx  # Complete checkout interface
    AdminReports.tsx   # Admin dashboard with reports
  /routes              # Page components
    /gate/[gateId].tsx # Gate screen for check-in
    /checkpoint.tsx    # Employee checkout screen
    /admin/index.tsx   # Admin dashboard
  /services            # API and WebSocket services
    api.ts            # React Query hooks for API calls
    ws.ts             # WebSocket connection management
  /store              # State management
    authStore.ts      # Authentication state (Zustand)
    uiStore.ts        # UI state management (Zustand)
  /styles             # CSS styles
    print.css         # Print styles for tickets/receipts
```

## 🚀 Features

### Gate Screen (`/gate/:gateId`)

- **Header**: Gate name, connection status, current time
- **Tabs**: Visitor and Subscriber check-in flows
- **Zone Cards**: Real-time availability display with server-provided data
- **Special Rate Indication**: Visual indicators for active special rates
- **WebSocket Integration**: Live updates for zone availability
- **Printable Tickets**: Clean print layout for generated tickets

### Checkpoint Screen (`/checkpoint`)

- **Employee Authentication**: Secure login for checkout operations
- **Ticket Lookup**: QR code simulation with text input
- **Checkout Processing**: Server-computed breakdown and amounts
- **Subscription Verification**: Car plate comparison for subscribers
- **Convert to Visitor**: Force conversion option for mismatched plates
- **Printable Receipts**: Detailed breakdown with print styles

### Admin Dashboard (`/admin`)

- **Authentication**: Admin-only access with role verification
- **Parking State Report**: Real-time zone occupancy monitoring
- **Zone Management**: Open/close zones with immediate effect
- **Category Rate Updates**: Modify normal and special rates
- **Rush Hours & Vacations**: Configure special rate periods
- **Live Audit Log**: Real-time admin action tracking via WebSocket

## 🛠️ Technical Implementation

### State Management

- **Zustand**: Lightweight state management for UI and auth state
- **React Query**: Server state management with caching and synchronization
- **Persistent Storage**: Auth state persisted across sessions

### API Integration

- **Server-Authoritative**: No business logic on client side
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Loading States**: Skeleton loaders and loading indicators
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

### WebSocket Integration

- **Real-time Updates**: Zone availability and admin action broadcasts
- **Connection Management**: Auto-reconnect with exponential backoff
- **Message Handling**: Structured message types with proper error handling

### Accessibility & UX

- **Semantic HTML**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **Responsive Design**: Mobile and tablet optimized
- **Error Boundaries**: Graceful error handling and recovery

### Print Support

- **CSS Print Styles**: Optimized layouts for tickets and receipts
- **Print Preview**: Screen preview before printing
- **QR Code Support**: Ready for QR code integration

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## 📱 Responsive Design

- **Desktop**: Full feature set with optimal layout
- **Tablet**: Touch-optimized with adjusted spacing
- **Mobile**: Simplified interface with essential features

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin vs employee permissions
- **Input Validation**: Client-side validation with server verification
- **XSS Protection**: Sanitized inputs and outputs

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📋 API Requirements

The frontend expects the following API endpoints:

### Authentication

- `POST /api/v1/auth/login` - Employee/admin login

### Master Data

- `GET /api/v1/master/gates` - List all gates
- `GET /api/v1/master/zones?gateId=...` - Zones by gate
- `GET /api/v1/master/categories` - Parking categories

### Tickets

- `POST /api/v1/tickets/checkin` - Create check-in
- `POST /api/v1/tickets/checkout` - Process checkout
- `GET /api/v1/tickets/:id` - Get ticket details

### Subscriptions

- `GET /api/v1/subscriptions/:id` - Verify subscription

### Admin

- `GET /api/v1/admin/reports/parking-state` - Zone status report
- `PUT /api/v1/admin/zones/:id/open` - Toggle zone status
- `PUT /api/v1/admin/categories/:id` - Update category rates
- `POST /api/v1/admin/rush-hours` - Add rush hours
- `POST /api/v1/admin/vacations` - Add vacations

### WebSocket

- `ws://localhost:3000/api/v1/ws` - Real-time updates

## 🎯 Key Principles

1. **Server Authority**: All business logic resides on the server
2. **Real-time Updates**: WebSocket integration for live data
3. **Accessibility First**: WCAG 2.1 AA compliance
4. **Mobile Responsive**: Touch-friendly interface
5. **Error Resilience**: Graceful degradation and recovery
6. **Performance**: Optimized loading and rendering
7. **Maintainability**: Clean, documented, and testable code

## 🚧 Future Enhancements

- [ ] QR code scanning for tickets
- [ ] Offline mode with sync
- [ ] Push notifications
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA)
