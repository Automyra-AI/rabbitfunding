import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import AdvancesTable from '../components/advances/AdvancesTable'
import AdvancesFilters from '../components/advances/AdvancesFilters'
import { Briefcase, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../utils/calculations'

const Advances = () => {
  const { deals, payoutEvents, loading, error, refetch } = useData()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [amountFilter, setAmountFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState({
    state: true,
    advanceId: true,
    type: true,
    syndicated: true,
    syndicatedOrigination: true,
    factorRate: true,
    payback: true,
    payments: true,
    paymentPerTransaction: true,
    paidBackPercent: true,
    totalTransactions: true,
    remainingTransactions: true,
    outstanding: true,
    dateFunded: true
  })

  const filteredDeals = useMemo(() => {
    let filtered = deals

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal =>
        deal.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(deal =>
        deal.qbo_customer_name?.toLowerCase().includes(query) ||
        deal.client_name?.toLowerCase().includes(query)
      )
    }

    if (amountFilter !== 'all') {
      filtered = filtered.filter(deal => {
        const amount = deal.principal_advanced || 0
        switch (amountFilter) {
          case 'under10k':
            return amount < 10000
          case '10k-50k':
            return amount >= 10000 && amount < 50000
          case '50k-100k':
            return amount >= 50000 && amount < 100000
          case 'over100k':
            return amount >= 100000
          default:
            return true
        }
      })
    }

    return filtered
  }, [deals, statusFilter, searchQuery, amountFilter])

  const quickStats = useMemo(() => {
    const activeDeals = filteredDeals.filter(d => d.status?.toLowerCase() === 'active').length
    const syndicatedAmount = filteredDeals.reduce((sum, d) => sum + (parseFloat(d.purchase_price) || parseFloat(d.principal_advanced) || 0), 0)
    const totalPayback = filteredDeals.reduce((sum, d) => sum + (parseFloat(d.receivables_purchased_amount) || 0), 0)
    const amountPaid = filteredDeals.reduce((sum, d) => sum + (parseFloat(d.principal_collected) || 0), 0)
    const remainingBalance = totalPayback - amountPaid
    const interestEarned = totalPayback - syndicatedAmount

    return {
      activeDeals,
      totalDeals: filteredDeals.length,
      syndicatedAmount,
      totalPayback,
      amountPaid,
      remainingBalance,
      interestEarned
    }
  }, [filteredDeals])

  if (loading) {
    return <LoadingSpinner text="Loading advances data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-transparent rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Deal Management</h1>
              <p className="text-sm text-gray-600">Track and analyze all MCA advances</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Active Deals</p>
                  <p className="text-lg font-bold text-gray-900">{quickStats.activeDeals}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-200">
              <div>
                <p className="text-xs text-gray-500">Total Payback</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(quickStats.totalPayback)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdvancesFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        amountFilter={amountFilter}
        onAmountFilterChange={setAmountFilter}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        totalCount={deals.length}
        filteredCount={filteredDeals.length}
      />

      <AdvancesTable
        deals={filteredDeals}
        payoutEvents={payoutEvents}
        visibleColumns={visibleColumns}
      />
    </div>
  )
}

export default Advances
