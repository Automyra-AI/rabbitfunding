export const calculateStats = (deals, payoutEvents) => {
  if (!deals || deals.length === 0) {
    return {
      available: 0,
      deployed: 0,
      reserve: 0,
      outstandingPurchases: 0,
      syndicatedAmount: 0,
      netSyndicatedAmount: 0,
      totalCAFs: 0,
      tcp: 0,
      payback: 0,
      paidBack: 0,
      outstanding: 0,
      outstandingPercentage: 0,
      activeDeals: 0,
      totalDeals: 0,
      avgPaidBackPercent: 0,
      totalPayments: 0,
      expectedAmount: 0,
      expectedPaymentAmount: 0
    }
  }

  // Sum exact values from Deals sheet - no calculations
  const principalAdvanced = deals.reduce((sum, deal) => sum + (deal.principal_advanced || 0), 0)
  const principalCollected = deals.reduce((sum, deal) => sum + (deal.principal_collected || 0), 0)
  const feeCollected = deals.reduce((sum, deal) => sum + (deal.fee_collected || 0), 0)
  const expectedAmount = deals.reduce((sum, deal) => sum + (deal.expected_amount || 0), 0)
  const expectedPaymentAmount = deals.reduce((sum, deal) => sum + (deal.expected_payment_amount || 0), 0)

  // Count active deals
  const activeDeals = deals.filter(deal =>
    deal.status?.toLowerCase() === 'active'
  ).length

  // Total payments from payout events
  const totalPayments = payoutEvents ? payoutEvents.length : 0

  // Calculate paid back percentage based on expected amount
  const avgPaidBackPercent = expectedPaymentAmount > 0
    ? (principalCollected / expectedPaymentAmount) * 100
    : 0

  return {
    // Exact sums from sheet
    available: principalCollected,
    deployed: principalAdvanced - principalCollected,
    reserve: feeCollected,
    outstandingPurchases: expectedAmount,
    syndicatedAmount: principalAdvanced,
    netSyndicatedAmount: principalAdvanced - feeCollected,
    totalCAFs: feeCollected,
    tcp: expectedPaymentAmount,
    payback: expectedPaymentAmount,
    paidBack: principalCollected + feeCollected,
    outstanding: expectedAmount,
    outstandingPercentage: principalAdvanced > 0 ? ((principalAdvanced - principalCollected) / principalAdvanced) * 100 : 0,
    activeDeals,
    totalDeals: deals.length,
    avgPaidBackPercent,
    totalPayments,
    expectedAmount,
    expectedPaymentAmount
  }
}

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
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
