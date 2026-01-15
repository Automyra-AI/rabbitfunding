import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
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
              <th>Date</th>
              <th>Type</th>
              <th>Client</th>
              <th>Principal</th>
              <th>Fee</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="font-medium">{formatDate(transaction.date)}</td>
                <td>
                  <div className="flex items-center space-x-2">
                    {transaction.type === 'Credit' ? (
                      <ArrowDownCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        transaction.type === 'Credit'
                          ? 'text-orange-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="text-sm">{transaction.client}</td>
                <td className="text-sm">{formatCurrency(transaction.principalApplied)}</td>
                <td className="text-sm">{formatCurrency(transaction.feeApplied)}</td>
                <td
                  className={`font-medium ${
                    transaction.type === 'Credit' ? 'text-orange-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'Credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="font-semibold">{formatCurrency(transaction.balance)}</td>
                <td className="text-sm text-gray-600">{transaction.description}</td>
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
