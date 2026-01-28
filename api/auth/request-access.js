import clientPromise from '../lib/mongodb.js'
import { hashPassword } from '../lib/auth.js'

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
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const client = await clientPromise
    const db = client.db('rabbitfunding')
    const users = db.collection('users')

    const existingUser = await users.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      if (existingUser.status === 'pending') {
        return res.status(400).json({ error: 'A request with this email is already pending approval' })
      }
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await hashPassword(password)

    await users.insertOne({
      name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: 'user',
      status: 'pending',
      created_at: new Date()
    })

    res.json({ success: true, message: 'Access request submitted. Please wait for admin approval.' })
  } catch (error) {
    console.error('Request access error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
