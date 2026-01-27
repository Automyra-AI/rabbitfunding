// Secure password hashing using Web Crypto API (SHA-256)
// This provides client-side hashing - passwords are never stored in plain text

const SALT = 'RabbitFunding_MCA_2024_SecureSalt'

// Convert string to ArrayBuffer
const stringToBuffer = (str) => {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

// Convert ArrayBuffer to hex string
const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Hash password with salt using SHA-256
export const hashPassword = async (password) => {
  const saltedPassword = `${SALT}${password}${SALT}`
  const buffer = stringToBuffer(saltedPassword)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return bufferToHex(hashBuffer)
}

// Verify password against hash
export const verifyPassword = async (password, hash) => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Generate secure session token
export const generateSessionToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return bufferToHex(array.buffer)
}

// Session expiration time (24 hours in milliseconds)
export const SESSION_DURATION = 24 * 60 * 60 * 1000

// Check if session is expired
export const isSessionExpired = (sessionCreatedAt) => {
  if (!sessionCreatedAt) return true
  const now = Date.now()
  const sessionTime = new Date(sessionCreatedAt).getTime()
  return now - sessionTime > SESSION_DURATION
}

// Encrypt data for localStorage (basic obfuscation)
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data)
    return btoa(encodeURIComponent(jsonString))
  } catch (e) {
    return null
  }
}

// Decrypt data from localStorage
export const decryptData = (encryptedData) => {
  try {
    const jsonString = decodeURIComponent(atob(encryptedData))
    return JSON.parse(jsonString)
  } catch (e) {
    return null
  }
}
