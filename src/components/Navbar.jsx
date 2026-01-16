import { Rabbit, Download, UserCog, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'

const Navbar = () => {
  const { lastUpdated, refetch, loading } = useData()

  const handleExport = () => {
    // Trigger export functionality - can be customized
    alert('Export functionality - customize as needed')
  }

  return (
    <header className="bg-white border-b-2 border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left side - Brand */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
          <Rabbit className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-orange-600">RabbitFunding</h1>
          <p className="text-xs text-gray-500">MCA Portal</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Live Indicator */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">Live</span>
          </div>
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
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">Export</span>
        </button>

        {/* Admin Button */}
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <UserCog className="h-4 w-4" />
          <span className="text-sm font-medium">Admin</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
