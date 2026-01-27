import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

const Admin = () => {
  const { isAdmin, getPendingRequests, getAllUsers, approveUser, rejectUser, deleteUser, addUser } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('pending')
  const [pendingRequests, setPendingRequests] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refreshData = async () => {
    const pending = await getPendingRequests()
    const users = await getAllUsers()
    setPendingRequests(pending)
    setAllUsers(users)
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    refreshData()
  }, [isAdmin, navigate])

  const handleApprove = async (userId) => {
    await approveUser(userId)
    setSuccess('User approved successfully')
    await refreshData()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleReject = async (userId) => {
    await rejectUser(userId)
    setSuccess('User request rejected')
    await refreshData()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId)
      setSuccess('User deleted successfully')
      await refreshData()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setError('')

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newUserPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const result = await addUser(newUserName, newUserEmail, newUserPassword)
    if (result.success) {
      setSuccess('User added successfully')
      setNewUserName('')
      setNewUserEmail('')
      setNewUserPassword('')
      setShowAddUser(false)
      await refreshData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Approved</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Rejected</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-transparent rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600">Manage access requests and users</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-sm font-medium">Add User</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'pending' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>All Users</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'all' ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {allUsers.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        {activeTab === 'pending' ? (
          pendingRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending access requests</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requested</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRequests.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          allUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New User</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUser(false)
                    setError('')
                    setNewUserName('')
                    setNewUserEmail('')
                    setNewUserPassword('')
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
