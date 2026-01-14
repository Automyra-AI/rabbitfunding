import { Menu, Download, User, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/calculations'

const Navbar = ({ onMenuClick }) => {
  const { lastUpdated, refetch, loading } = useData()
  const appName = import.meta.env.VITE_APP_NAME || 'OrgMeter'

  const handleExport = () => {
    // Export functionality would go here
    alert('Export functionality coming soon!')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center ml-2 lg:ml-0">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">{appName}</h1>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                <span>Last updated: {formatDate(lastUpdated)}</span>
              </div>
            )}

            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExport}
              className="btn-secondary hidden sm:flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                <User className="h-5 w-5 text-gray-600" />
                <span className="hidden sm:inline text-sm text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
