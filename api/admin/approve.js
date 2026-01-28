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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const decoded = authenticateRequest(req)

    if (!decoded) {
      return res.status(401).json({ error: 'Access token required' })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const client = await clientPromise
    const db = client.db('rabbitfunding')
    const users = db.collection('users')

    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status: 'approved',
          approved_at: new Date()
        }
      }
    )

    res.json({ success: true, message: 'User approved' })
  } catch (error) {
    console.error('Approve error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
