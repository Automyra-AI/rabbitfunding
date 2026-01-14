import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Award, CheckCircle, Sparkles, Users, CreditCard, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/calculations'

const PerformanceStatsCard = ({ stats }) => {
  const [expanded, setExpanded] = useState(true)

  const performanceItems = [
    {
      label: 'Syndicated Capital',
      value: formatCurrency(stats.syndicatedAmount),
      highlight: false,
      icon: TrendingUp,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Total principal advanced'
    },
    {
      label: 'Net Syndicated Amount',
      value: formatCurrency(stats.netSyndicatedAmount),
      highlight: true,
      description: 'Syndicated $ minus total CAFs',
      icon: Sparkles,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/30'
    },
    {
      label: 'Active Deals',
      value: `${formatNumber(stats.activeDeals)} / ${formatNumber(stats.totalDeals)}`,
      highlight: false,
      icon: Users,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Currently active / Total deals'
    },
    {
      label: 'Total CAFs Collected',
      value: formatCurrency(stats.totalCAFs),
      highlight: false,
      icon: Award,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Total fees earned'
    },
    {
      label: 'Amount Paid Back',
      value: formatCurrency(stats.paidBack),
      highlight: false,
      icon: CheckCircle,
      color: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      description: 'Principal + fees collected'
    },
    {
      label: 'Average Paid Back %',
      value: formatPercentage(stats.avgPaidBackPercent),
      highlight: false,
      icon: Percent,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Avg collection rate across deals'
    },
    {
      label: 'Total Payments',
      value: formatNumber(stats.totalPayments),
      highlight: false,
      icon: CreditCard,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      description: 'Total payout events processed'
    },
  ]

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
          {expanded && <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {performanceItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${item.borderColor} ${item.bgColor} hover:shadow-sm transition-all duration-200 group ${
                  item.highlight ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-xs font-semibold uppercase tracking-wider ${item.color}`}>
                          {item.label}
                        </p>
                        {item.highlight && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm animate-pulse">
                            ✨ NEW
                          </span>
                        )}
                      </div>
                      <p className={`text-2xl font-bold ${item.color} tracking-tight`}>
                        {item.value}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 font-medium">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PerformanceStatsCard
