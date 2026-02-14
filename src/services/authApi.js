// Use relative URL for Vercel (same domain), or localhost for development
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Token management
const getToken = () => localStorage.getItem('rf_auth_token')
const setToken = (token) => localStorage.setItem('rf_auth_token', token)
const removeToken = () => localStorage.removeItem('rf_auth_token')

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)

    // Handle empty or non-JSON responses
    const text = await response.text()
    let data = {}
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned invalid response')
      }
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Make sure backend is running.')
    }
    throw error
  }
}

// Auth API functions
export const authApi = {
  // Login
  login: async (email, password) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (data.token) {
        setToken(data.token)
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Request access (signup)
  requestAccess: async (name, email, password) => {
    try {
      const data = await apiRequest('/auth/request-access', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const data = await apiRequest('/auth/verify')
      return { success: true, user: data.user }
    } catch (error) {
      removeToken()
      return { success: false, error: error.message }
    }
  },

  // Logout
  logout: () => {
    removeToken()
  },

  // Check if token exists
  hasToken: () => !!getToken()
}

// Admin API functions
export const adminApi = {
  // Get pending requests
  getPendingRequests: async () => {
    try {
      const data = await apiRequest('/admin/pending')
      return data.users || []
    } catch (error) {
      console.error('Get pending requests error:', error)
      return []
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const data = await apiRequest('/admin/users')
      return data.users || []
    } catch (error) {
      console.error('Get all users error:', error)
      return []
    }
  },

  // Approve user
  approveUser: async (userId) => {
    try {
      await apiRequest(`/admin/approve?userId=${userId}`, { method: 'POST' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Reject user
  rejectUser: async (userId) => {
    try {
      await apiRequest(`/admin/reject?userId=${userId}`, { method: 'POST' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      await apiRequest(`/admin/users?userId=${userId}`, { method: 'DELETE' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Add user
  addUser: async (name, email, password) => {
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
