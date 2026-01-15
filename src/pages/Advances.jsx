import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import AdvancesTable from '../components/advances/AdvancesTable'
import AdvancesFilters from '../components/advances/AdvancesFilters'
import { TrendingUp, Briefcase } from 'lucide-react'
import { formatCurrency } from '../utils/calculations'

const Advances = () => {
  const { deals, payoutEvents, loading, error, refetch } = useData()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [amountFilter, setAmountFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState({
    state: true,
    advanceId: true,
    type: false,
    syndicated: true,
    cafs: true,
    tcp: true,
    factorRate: true,
    payback: true,
    payments: true,
    paidBackPercent: true,
    outstanding: true,
    dateFunded: true
  })

  const filteredDeals = useMemo(() => {
    let filtered = deals

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal =>
        deal.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Filter by search query (name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(deal =>
        deal.qbo_customer_name?.toLowerCase().includes(query) ||
        deal.client_name?.toLowerCase().includes(query)
      )
    }

    // Filter by amount
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

  // Calculate quick stats
  const quickStats = useMemo(() => {
    const activeDeals = filteredDeals.filter(d => d.status?.toLowerCase() === 'active').length
    const totalValue = filteredDeals.reduce((sum, d) => sum + (parseFloat(d.principal_advanced) || 0), 0)
    return { activeDeals, totalDeals: filteredDeals.length, totalValue }
  }, [filteredDeals])

  if (loading) {
    return <LoadingSpinner text="Loading advances data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
              <p className="text-sm text-gray-600 mt-1">Track and analyze all MCA advances</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-4">
            <div className="px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Active Deals</p>
                  <p className="text-lg font-bold text-gray-900">{quickStats.activeDeals}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(quickStats.totalValue)}</p>
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
