import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getStatusBadgeClass,
  getProgressBarClass,
  calculatePaybackPercentage
} from '../../utils/calculations'

const ITEMS_PER_PAGE = 25

const AdvancesTable = ({ deals, payoutEvents, visibleColumns }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date_funded', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)

  const DEFAULT_FACTOR_RATE = 1.536

  const enhancedDeals = useMemo(() => {
    return deals.map(deal => {
      const syndicatedAmount = deal.purchase_price || deal.principal_advanced || 0
      const totalPayback = deal.receivables_purchased_amount || (syndicatedAmount * DEFAULT_FACTOR_RATE)
      const amountPaid = deal.principal_collected || 0
      const paymentPerTransaction = deal.last_payment_amount || 300
      const syndicatedAmountOrigination = deal.syndicated_amount_origination || 0
      // Origination Fee = Purchase Price - Syndicated Amount Origination
      const originationFee = syndicatedAmountOrigination > 0 ? syndicatedAmount - syndicatedAmountOrigination : 0
      const factorRate = deal.factor_rate || (syndicatedAmount > 0 ? totalPayback / syndicatedAmount : DEFAULT_FACTOR_RATE)
      const interest = totalPayback - syndicatedAmount
      const remainingBalance = Math.max(0, totalPayback - amountPaid)
      const totalTransactions = paymentPerTransaction > 0 ? Math.ceil(totalPayback / paymentPerTransaction) : 0
      const remainingTransactions = (paymentPerTransaction > 0 && remainingBalance > 0) ? Math.ceil(remainingBalance / paymentPerTransaction) : 0
      const paidBackPercent = totalPayback > 0 ? (amountPaid / totalPayback) * 100 : 0

      const dealPayments = payoutEvents.filter(
        event => event.client_name?.toLowerCase() === deal.qbo_customer_name?.toLowerCase() ||
                 event.client_name?.toLowerCase() === deal.client_name?.toLowerCase()
      )
      const paymentCount = dealPayments.length

      return {
        ...deal,
        syndicatedAmount,
        syndicatedAmountOrigination,
        originationFee,
        totalPayback,
        amountPaid,
        remainingBalance,
        interest,
        factorRate,
        totalTransactions,
        remainingTransactions,
        paymentPerTransaction,
        paidBackPercent,
        paymentCount
      }
    })
  }, [deals, payoutEvents])

  const sortedDeals = useMemo(() => {
    const sorted = [...enhancedDeals]
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
          aValue = parseFloat(aValue)
          bValue = parseFloat(bValue)
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sorted
  }, [enhancedDeals, sortConfig])

  const totalPages = Math.ceil(sortedDeals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDeals = sortedDeals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const totals = useMemo(() => {
    const sums = sortedDeals.reduce((acc, deal) => ({
      syndicatedAmount: acc.syndicatedAmount + (deal.syndicatedAmount || 0),
      syndicatedAmountOrigination: acc.syndicatedAmountOrigination + (deal.syndicatedAmountOrigination || 0),
      originationFee: acc.originationFee + (deal.originationFee || 0),
      totalPayback: acc.totalPayback + (deal.totalPayback || 0),
      amountPaid: acc.amountPaid + (deal.amountPaid || 0),
      remainingBalance: acc.remainingBalance + (deal.remainingBalance || 0),
      interest: acc.interest + (deal.interest || 0),
      totalTransactions: acc.totalTransactions + (deal.totalTransactions || 0),
      remainingTransactions: acc.remainingTransactions + (deal.remainingTransactions || 0)
    }), { syndicatedAmount: 0, syndicatedAmountOrigination: 0, originationFee: 0, totalPayback: 0, amountPaid: 0, remainingBalance: 0, interest: 0, totalTransactions: 0, remainingTransactions: 0 })
    sums.avgFactorRate = sums.syndicatedAmount > 0 ? sums.totalPayback / sums.syndicatedAmount : DEFAULT_FACTOR_RATE
    return sums
  }, [sortedDeals])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {visibleColumns.state && (
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Status</th>
              )}
              {visibleColumns.advanceId && (
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('qbo_customer_name')}>Client</th>
              )}
              {visibleColumns.type && (
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('type')}>Type</th>
              )}
              {visibleColumns.syndicated && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('syndicatedAmount')}>Syndicated</th>
              )}
              {visibleColumns.syndicatedOrigination && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('originationFee')}>Origination Fee</th>
              )}
              {visibleColumns.factorRate && (
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('factorRate')}>Factor</th>
              )}
              {visibleColumns.payback && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalPayback')}>Payback</th>
              )}
              {visibleColumns.payments && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amountPaid')}>Paid</th>
              )}
              {visibleColumns.paymentPerTransaction && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('paymentPerTransaction')}>Per Trans</th>
              )}
              {visibleColumns.paidBackPercent && (
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('paidBackPercent')}>Progress</th>
              )}
              {visibleColumns.totalTransactions && (
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalTransactions')}>Total #</th>
              )}
              {visibleColumns.remainingTransactions && (
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('remainingTransactions')}>Rem #</th>
              )}
              {visibleColumns.outstanding && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('remainingBalance')}>Balance</th>
              )}
              {visibleColumns.dateFunded && (
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date_funded')}>Date</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDeals.map((deal, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {visibleColumns.state && (
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      deal.status?.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-800'
                        : deal.status?.toLowerCase() === 'paid off'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {deal.status || 'Active'}
                    </span>
                  </td>
                )}
                {visibleColumns.advanceId && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">{deal.qbo_customer_name}</td>
                )}
                {visibleColumns.type && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">{deal.type || 'New'}</td>
                )}
                {visibleColumns.syndicated && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(deal.syndicatedAmount)}</td>
                )}
                {visibleColumns.syndicatedOrigination && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-right text-purple-600">{formatCurrency(deal.originationFee)}</td>
                )}
                {visibleColumns.factorRate && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-center text-gray-600">{deal.factorRate.toFixed(3)}</td>
                )}
                {visibleColumns.payback && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(deal.totalPayback)}</td>
                )}
                {visibleColumns.payments && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-right text-blue-600 font-medium">{formatCurrency(deal.amountPaid)}</td>
                )}
                {visibleColumns.paymentPerTransaction && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-right text-gray-600">{formatCurrency(deal.paymentPerTransaction)}</td>
                )}
                {visibleColumns.paidBackPercent && (
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            deal.paidBackPercent >= 100
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : deal.paidBackPercent >= 50
                              ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                              : 'bg-gradient-to-r from-amber-400 to-amber-600'
                          }`}
                          style={{ width: `${Math.min(deal.paidBackPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">{deal.paidBackPercent.toFixed(1)}%</span>
                    </div>
                  </td>
                )}
                {visibleColumns.totalTransactions && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-center text-gray-600">{deal.totalTransactions}</td>
                )}
                {visibleColumns.remainingTransactions && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-center text-orange-600 font-medium">{deal.remainingTransactions}</td>
                )}
                {visibleColumns.outstanding && (
                  <td className={`px-3 py-2.5 whitespace-nowrap text-sm text-right font-medium ${
                    deal.remainingBalance <= 0 ? 'text-green-600' : deal.remainingBalance < deal.totalPayback * 0.2 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(deal.remainingBalance)}
                  </td>
                )}
                {visibleColumns.dateFunded && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">{formatDate(deal.date_funded)}</td>
                )}
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="bg-orange-50 font-semibold border-t-2 border-orange-300">
              {visibleColumns.state && <td className="px-3 py-3 text-sm text-gray-900 font-bold">TOTAL</td>}
              {visibleColumns.advanceId && <td className="px-3 py-3 text-sm text-gray-500">{sortedDeals.length} deals</td>}
              {visibleColumns.type && <td className="px-3 py-3"></td>}
              {visibleColumns.syndicated && (
                <td className="px-3 py-3 text-sm text-right text-gray-900 font-bold">{formatCurrency(totals.syndicatedAmount)}</td>
              )}
              {visibleColumns.syndicatedOrigination && (
                <td className="px-3 py-3 text-sm text-right text-purple-600 font-bold">{formatCurrency(totals.originationFee)}</td>
              )}
              {visibleColumns.factorRate && <td className="px-3 py-3 text-sm text-center font-bold">{totals.avgFactorRate.toFixed(3)}</td>}
              {visibleColumns.payback && (
                <td className="px-3 py-3 text-sm text-right text-gray-900 font-bold">{formatCurrency(totals.totalPayback)}</td>
              )}
              {visibleColumns.payments && (
                <td className="px-3 py-3 text-sm text-right text-blue-600 font-bold">{formatCurrency(totals.amountPaid)}</td>
              )}
              {visibleColumns.paymentPerTransaction && <td className="px-3 py-3"></td>}
              {visibleColumns.paidBackPercent && (
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-bold text-orange-600">
                    {totals.totalPayback > 0 ? ((totals.amountPaid / totals.totalPayback) * 100).toFixed(1) : 0}%
                  </span>
                </td>
              )}
              {visibleColumns.totalTransactions && (
                <td className="px-3 py-3 text-sm text-center text-gray-900 font-bold">{totals.totalTransactions}</td>
              )}
              {visibleColumns.remainingTransactions && (
                <td className="px-3 py-3 text-sm text-center text-orange-600 font-bold">{totals.remainingTransactions}</td>
              )}
              {visibleColumns.outstanding && (
                <td className="px-3 py-3 text-sm text-right text-red-600 font-bold">{formatCurrency(totals.remainingBalance)}</td>
              )}
              {visibleColumns.dateFunded && <td className="px-3 py-3"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedDeals.length)} of {sortedDeals.length} deals
        </span>
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
    </div>
  )
}

export default AdvancesTable
