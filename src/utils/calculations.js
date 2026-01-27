// Default Factor Rate for MCA deals (fallback if not calculated)
const DEFAULT_FACTOR_RATE = 1.536

export const calculateStats = (deals, payoutEvents) => {
  if (!deals || deals.length === 0) {
    return {
      syndicatedAmount: 0,
      syndicatedAmountOrigination: 0,
      totalPayback: 0,
      amountPaid: 0,
      remainingBalance: 0,
      interestEarned: 0,
      factorRate: DEFAULT_FACTOR_RATE,
      totalTransactions: 0,
      remainingTransactions: 0,
      paidBackPercent: 0,
      activeDeals: 0,
      totalDeals: 0,
      avgPaymentPerTransaction: 0
    }
  }

  // Sum exact values from Deals sheet
  // Syndicated Amount = Purchase Price (what we funded)
  const syndicatedAmount = deals.reduce((sum, deal) => sum + (deal.purchase_price || deal.principal_advanced || 0), 0)

  // Syndicated Amount - Origination (from sheet column)
  const syndicatedAmountOrigination = deals.reduce((sum, deal) => sum + (deal.syndicated_amount_origination || 0), 0)

  // Total Payback = Receivables Purchased Amount (from sheet - what customer must pay back)
  const totalPayback = deals.reduce((sum, deal) => sum + (deal.receivables_purchased_amount || 0), 0)

  // Amount Paid = Principal Collected (what customer has paid back)
  const amountPaid = deals.reduce((sum, deal) => sum + (deal.principal_collected || 0), 0)

  // Get last payment amount for average transaction size
  const lastPaymentAmounts = deals.map(deal => deal.last_payment_amount || 0).filter(amt => amt > 0)
  const avgPaymentPerTransaction = lastPaymentAmounts.length > 0
    ? lastPaymentAmounts.reduce((sum, amt) => sum + amt, 0) / lastPaymentAmounts.length
    : 0

  // Factor Rate = Total Payback / Syndicated Amount (calculated from actuals)
  const factorRate = syndicatedAmount > 0 ? totalPayback / syndicatedAmount : DEFAULT_FACTOR_RATE

  // Interest Earned = Total Payback - Syndicated Amount
  const interestEarned = totalPayback - syndicatedAmount

  // Remaining Balance = Total Payback - Amount Paid (ensure not negative)
  const remainingBalance = Math.max(0, totalPayback - amountPaid)

  // Calculate total and remaining transactions per deal then sum
  let totalTransactions = 0
  let remainingTransactions = 0

  deals.forEach(deal => {
    const dealPayback = deal.receivables_purchased_amount || 0
    const dealPaid = deal.principal_collected || 0
    const dealRemaining = Math.max(0, dealPayback - dealPaid)
    const dealPaymentAmount = deal.last_payment_amount || 0

    if (dealPaymentAmount > 0 && dealPayback > 0) {
      // Total transactions for this deal
      totalTransactions += Math.ceil(dealPayback / dealPaymentAmount)
      // Remaining transactions for this deal (only if there's remaining balance)
      if (dealRemaining > 0) {
        remainingTransactions += Math.ceil(dealRemaining / dealPaymentAmount)
      }
    }
  })

  // Paid Back % = (Amount Paid / Total Payback) × 100
  const paidBackPercent = totalPayback > 0
    ? (amountPaid / totalPayback) * 100
    : 0

  // Count active deals
  const activeDeals = deals.filter(deal =>
    deal.status?.toLowerCase() === 'active'
  ).length

  // Total payments from payout events
  const totalPaymentsCount = payoutEvents ? payoutEvents.length : 0

  return {
    // MCA Core Metrics
    syndicatedAmount,              // Total funded amount (Purchase Price)
    syndicatedAmountOrigination,   // Syndicated Amount - Origination (from sheet)
    totalPayback,                  // What customer must pay back (Receivables Purchased Amount)
    amountPaid,                    // What customer has already paid
    remainingBalance,              // What's left to collect
    interestEarned,                // Profit (Payback - Syndicated)
    factorRate,                    // Calculated: Receivables Purchased / Purchase Price

    // Transaction Metrics
    totalTransactions,             // Total number of payments needed
    remainingTransactions,         // Payments still needed
    avgPaymentPerTransaction,      // Average payment per transaction
    totalPaymentsCount,            // Actual payments received (from payout events)

    // Performance Metrics
    paidBackPercent,               // Collection rate
    activeDeals,
    totalDeals: deals.length
  }
}

export const formatCurrency = (amount, compact = false) => {
  if (amount == null || isNaN(amount)) return '$0'
  if (compact) {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '0%'
  return `${value.toFixed(decimals)}%`
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'

  try {
    // Handle format like "JAN 13, 2026 02:01PM"
    // Just extract and return the date part (remove time)
    const dateOnly = dateString.replace(/\s+\d{1,2}:\d{2}(AM|PM)/i, '').trim()

    const date = new Date(dateOnly)
    if (isNaN(date.getTime())) {
      // If parsing fails, return the original string without time
      return dateOnly || dateString
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    }).format(date)
  } catch (err) {
    return dateString
  }
}

export const formatDateForCSV = (dateString) => {
  if (!dateString) return ''

  try {
    // Handle format like "JAN 13, 2026 02:01PM"
    const dateOnly = dateString.replace(/\s+\d{1,2}:\d{2}(AM|PM)/i, '').trim()

    const date = new Date(dateOnly)
    if (isNaN(date.getTime())) {
      return dateOnly || dateString
    }

    // Return MM/DD/YYYY format for CSV (Excel-friendly)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}/${year}`
  } catch (err) {
    return dateString
  }
}

export const formatNumber = (num, decimals = 0) => {
  if (num == null || isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export const calculatePaybackPercentage = (paidBack, tcp) => {
  if (!tcp || tcp === 0) return 0
  return (paidBack / tcp) * 100
}

export const getStatusBadgeClass = (status) => {
  return status?.toLowerCase() === 'active' ? 'badge-active' : 'badge-closed'
}

export const getProgressBarClass = (percentage) => {
  return percentage >= 100 ? 'progress-bar-fill-complete' : 'progress-bar-fill-partial'
}
