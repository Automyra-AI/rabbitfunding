import clientPromise from '../lib/mongodb.js'
import { authenticateRequest, hashPassword } from '../lib/auth.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const decoded = authenticateRequest(req)

  if (!decoded) {
    return res.status(401).json({ error: 'Access token required' })
  }

  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const client = await clientPromise
  const db = client.db('rabbitfunding')
  const users = db.collection('users')

  try {
    // GET - Get all users
    if (req.method === 'GET') {
      const allUsers = await users
        .find({ role: { $ne: 'admin' } })
        .project({ password_hash: 0 })
        .sort({ created_at: -1 })
        .toArray()

      return res.json({ success: true, users: allUsers })
    }

    // POST - Add new user
    if (req.method === 'POST') {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      const existingUser = await users.findOne({ email: email.toLowerCase() })

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' })
      }

      const hashedPassword = await hashPassword(password)

      await users.insertOne({
        name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        role: 'user',
        status: 'approved',
        created_at: new Date(),
        approved_at: new Date()
      })

      return res.json({ success: true, message: 'User added' })
    }

    // DELETE - Delete user
    if (req.method === 'DELETE') {
      const { userId } = req.query

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' })
      }

      await users.deleteOne({
        _id: new ObjectId(userId),
        role: { $ne: 'admin' }
      })

      return res.json({ success: true, message: 'User deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Users error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
