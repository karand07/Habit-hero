import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser as apiLogin, registerUser as apiRegister, getUserProfile as apiGetMe } from '../services/api'

const AuthContext = createContext(null)

// Mock user data for development
const MOCK_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setTokenState] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const checkUserAuth = async () => {
      if (token) {
        try {
          // No need to pass token to apiGetMe, interceptor handles it
          const userData = await apiGetMe()
          setUser(userData)
        } catch (error) {
          console.error('Auth check failed, removing token:', error)
          localStorage.removeItem('token')
          setTokenState(null)
          setUser(null)
        }
      } else {
        setUser(null) // Ensure user is null if no token
      }
      setLoading(false)
    }
    checkUserAuth()
  }, [token]) // Re-run if token changes (e.g. on login/logout)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await apiLogin({ email, password })
      if (response.token) {
        localStorage.setItem('token', response.token)
        setTokenState(response.token) // This will trigger useEffect to fetch user
        // The user state will be set by the useEffect hook after getMe succeeds
        return { success: true }
      } else {
        // Should not happen if API is consistent, but good to check
        return { success: false, error: response.message || 'Login failed: No token received' }
      }
    } catch (error) {
      console.error('Login failed:', error)
      // error object here is what api.js threw (error.response.data or error itself)
      return { success: false, error: error.message || 'Invalid credentials or server error' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      // Assuming the register API returns a token and user or just a success message + token
      // For now, let's assume it returns a token like login
      const response = await apiRegister({ name, email, password })
      if (response.token) {
        localStorage.setItem('token', response.token)
        setTokenState(response.token) // This will trigger useEffect to fetch user
        return { success: true }
      } else {
        // If register doesn't return a token directly but requires login after, adjust flow
        return { success: false, error: response.message || 'Registration failed: No token received' }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message || 'Registration failed or server error' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setTokenState(null)
    setUser(null)
    // Optionally: redirect to login page or home page
    // window.location.href = '/login'; 
  }

  const value = {
    user,
    setUser,
    isAuthenticated: !!user, // Derived state for convenience
    token, // Expose token if needed by any component directly, though mostly handled by api.js
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext 