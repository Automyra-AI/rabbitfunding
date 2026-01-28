import clientPromise from '../lib/mongodb.js'
import { authenticateRequest } from '../lib/auth.js'
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const decoded = authenticateRequest(req)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const client = await clientPromise
    const db = client.db('rabbitfunding')
    const users = db.collection('users')

    const user = await users.findOne({ _id: new ObjectId(decoded.id) })

    if (!user || user.status !== 'approved') {
      return res.status(403).json({ error: 'User not found or not approved' })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
