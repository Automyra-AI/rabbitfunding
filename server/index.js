const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'RabbitFunding_SuperSecret_JWT_Key_2024'
const JWT_EXPIRES_IN = '24h'

// Middleware
app.use(cors())
app.use(express.json())

// JSON file database path
const DB_FILE = path.join(__dirname, 'users.json')

// Initialize database
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], nextId: 1 }))
  }
}

// Read database
const readDB = () => {
  initDB()
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
}

// Write database
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// Create default admin if not exists
const createDefaultAdmin = async () => {
  const db = readDB()
  const adminEmail = 'admin@rabbitfunding.com'
  const existingAdmin = db.users.find(u => u.email === adminEmail)

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    db.users.push({
      id: db.nextId++,
      name: 'Admin',
      email: adminEmail,
      password_hash: hashedPassword,
      role: 'admin',
      status: 'approved',
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    })
    writeDB(db)
    console.log('Default admin account created')
  }
}

// Initialize
initDB()
createDefaultAdmin()

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const db = readDB()
    const user = db.users.find(u => u.email === email.toLowerCase())

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin approval.' })
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account request was rejected. Please contact admin.' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Request Access (Signup)
app.post('/api/auth/request-access', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const db = readDB()
    const existingUser = db.users.find(u => u.email === email.toLowerCase())

    if (existingUser) {
      if (existingUser.status === 'pending') {
        return res.status(400).json({ error: 'A request with this email is already pending approval' })
      }
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    db.users.push({
      id: db.nextId++,
      name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: 'user',
      status: 'pending',
      created_at: new Date().toISOString()
    })
    writeDB(db)

    res.json({ success: true, message: 'Access request submitted. Please wait for admin approval.' })
  } catch (error) {
    console.error('Request access error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === req.user.id)

  if (!user || user.status !== 'approved') {
    return res.status(403).json({ error: 'User not found or not approved' })
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

// ==================== ADMIN ROUTES ====================

// Get pending requests
app.get('/api/admin/pending', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB()
  const users = db.users
    .filter(u => u.status === 'pending')
    .map(({ password_hash, ...user }) => user)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  res.json({ success: true, users })
})

// Get all users (except admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB()
  const users = db.users
    .filter(u => u.role !== 'admin')
    .map(({ password_hash, ...user }) => user)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  res.json({ success: true, users })
})

// Approve user
app.post('/api/admin/approve/:userId', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === parseInt(userId))

  if (userIndex !== -1) {
    db.users[userIndex].status = 'approved'
    db.users[userIndex].approved_at = new Date().toISOString()
    writeDB(db)
  }

  res.json({ success: true, message: 'User approved' })
})

// Reject user
app.post('/api/admin/reject/:userId', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === parseInt(userId))

  if (userIndex !== -1) {
    db.users[userIndex].status = 'rejected'
    db.users[userIndex].rejected_at = new Date().toISOString()
    writeDB(db)
  }

  res.json({ success: true, message: 'User rejected' })
})

// Delete user
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params
  const db = readDB()
  db.users = db.users.filter(u => u.id !== parseInt(userId) || u.role === 'admin')
  writeDB(db)

  res.json({ success: true, message: 'User deleted' })
})

// Add user (direct by admin)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const db = readDB()
    const existingUser = db.users.find(u => u.email === email.toLowerCase())

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    db.users.push({
      id: db.nextId++,
      name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: 'user',
      status: 'approved',
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    })
    writeDB(db)

    res.json({ success: true, message: 'User added' })
  } catch (error) {
    console.error('Add user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Default Admin: admin@rabbitfunding.com / admin123')
})
