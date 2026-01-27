import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import LedgerTable from '../components/ledger/LedgerTable'
import LedgerFilters from '../components/ledger/LedgerFilters'
import { formatCurrency, formatDate, formatDateForCSV } from '../utils/calculations'
import { BookOpen } from 'lucide-react'

const Ledger = () => {
  const { payoutEvents, stats, loading, error, refetch } = useData()
  const [accountType, setAccountType] = useState('available')
  const [dateRange, setDateRange] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const transactionsWithBalance = useMemo(() => {
    let balance = 0
    return transactions.map(transaction => {
      balance += transaction.amount
      return { ...transaction, balance }
    }).reverse()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    let filtered = transactionsWithBalance

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(t =>
        t.client?.toLowerCase().includes(query)
      )
    }

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

  const handleExport = () => {
    const headers = ['Date', 'Client', 'Type', 'Principal Applied', 'Fee Applied', 'Amount', 'Balance']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        formatDateForCSV(t.date),
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

  const handleSaveReport = () => {
    const reportData = {
      name: `Ledger Report - ${new Date().toLocaleDateString()}`,
      dateRange,
      searchQuery,
      transactionCount: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      generatedAt: new Date().toISOString()
    }

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
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-transparent rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Transaction Ledger</h1>
              <p className="text-sm text-gray-600">Complete financial transaction history</p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Total Transactions</p>
              <p className="text-lg font-bold text-orange-600">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balance Card */}
      <div className="card py-3 px-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Current Balance</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentBalance)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setAccountType('available')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                accountType === 'available'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAccountType('frozen')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                accountType === 'frozen'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
