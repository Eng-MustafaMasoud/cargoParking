# Cargo Parking System - Frontend

A React TypeScript frontend for the Cargo Parking System with real-time WebSocket updates.

## Features

- **Gate Screen** - Check-in for visitors and subscribers
- **Checkpoint Screen** - Check-out with ticket lookup and payment calculation
- **Admin Dashboard** - Zone management, user management, and reporting
- **Real-time Updates** - WebSocket integration for live data
- **Responsive Design** - Works on desktop and tablet

## Tech Stack

- React 18 with TypeScript
- React Router DOM for routing
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS for styling
- Lucide React for icons
- WebSocket for real-time updates

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The app will be available at `http://localhost:5173`

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/v1` and WebSocket at `ws://localhost:3000/ws`.

## Project Structure

```
src/
  components/          # Reusable UI components
  pages/              # Page components
    gate/             # Gate screen pages
    admin/            # Admin dashboard pages
  services/           # API and WebSocket services
  store/              # Zustand stores
  styles/             # Global styles
```
