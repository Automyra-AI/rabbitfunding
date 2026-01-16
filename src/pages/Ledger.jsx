import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import LedgerTable from '../components/ledger/LedgerTable'
import LedgerFilters from '../components/ledger/LedgerFilters'
import { formatCurrency, formatDate } from '../utils/calculations'

const Ledger = () => {
  const { payoutEvents, stats, loading, error, refetch } = useData()
  const [accountType, setAccountType] = useState('available')
  const [dateRange, setDateRange] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Transform payout events into ledger transactions
  const transactions = useMemo(() => {
    return payoutEvents
      .map((event, index) => ({
        id: index + 1,
        history_keyid: event.history_keyid || '',
        date: event.transaction_date,
        type: 'Credit',
        amount: event.amount || 0,
        description: event.match_method || 'Payment',
        client: event.client_name,
        principalApplied: event.principal_applied || 0,
        feeApplied: event.fee_applied || 0,
        matchMethod: event.match_method || '',
        error: event.error || ''
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [payoutEvents])

  // Calculate running balance
  const transactionsWithBalance = useMemo(() => {
    let balance = 0
    return transactions.map(transaction => {
      balance += transaction.amount
      return { ...transaction, balance }
    }).reverse() // Show newest first
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    let filtered = transactionsWithBalance

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(t =>
        t.client?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()

      switch (dateRange) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case '30days':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90days':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case 'ytd':
          cutoffDate.setMonth(0)
          cutoffDate.setDate(1)
          break
      }

      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    return filtered
  }, [transactionsWithBalance, dateRange, searchQuery])

  // Export to CSV function
  const handleExport = () => {
    const headers = ['Date', 'Client', 'Type', 'Principal Applied', 'Fee Applied', 'Amount', 'Balance']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        formatDate(t.date),
        `"${t.client}"`,
        t.type,
        t.principalApplied,
        t.feeApplied,
        t.amount,
        t.balance
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Save Report function
  const handleSaveReport = () => {
    const reportData = {
      name: `Ledger Report - ${new Date().toLocaleDateString()}`,
      dateRange,
      searchQuery,
      transactionCount: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      generatedAt: new Date().toISOString()
    }

    // Save to localStorage
    const savedReports = JSON.parse(localStorage.getItem('ledgerReports') || '[]')
    savedReports.push(reportData)
    localStorage.setItem('ledgerReports', JSON.stringify(savedReports))

    alert('Report saved successfully!')
  }

  if (loading) {
    return <LoadingSpinner text="Loading ledger data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  const currentBalance = accountType === 'available' ? stats.available : stats.frozen

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-transparent rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Ledger</h1>
              <p className="text-sm text-gray-600 mt-1">Complete financial transaction history</p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Total Transactions</p>
              <p className="text-lg font-bold text-orange-600">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balance Card */}
      <div className="card hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Current Balance</p>
              <p className="text-4xl font-bold text-primary mt-1">{formatCurrency(currentBalance)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setAccountType('available')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                accountType === 'available'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAccountType('frozen')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                accountType === 'frozen'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              Frozen
            </button>
          </div>
        </div>
      </div>

      <LedgerFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        totalCount={transactionsWithBalance.length}
        filteredCount={filteredTransactions.length}
        onExport={handleExport}
        onSaveReport={handleSaveReport}
      />

      <LedgerTable transactions={filteredTransactions} />
    </div>
  )
}

export default Ledger
