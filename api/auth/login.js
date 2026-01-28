import clientPromise from '../lib/mongodb.js'
import { comparePassword, generateToken, hashPassword } from '../lib/auth.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const client = await clientPromise
    const db = client.db('rabbitfunding')
    const users = db.collection('users')

    // Create default admin if no users exist
    const userCount = await users.countDocuments()
    if (userCount === 0) {
      const hashedPassword = await hashPassword('admin123')
      await users.insertOne({
        name: 'Admin',
        email: 'admin@rabbitfunding.com',
        password_hash: hashedPassword,
        role: 'admin',
        status: 'approved',
        created_at: new Date(),
        approved_at: new Date()
      })
    }

    const user = await users.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin approval.' })
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account request was rejected. Please contact admin.' })
    }

    const token = generateToken(user)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
