import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import BalanceCard from '../components/dashboard/BalanceCard'
import PerformanceStatsCard from '../components/dashboard/PerformanceStatsCard'
import { BarChart3, Activity } from 'lucide-react'

const Dashboard = () => {
  const { stats, loading, error, refetch, lastUpdated } = useData()

  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-sm text-gray-600 mt-1">Monitor your MCA syndication performance in real-time</p>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-orange-600 animate-pulse" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Live Data</p>
                <p className="text-xs font-semibold text-gray-700">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BalanceCard stats={stats} />
        <PerformanceStatsCard stats={stats} />
      </div>
    </div>
  )
}

export default Dashboard
