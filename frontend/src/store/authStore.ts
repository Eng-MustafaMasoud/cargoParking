import { create } from 'zustand'
import { createContext, useContext } from 'react'

interface User {
  id: string
  username: string
  role: 'admin' | 'employee'
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (credentials) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userData', JSON.stringify(data.user))
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    set({ user: null })
  },
}))

// Initialize auth state from localStorage
const token = localStorage.getItem('authToken')
const userData = localStorage.getItem('userData')
if (token && userData) {
  useAuthStore.setState({ user: JSON.parse(userData), loading: false })
} else {
  useAuthStore.setState({ loading: false })
}

const AuthContext = createContext<AuthState | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthStore()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
