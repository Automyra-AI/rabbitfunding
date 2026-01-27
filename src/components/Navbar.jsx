import { useState } from 'react'
import { Rabbit, Download, RefreshCw, LogOut, User, ChevronDown } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { lastUpdated, refetch, loading } = useData()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleExport = () => {
    alert('Export functionality - customize as needed')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b-2 border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left side - Brand */}
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
          <Rabbit className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-orange-600">RabbitFunding</h1>
          <p className="text-[10px] text-gray-500">MCA Portal</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Live Indicator */}
        <div className="flex items-center space-x-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">Live</span>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refetch}
          disabled={loading}
          className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          <span className="text-xs font-medium">Export</span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <User className="h-4 w-4" />
            <span className="text-xs font-medium max-w-[100px] truncate">{user?.name || 'User'}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
