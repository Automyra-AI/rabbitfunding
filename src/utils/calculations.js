export const calculateStats = (deals, payoutEvents) => {
  if (!deals || deals.length === 0) {
    return {
      available: 0,
      frozen: 0,
      pending: 0,
      outstandingPurchases: 0,
      syndicatedAmount: 0,
      netSyndicatedAmount: 0,
      totalCAFs: 0,
      tcp: 0,
      payback: 0,
      paidBack: 0,
      outstanding: 0,
      outstandingPercentage: 0
    }
  }

  const syndicatedAmount = deals.reduce((sum, deal) => sum + (parseFloat(deal.principal_advanced) || 0), 0)
  const totalCAFs = deals.reduce((sum, deal) => sum + (parseFloat(deal.fee_collected) || 0), 0)
  const principalCollected = deals.reduce((sum, deal) => sum + (parseFloat(deal.principal_collected) || 0), 0)
  const paidBack = principalCollected + totalCAFs
  const outstanding = syndicatedAmount - principalCollected
  const tcp = syndicatedAmount + totalCAFs
  const netSyndicatedAmount = syndicatedAmount - totalCAFs

  // These would be calculated based on your actual business logic
  // For now, using placeholder calculations
  const available = syndicatedAmount * 0.15 // Example: 15% of syndicated amount
  const frozen = syndicatedAmount * 0.05 // Example: 5% frozen
  const pending = syndicatedAmount * 0.02 // Example: 2% pending

  return {
    available,
    frozen,
    pending,
    outstandingPurchases: outstanding,
    syndicatedAmount,
    netSyndicatedAmount,
    totalCAFs,
    tcp,
    payback: tcp, // Assuming payback equals TCP
    paidBack,
    outstanding,
    outstandingPercentage: syndicatedAmount > 0 ? (outstanding / syndicatedAmount) * 100 : 0
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
