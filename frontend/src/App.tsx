import { Routes, Route } from 'react-router-dom'
import GateScreen from './pages/gate/[gateId]'
import CheckpointScreen from './pages/checkpoint'
import AdminDashboard from './pages/admin/index'
import Login from './pages/Login'
import { AuthProvider } from './store/authStore'

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
