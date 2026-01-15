import { formatCurrency } from '../../utils/calculations'
import { DollarSign, Wallet, PiggyBank, TrendingDown } from 'lucide-react'

const BalanceCard = ({ stats }) => {
  const balanceItems = [
    {
      label: 'Principal Collected',
      value: stats.available,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: DollarSign,
      iconColor: 'text-orange-600',
      description: 'Money returned from deals'
    },
    {
      label: 'Deployed Capital',
      value: stats.deployed,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      icon: Wallet,
      iconColor: 'text-orange-700',
      description: 'Outstanding principal'
    },
    {
      label: 'Fees Collected',
      value: stats.reserve,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: PiggyBank,
      iconColor: 'text-amber-600',
      description: 'Total CAFs earned'
    },
    {
      label: 'Total Outstanding',
      value: stats.outstandingPurchases,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: TrendingDown,
      iconColor: 'text-red-600',
      description: 'Principal not yet collected'
    },
  ]

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Capital Balance Overview</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent ml-4"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {balanceItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className={`relative p-5 rounded-xl border-2 ${item.borderColor} ${item.bgColor} hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className={`text-3xl font-bold ${item.color} tracking-tight`}>
                  {formatCurrency(item.value)}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BalanceCard
