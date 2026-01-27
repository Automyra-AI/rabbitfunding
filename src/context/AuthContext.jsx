import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, adminApi } from '../services/authApi'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (authApi.hasToken()) {
        const result = await authApi.verifyToken()
        if (result.success) {
          setUser(result.user)
        }
      }
      setLoading(false)
    }
    verifySession()
  }, [])

  const login = async (email, password) => {
    const result = await authApi.login(email, password)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }

  const requestAccess = async (name, email, password) => {
    return await authApi.requestAccess(name, email, password)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  // Admin functions
  const getPendingRequests = async () => {
    return await adminApi.getPendingRequests()
  }

  const getAllUsers = async () => {
    return await adminApi.getAllUsers()
  }

  const approveUser = async (userId) => {
    return await adminApi.approveUser(userId)
  }

  const rejectUser = async (userId) => {
    return await adminApi.rejectUser(userId)
  }

  const deleteUser = async (userId) => {
    return await adminApi.deleteUser(userId)
  }

  const addUser = async (name, email, password) => {
    return await adminApi.addUser(name, email, password)
  }

  const value = {
    user,
    loading,
    login,
    requestAccess,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    // Admin functions
    getPendingRequests,
    getAllUsers,
    approveUser,
    rejectUser,
    deleteUser,
    addUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
