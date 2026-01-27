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
    <div className="space-y-3 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-3 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-xs text-gray-600">MCA syndication performance</p>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center space-x-2 px-2 py-1 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              <div className="text-right">
                <p className="text-[10px] text-gray-500">Live</p>
                <p className="text-[10px] font-semibold text-gray-700">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <BalanceCard stats={stats} />
        <PerformanceStatsCard stats={stats} />
      </div>
    </div>
  )
}

export default Dashboard
