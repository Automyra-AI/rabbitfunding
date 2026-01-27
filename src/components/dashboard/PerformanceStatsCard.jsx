import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Award, CheckCircle, Users, Percent, Calculator } from 'lucide-react'
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/calculations'

const PerformanceStatsCard = ({ stats }) => {
  const [expanded, setExpanded] = useState(true)

  const performanceItems = [
    {
      label: 'Factor Rate',
      value: stats.factorRate?.toFixed(3) || '1.536',
      highlight: true,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Payback / Syndicated Amount'
    },
    {
      label: 'Active Deals',
      value: `${formatNumber(stats.activeDeals)} / ${formatNumber(stats.totalDeals)}`,
      highlight: false,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Currently active / Total deals'
    },
    {
      label: 'Payment per Transaction',
      value: formatCurrency(stats.avgPaymentPerTransaction),
      highlight: false,
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Average payment amount'
    },
    {
      label: 'Paid Back %',
      value: formatPercentage(stats.paidBackPercent),
      highlight: false,
      icon: Percent,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Collection rate (Paid / Payback)'
    },
    {
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      highlight: false,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Total payments needed'
    },
    {
      label: 'Remaining Transactions',
      value: formatNumber(stats.remainingTransactions),
      highlight: false,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Payments still needed'
    },
  ]

  return (
    <div className="card py-4 px-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-bold text-gray-900">Performance Metrics</h2>
          {expanded && <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2">
          {performanceItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className={`p-2.5 rounded-lg border ${item.borderColor} ${item.bgColor} hover:shadow-sm transition-all duration-200 group ${
                  item.highlight ? 'ring-1 ring-orange-300' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-md bg-white shadow-sm`}>
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${item.color} truncate`}>
                      {item.label}
                    </p>
                    <p className={`text-base font-bold ${item.color} tracking-tight`}>
                      {item.value}
                    </p>
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
