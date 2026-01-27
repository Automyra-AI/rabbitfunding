import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Default admin credentials - change these!
const DEFAULT_ADMIN = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@rabbitfunding.com',
  password: 'admin123',
  role: 'admin',
  status: 'approved',
  createdAt: new Date().toISOString()
}

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

  useEffect(() => {
    // Initialize admin account if not exists
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    const adminExists = storedUsers.some(u => u.role === 'admin')
    if (!adminExists) {
      storedUsers.push(DEFAULT_ADMIN)
      localStorage.setItem('rabbitfunding_users', JSON.stringify(storedUsers))
    }

    // Check if user is already logged in
    const storedUser = localStorage.getItem('rabbitfunding_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Verify user still exists and is approved
        const currentUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
        const validUser = currentUsers.find(u => u.id === parsedUser.id && u.status === 'approved')
        if (validUser) {
          setUser(parsedUser)
        } else {
          localStorage.removeItem('rabbitfunding_user')
        }
      } catch (e) {
        localStorage.removeItem('rabbitfunding_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')

    const foundUser = storedUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (foundUser.status === 'pending') {
      return { success: false, error: 'Your account is pending approval. Please wait for admin approval.' }
    }

    if (foundUser.status === 'rejected') {
      return { success: false, error: 'Your account request was rejected. Please contact admin.' }
    }

    const userData = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role || 'user',
      createdAt: foundUser.createdAt
    }
    setUser(userData)
    localStorage.setItem('rabbitfunding_user', JSON.stringify(userData))
    return { success: true }
  }

  const requestAccess = async (name, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')

    const existingUser = storedUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      if (existingUser.status === 'pending') {
        return { success: false, error: 'A request with this email is already pending approval' }
      }
      return { success: false, error: 'Email already registered' }
    }

    // Create new user with pending status
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    storedUsers.push(newUser)
    localStorage.setItem('rabbitfunding_users', JSON.stringify(storedUsers))

    return { success: true, message: 'Access request submitted. Please wait for admin approval.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rabbitfunding_user')
  }

  // Admin functions
  const getPendingRequests = () => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    return storedUsers.filter(u => u.status === 'pending')
  }

  const getAllUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    return storedUsers.filter(u => u.role !== 'admin')
  }

  const approveUser = (userId) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    const updatedUsers = storedUsers.map(u =>
      u.id === userId ? { ...u, status: 'approved', approvedAt: new Date().toISOString() } : u
    )
    localStorage.setItem('rabbitfunding_users', JSON.stringify(updatedUsers))
    return { success: true }
  }

  const rejectUser = (userId) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    const updatedUsers = storedUsers.map(u =>
      u.id === userId ? { ...u, status: 'rejected', rejectedAt: new Date().toISOString() } : u
    )
    localStorage.setItem('rabbitfunding_users', JSON.stringify(updatedUsers))
    return { success: true }
  }

  const deleteUser = (userId) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')
    const updatedUsers = storedUsers.filter(u => u.id !== userId)
    localStorage.setItem('rabbitfunding_users', JSON.stringify(updatedUsers))
    return { success: true }
  }

  const addUser = (name, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('rabbitfunding_users') || '[]')

    const existingUser = storedUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'user',
      status: 'approved',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    }

    storedUsers.push(newUser)
    localStorage.setItem('rabbitfunding_users', JSON.stringify(storedUsers))
    return { success: true }
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
