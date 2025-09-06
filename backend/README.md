# Parking Reservation System - WeLink Cargo

A comprehensive parking reservation system developed for WeLink Cargo company hiring and training purposes. This project demonstrates full-stack development capabilities with real-time system architecture, comprehensive testing practices, and modern UI/UX design.

## 🏗️ Architecture

### Backend (Node.js + Express + WebSocket)

- **Express.js** REST API with comprehensive business logic
- **WebSocket** for real-time updates
- **In-memory database** with seeded data
- **JWT authentication** for secure access
- **Comprehensive test coverage** with Jest

### Frontend (React + TypeScript + Tailwind CSS)

- **React 19** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive design
- **Real-time WebSocket** integration
- **Role-based authentication** (Admin/Employee)
- **Mobile-first responsive** design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Start the Backend Server

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The backend will be available at `http://localhost:3000`

### 2. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📱 Features

### 🚪 Gate Screen

- **Multi-gate support** with zone management
- **Real-time availability** updates
- **Visitor check-in** with instant ticket generation
- **Subscriber check-in** with subscription validation
- **Dynamic pricing** display with special rates

### 🏢 Checkpoint Screen

- **Ticket lookup** by ID
- **Automatic fee calculation** with time-based rates
- **Rate breakdown** showing normal/special periods
- **Subscriber conversion** option for billing issues
- **Receipt generation** with detailed breakdown

### 👨‍💼 Admin Dashboard

- **System overview** with real-time statistics
- **Zone management** (open/close zones)
- **Category management** (update rates)
- **Subscription monitoring**
- **Rush hour configuration**
- **Vacation period management**

## 🔐 Authentication

### Demo Credentials

**Admin Access:**

- Username: `admin`
- Password: `adminpass`

**Employee Access:**

- Username: `emp1`
- Password: `pass1`

## 🛠️ API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login

### Master Data

- `GET /api/v1/master/gates` - Get all gates
- `GET /api/v1/master/zones` - Get zones (with optional gate filter)
- `GET /api/v1/master/categories` - Get parking categories

### Tickets

- `POST /api/v1/tickets/checkin` - Check in vehicle
- `POST /api/v1/tickets/checkout` - Check out vehicle
- `GET /api/v1/tickets/:id` - Get ticket details

### Subscriptions

- `GET /api/v1/subscriptions/:id` - Get subscription details

### Admin (Requires Admin Role)

- `GET /api/v1/admin/reports/parking-state` - Get parking state report
- `PUT /api/v1/admin/categories/:id` - Update category rates
- `PUT /api/v1/admin/zones/:id/open` - Open/close zone
- `POST /api/v1/admin/rush-hours` - Create rush hour
- `POST /api/v1/admin/vacations` - Create vacation period
- `GET /api/v1/admin/subscriptions` - Get all subscriptions

### WebSocket

- `ws://localhost:3000/api/v1/ws` - Real-time updates

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:gate
npm run test:checkpoint
npm run test:admin

# Run with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📊 Business Logic

### Reserved Slot Calculation

- 15% of active subscribers (outside the facility) are reserved
- Real-time calculation based on subscription status
- Automatic updates on check-in/check-out

### Rate Management

- **Normal rates** during regular hours
- **Special rates** during rush hours and vacation periods
- **Mixed-rate billing** with detailed breakdown

### Zone Management

- **Total slots** per zone
- **Occupied slots** tracking
- **Available slots** for visitors and subscribers
- **Reserved slots** for subscribers

## 🎨 UI/UX Features

### Design System

- **Consistent color palette** with primary, success, warning, and danger colors
- **Responsive grid layouts** for all screen sizes
- **Modern typography** with Inter font family
- **Accessible components** with proper ARIA labels

### User Experience

- **Intuitive navigation** with role-based menus
- **Real-time feedback** for all actions
- **Error handling** with user-friendly messages
- **Loading states** for better perceived performance

### Mobile Responsiveness

- **Mobile-first design** approach
- **Touch-friendly interfaces** for tablets
- **Adaptive layouts** for different screen sizes
- **Collapsible navigation** for mobile devices

## 🔧 Development

### Backend Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Code Quality

- **ESLint** configuration for code quality
- **TypeScript** strict mode for type safety
- **Prettier** for code formatting
- **Comprehensive error handling**

## 📁 Project Structure

```
parking-reservations-system/
├── server.js              # Backend server
├── seed.json              # Initial data
├── tests/                 # Backend tests
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── package.json           # Backend dependencies
└── README.md             # This file
```

## 🌟 Key Highlights

### Backend Excellence

- **Comprehensive business logic** implementation
- **Real-time WebSocket** communication
- **Robust error handling** and validation
- **Complete test coverage** with Jest
- **RESTful API design** with proper HTTP status codes

### Frontend Excellence

- **Modern React** with hooks and TypeScript
- **Beautiful UI** with Tailwind CSS
- **Real-time updates** via WebSocket
- **Responsive design** for all devices
- **Accessibility** considerations

### System Integration

- **Seamless API integration** with proper error handling
- **Real-time synchronization** between frontend and backend
- **Role-based access control** throughout the system
- **Comprehensive data validation** on both ends

## 🚀 Deployment

### Backend Deployment

1. Set environment variables
2. Install dependencies: `npm install`
3. Start server: `npm start`

### Frontend Deployment

1. Build the project: `npm run build`
2. Serve the `dist/` directory
3. Configure API endpoints for production

## 📝 License

This project is developed for WeLink Cargo company as part of their hiring and training program. It demonstrates full-stack development capabilities, real-time system architecture, and modern UI/UX design practices.

## 🤝 Contributing

This is a demonstration project for WeLink Cargo. For questions or feedback, please contact the development team.

---

**Built with ❤️ for WeLink Cargo**
