import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/calculations'

const ITEMS_PER_PAGE = 50

const LedgerTable = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Get row styling based on transaction status
  const getRowClass = (transaction) => {
    const hasError = transaction.error && transaction.error.trim() !== ''
    if (hasError) {
      return 'bg-red-50/30 border-l-4 border-l-red-400'
    }
    // No error = good transaction
    return 'bg-green-50/30 border-l-4 border-l-green-400'
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Key ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Client</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Amount</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Principal</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Fee</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Match Method</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTransactions.map((transaction) => {
              const hasError = transaction.error && transaction.error.trim() !== ''
              return (
                <tr key={transaction.id} className={`hover:bg-gray-50 transition-colors ${getRowClass(transaction)}`}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      {hasError ? (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      )}
                      <span className="text-sm font-mono text-gray-500">{transaction.history_keyid || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(transaction.date)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.client}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-orange-600">{formatCurrency(transaction.amount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(transaction.principalApplied)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-600">{formatCurrency(transaction.feeApplied)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{transaction.description}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600">{transaction.error || '-'}</td>
                </tr>
              )
            })}

            {paginatedTransactions.length === 0 && (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > ITEMS_PER_PAGE && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, transactions.length)} of {transactions.length} transactions
            </span>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-green-400 rounded"></span>
                <span className="text-gray-500">No Error</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-red-400 rounded"></span>
                <span className="text-gray-500">Has Error</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LedgerTable
