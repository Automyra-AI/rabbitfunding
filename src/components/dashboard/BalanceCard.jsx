import { formatCurrency } from '../../utils/calculations'
import { DollarSign, Wallet, PiggyBank, TrendingDown } from 'lucide-react'

const BalanceCard = ({ stats }) => {
  const balanceItems = [
    {
      label: `Syndicated Amount (${stats.totalDeals || 0} Deals)`,
      value: stats.syndicatedAmount,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: DollarSign,
      iconColor: 'text-orange-600',
      description: 'Total capital funded'
    },
    {
      label: 'Total Payback',
      value: stats.totalPayback,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      icon: Wallet,
      iconColor: 'text-orange-700',
      description: 'Syndicated × Factor Rate'
    },
    {
      label: 'Amount Paid',
      value: stats.amountPaid,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: PiggyBank,
      iconColor: 'text-green-600',
      description: 'Money collected from customer'
    },
    {
      label: 'Remaining Balance',
      value: stats.remainingBalance,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: TrendingDown,
      iconColor: 'text-red-600',
      description: 'Still to collect'
    },
  ]

  return (
    <div className="card py-4 px-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Capital Balance</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent ml-3"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {balanceItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className={`relative p-3 rounded-lg border ${item.borderColor} ${item.bgColor} hover:shadow-sm transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-md bg-white shadow-sm`}>
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider truncate">
                    {item.label}
                  </p>
                  <p className={`text-xl font-bold ${item.color} tracking-tight`}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BalanceCard
