import { Menu, Download, User, RefreshCw, Activity } from 'lucide-react'
import { useData } from '../context/DataContext'

const Navbar = ({ onMenuClick }) => {
  const { lastUpdated, refetch, loading } = useData()
  const appName = import.meta.env.VITE_APP_NAME || 'OrgMeter'

  const handleExport = () => {
    // Export functionality would go here
    alert('Export functionality coming soon!')
  }

  return (
    <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg hidden sm:block">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {appName}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">MCA Syndication Platform</p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                <Activity className="h-4 w-4 text-green-600 animate-pulse" />
                <div className="text-xs">
                  <p className="text-gray-500">Live</p>
                  <p className="font-semibold text-gray-700">
                    {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={refetch}
              disabled={loading}
              className="p-3 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExport}
              className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-primary transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <div className="relative">
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
