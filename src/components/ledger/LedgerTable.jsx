import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/calculations'

const ITEMS_PER_PAGE = 50

const LedgerTable = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="card p-0">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>History Key ID</th>
              <th>Date</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Principal Applied</th>
              <th>Fee Applied</th>
              <th>Match Method</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="text-sm font-mono">{transaction.history_keyid || '-'}</td>
                <td className="font-medium">{formatDate(transaction.date)}</td>
                <td className="text-sm">{transaction.client}</td>
                <td className="font-medium text-orange-600">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="text-sm">{formatCurrency(transaction.principalApplied)}</td>
                <td className="text-sm">{formatCurrency(transaction.feeApplied)}</td>
                <td className="text-sm text-gray-600">{transaction.description}</td>
                <td className="text-sm text-red-600">{transaction.error || '-'}</td>
              </tr>
            ))}

            {paginatedTransactions.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing rows {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, transactions.length)} of {transactions.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LedgerTable
