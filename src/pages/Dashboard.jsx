import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import BalanceCard from '../components/dashboard/BalanceCard'
import PerformanceStatsCard from '../components/dashboard/PerformanceStatsCard'
import { BarChart3, Activity, ShieldCheck } from 'lucide-react'

const Dashboard = () => {
  const { stats, deals, payoutEvents, loading, error, refetch, lastUpdated } = useData()

  const verificationInfo = deals.reduce((acc, deal) => {
    if (deal._verified) {
      acc.totalDeals++
      acc.totalDebits += deal._verification?.totalDebits || 0
      if (deal._verification?.sheetMatch) acc.matchCount++
      else acc.mismatchCount++
    }
    return acc
  }, { totalDeals: 0, totalDebits: 0, matchCount: 0, mismatchCount: 0 })

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

      {/* Verification Banner */}
      {verificationInfo.totalDeals > 0 && (
        <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
          verificationInfo.mismatchCount > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ShieldCheck className={`h-4 w-4 ${verificationInfo.mismatchCount > 0 ? 'text-amber-600' : 'text-green-600'}`} />
            <span className="text-xs font-medium text-gray-700">
              All values independently verified from {verificationInfo.totalDebits} transactions across {verificationInfo.totalDeals} deals
            </span>
          </div>
          {verificationInfo.mismatchCount > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {verificationInfo.mismatchCount} sheet mismatch{verificationInfo.mismatchCount > 1 ? 'es' : ''} auto-corrected
            </span>
          )}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <BalanceCard stats={stats} />
        <PerformanceStatsCard stats={stats} />
      </div>
    </div>
  )
}

export default Dashboard
