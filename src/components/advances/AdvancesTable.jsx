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

const ITEMS_PER_PAGE = 20

const AdvancesTable = ({ deals, payoutEvents, visibleColumns }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date_funded', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)

  // Enhance deals with calculated fields
  const enhancedDeals = useMemo(() => {
    return deals.map(deal => {
      // Data is already parsed as numbers from googleSheets.js
      const principalAdvanced = deal.principal_advanced || 0
      const feeCollected = deal.fee_collected || 0
      const principalCollected = deal.principal_collected || 0

      // Add 10% interest to payback calculation
      const interest = principalAdvanced * 0.10
      const tcp = principalAdvanced + feeCollected + interest
      const paybackAmount = principalAdvanced + interest // Payback = Principal + 10% interest

      const paidBack = principalCollected + feeCollected
      const outstanding = principalAdvanced - principalCollected
      const paidBackPercent = calculatePaybackPercentage(paidBack, tcp)

      // Count payments for this deal - match by client name
      const dealPayments = payoutEvents.filter(
        event => event.client_name?.toLowerCase() === deal.qbo_customer_name?.toLowerCase() ||
                 event.client_name?.toLowerCase() === deal.client_name?.toLowerCase()
      )
      const paymentCount = dealPayments.length

      // Calculate Factor Rate = TCP / Principal (e.g., 1.10 for 10% interest)
      const factorRate = principalAdvanced > 0 ? (tcp / principalAdvanced).toFixed(2) : '0.00'

      return {
        ...deal,
        tcp,
        paybackAmount,
        paidBack,
        outstanding,
        paidBackPercent,
        paymentCount,
        factorRate
      }
    })
  }, [deals, payoutEvents])

  // Sorting
  const sortedDeals = useMemo(() => {
    const sorted = [...enhancedDeals]

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle numeric values
        if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
          aValue = parseFloat(aValue)
          bValue = parseFloat(bValue)
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return sorted
  }, [enhancedDeals, sortConfig])

  // Pagination
  const totalPages = Math.ceil(sortedDeals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDeals = sortedDeals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Calculate totals - data is already parsed as numbers
  const totals = useMemo(() => {
    return sortedDeals.reduce((acc, deal) => ({
      syndicated: acc.syndicated + (deal.principal_advanced || 0),
      cafs: acc.cafs + (deal.fee_collected || 0),
      tcp: acc.tcp + (deal.tcp || 0),
      paybackAmount: acc.paybackAmount + (deal.paybackAmount || 0),
      paidBack: acc.paidBack + (deal.paidBack || 0),
      outstanding: acc.outstanding + (deal.outstanding || 0)
    }), { syndicated: 0, cafs: 0, tcp: 0, paybackAmount: 0, paidBack: 0, outstanding: 0 })
  }, [sortedDeals])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="h-4 w-4 ml-1" /> :
      <ArrowDown className="h-4 w-4 ml-1" />
  }

  return (
    <div className="card p-0">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.state && (
                <th className="sortable" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    State
                    <SortIcon columnKey="status" />
                  </div>
                </th>
              )}
              {visibleColumns.advanceId && (
                <th className="sortable" onClick={() => handleSort('qbo_customer_name')}>
                  <div className="flex items-center">
                    Advance ID
                    <SortIcon columnKey="qbo_customer_name" />
                  </div>
                </th>
              )}
              {visibleColumns.type && (
                <th className="sortable" onClick={() => handleSort('type')}>
                  <div className="flex items-center">
                    Type
                    <SortIcon columnKey="type" />
                  </div>
                </th>
              )}
              {visibleColumns.syndicated && (
                <th className="sortable" onClick={() => handleSort('principal_advanced')}>
                  <div className="flex items-center">
                    Syndicated
                    <SortIcon columnKey="principal_advanced" />
                  </div>
                </th>
              )}
              {visibleColumns.cafs && (
                <th className="sortable" onClick={() => handleSort('fee_collected')}>
                  <div className="flex items-center">
                    CAFs
                    <SortIcon columnKey="fee_collected" />
                  </div>
                </th>
              )}
              {visibleColumns.tcp && (
                <th className="sortable" onClick={() => handleSort('tcp')}>
                  <div className="flex items-center">
                    TCP
                    <SortIcon columnKey="tcp" />
                  </div>
                </th>
              )}
              {visibleColumns.factorRate && (
                <th className="sortable" onClick={() => handleSort('factor_rate')}>
                  <div className="flex items-center">
                    Factor Rate
                    <SortIcon columnKey="factor_rate" />
                  </div>
                </th>
              )}
              {visibleColumns.payback && (
                <th className="sortable" onClick={() => handleSort('tcp')}>
                  <div className="flex items-center">
                    Payback
                    <SortIcon columnKey="tcp" />
                  </div>
                </th>
              )}
              {visibleColumns.payments && (
                <th className="sortable" onClick={() => handleSort('paidBack')}>
                  <div className="flex items-center">
                    Payments
                    <SortIcon columnKey="paidBack" />
                  </div>
                </th>
              )}
              {visibleColumns.paidBackPercent && (
                <th className="sortable" onClick={() => handleSort('paidBackPercent')}>
                  <div className="flex items-center">
                    Paid Back %
                    <SortIcon columnKey="paidBackPercent" />
                  </div>
                </th>
              )}
              {visibleColumns.outstanding && (
                <th className="sortable" onClick={() => handleSort('outstanding')}>
                  <div className="flex items-center">
                    Outstanding
                    <SortIcon columnKey="outstanding" />
                  </div>
                </th>
              )}
              {visibleColumns.dateFunded && (
                <th className="sortable" onClick={() => handleSort('date_funded')}>
                  <div className="flex items-center">
                    Date Funded
                    <SortIcon columnKey="date_funded" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedDeals.map((deal, index) => (
              <tr key={index}>
                {visibleColumns.state && (
                  <td>
                    <span className={`badge ${getStatusBadgeClass(deal.status)}`}>
                      {deal.status || 'Active'}
                    </span>
                  </td>
                )}
                {visibleColumns.advanceId && (
                  <td className="font-medium">{deal.qbo_customer_name}</td>
                )}
                {visibleColumns.type && (
                  <td>{deal.type || 'New'}</td>
                )}
                {visibleColumns.syndicated && (
                  <td className="font-medium">{formatCurrency(deal.principal_advanced)}</td>
                )}
                {visibleColumns.cafs && (
                  <td>{formatCurrency(deal.fee_collected)}</td>
                )}
                {visibleColumns.tcp && (
                  <td>{formatCurrency(deal.tcp)}</td>
                )}
                {visibleColumns.factorRate && (
                  <td>{deal.factorRate}</td>
                )}
                {visibleColumns.payback && (
                  <td>{formatCurrency(deal.paybackAmount)}</td>
                )}
                {visibleColumns.payments && (
                  <td>
                    {formatCurrency(deal.paidBack)}
                  </td>
                )}
                {visibleColumns.paidBackPercent && (
                  <td>
                    <div className="space-y-1">
                      <div className="progress-bar">
                        <div
                          className={`progress-bar-fill ${getProgressBarClass(deal.paidBackPercent)}`}
                          style={{ width: `${Math.min(deal.paidBackPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {formatPercentage(deal.paidBackPercent)}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns.outstanding && (
                  <td className={deal.outstanding > 0 ? 'text-red-600 font-medium' : 'text-orange-600 font-medium'}>
                    {formatCurrency(deal.outstanding)}
                  </td>
                )}
                {visibleColumns.dateFunded && (
                  <td>{formatDate(deal.date_funded)}</td>
                )}
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="total-row">
              {visibleColumns.state && <td>TOTAL</td>}
              {visibleColumns.advanceId && <td></td>}
              {visibleColumns.type && <td></td>}
              {visibleColumns.syndicated && (
                <td className="font-bold">{formatCurrency(totals.syndicated)}</td>
              )}
              {visibleColumns.cafs && (
                <td className="font-bold">{formatCurrency(totals.cafs)}</td>
              )}
              {visibleColumns.tcp && (
                <td className="font-bold">{formatCurrency(totals.tcp)}</td>
              )}
              {visibleColumns.factorRate && <td className="font-bold">1.10</td>}
              {visibleColumns.payback && (
                <td className="font-bold">{formatCurrency(totals.paybackAmount)}</td>
              )}
              {visibleColumns.payments && (
                <td className="font-bold">{formatCurrency(totals.paidBack)}</td>
              )}
              {visibleColumns.paidBackPercent && <td></td>}
              {visibleColumns.outstanding && (
                <td className="font-bold text-red-600">{formatCurrency(totals.outstanding)}</td>
              )}
              {visibleColumns.dateFunded && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing rows {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedDeals.length)} of {sortedDeals.length}
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
    </div>
  )
}

export default AdvancesTable
