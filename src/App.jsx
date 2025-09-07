import { Routes, Route } from 'react-router-dom'
import GateScreen from './pages/GateScreen'
import CheckpointScreen from './pages/CheckpointScreen'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/gate/:gateId" element={<GateScreen />} />
          <Route path="/checkpoint" element={<CheckpointScreen />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
