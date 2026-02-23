import { useState } from 'react'
import { CheckCircle, AlertCircle, Clock, BadgeCheck } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/calculations'

const ITEMS_PER_PAGE = 50

const LedgerTable = ({ transactions, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Get row styling based on payment status (Pending/Settled)
  const getRowClass = (transaction) => {
    if (transaction.isPending) {
      return 'bg-amber-50/50 border-l-4 border-l-amber-400'
    }
    if (transaction.isSettled) {
      return 'bg-green-50/50 border-l-4 border-l-green-400'
    }
    // Default - no transaction type specified
    return 'border-l-4 border-l-gray-200'
  }

  // Get status badge
  const getStatusBadge = (transaction) => {
    if (transaction.isPending) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3 mr-0.5 flex-shrink-0" />
          <span className="hidden sm:inline">Pending</span>
        </span>
      )
    }
    if (transaction.isSettled) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <BadgeCheck className="h-3 w-3 mr-0.5 flex-shrink-0" />
          <span className="hidden sm:inline">Settled</span>
        </span>
      )
    }
    return <span className="text-xs text-gray-400">-</span>
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-0 table-auto">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden lg:table-cell">Key ID</th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Date</th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Client</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Status</th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Amount</th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">Principal</th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">Fee</th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden xl:table-cell">Match</th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden lg:table-cell">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTransactions.map((transaction) => {
              const hasError = transaction.error && transaction.error.trim() !== ''
              return (
                <tr
                  key={transaction.id}
                  onClick={() => onRowClick?.(transaction)}
                  className={`hover:bg-orange-50/50 transition-colors cursor-pointer ${getRowClass(transaction)}`}
                >
                  <td className="px-2 py-2 hidden lg:table-cell">
                    <div className="flex items-center space-x-1">
                      {hasError ? (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-xs font-mono text-gray-500 truncate max-w-[80px]">{transaction.history_keyid || '-'}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">{formatDate(transaction.date)}</td>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900">
                    <span className="block truncate max-w-[120px] sm:max-w-[180px]">{transaction.client}</span>
                  </td>
                  <td className="px-2 py-2 text-center">{getStatusBadge(transaction)}</td>
                  <td className="px-2 py-2 text-xs text-right font-medium text-orange-600 whitespace-nowrap">{formatCurrency(transaction.amount)}</td>
                  <td className="px-2 py-2 text-xs text-right text-gray-900 whitespace-nowrap hidden md:table-cell">{formatCurrency(transaction.principalApplied)}</td>
                  <td className="px-2 py-2 text-xs text-right text-gray-600 whitespace-nowrap hidden md:table-cell">{formatCurrency(transaction.feeApplied)}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 hidden xl:table-cell">
                    <span className="block truncate max-w-[100px]">{transaction.description}</span>
                  </td>
                  <td className="px-2 py-2 text-xs text-red-600 hidden lg:table-cell">
                    <span className="block truncate max-w-[100px]">{transaction.error || '-'}</span>
                  </td>
                </tr>
              )
            })}

            {paginatedTransactions.length === 0 && (
              <tr>
                <td colSpan="9" className="px-3 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > ITEMS_PER_PAGE && (
        <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-gray-600">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, transactions.length)} of {transactions.length}
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded"></span>
                  <span className="text-gray-500">Pending</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded"></span>
                  <span className="text-gray-500">Settled</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs text-gray-600">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LedgerTable
