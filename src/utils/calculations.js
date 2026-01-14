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
      totalPayments: 0
    }
  }

  // Financial calculations - data is already parsed as numbers from googleSheets.js
  const syndicatedAmount = deals.reduce((sum, deal) => sum + (deal.principal_advanced || 0), 0)
  const totalCAFs = deals.reduce((sum, deal) => sum + (deal.fee_collected || 0), 0)
  const principalCollected = deals.reduce((sum, deal) => sum + (deal.principal_collected || 0), 0)

  const paidBack = principalCollected + totalCAFs
  const outstanding = syndicatedAmount - principalCollected
  const tcp = syndicatedAmount + totalCAFs
  const netSyndicatedAmount = syndicatedAmount - totalCAFs

  // Count active deals
  const activeDeals = deals.filter(deal =>
    deal.status?.toLowerCase() === 'active'
  ).length

  // Calculate average paid back percentage
  const dealsWithPaidBack = deals.map(deal => {
    const dealTcp = (deal.principal_advanced || 0) + (deal.fee_collected || 0)
    const dealPaidBack = (deal.principal_collected || 0) + (deal.fee_collected || 0)
    return dealTcp > 0 ? (dealPaidBack / dealTcp) * 100 : 0
  })
  const avgPaidBackPercent = dealsWithPaidBack.length > 0
    ? dealsWithPaidBack.reduce((sum, pct) => sum + pct, 0) / dealsWithPaidBack.length
    : 0

  // Total payments from payout events
  const totalPayments = payoutEvents ? payoutEvents.length : 0

  // Capital breakdown (based on outstanding amounts)
  // Available = Principal collected (money returned)
  // Deployed = Outstanding principal (money still out)
  // Reserve = Fees collected
  const available = principalCollected
  const deployed = outstanding
  const reserve = totalCAFs

  return {
    available,
    deployed,
    reserve,
    outstandingPurchases: outstanding,
    syndicatedAmount,
    netSyndicatedAmount,
    totalCAFs,
    tcp,
    payback: tcp,
    paidBack,
    outstanding,
    outstandingPercentage: syndicatedAmount > 0 ? (outstanding / syndicatedAmount) * 100 : 0,
    activeDeals,
    totalDeals: deals.length,
    avgPaidBackPercent,
    totalPayments
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
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

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
