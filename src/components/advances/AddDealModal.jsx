import { useState, useMemo } from 'react'
import { X, Plus, DollarSign, Calendar, Repeat, TrendingUp, Percent, CheckCircle, XCircle, Save, User, Mail, Hash, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../utils/calculations'
import { addDeal } from '../../services/googleSheets'

const FREQUENCIES = ['Business Day', 'Weekly', 'Monthly']

const EMPTY_FORM = {
  clientName: '',
  qboCustomerId: '',
  contractId: '',
  actumMerchantId: '',
  customerEmail: '',
  loanAmount: '',
  paybackAmount: '',
  originationAmount: '',
  perTransaction: '',
  fundedDate: new Date().toISOString().slice(0, 10),
  paymentFrequency: 'Business Day'
}

// deals: currently-loaded active deals (for client-side duplicate detection —
// the write goes through a no-cors Apps Script call, so we can't read back a
// server-side "duplicate" error and must catch it before submitting)
const AddDealModal = ({ deals = [], onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const loanAmount = parseFloat(form.loanAmount) || 0
  const paybackAmount = parseFloat(form.paybackAmount) || 0
  const originationAmount = parseFloat(form.originationAmount) || 0

  const factorRate = loanAmount > 0 ? paybackAmount / loanAmount : 0
  const originationFee = originationAmount > 0 ? loanAmount - originationAmount : 0

  const trimmedName = form.clientName.trim()
  const isDuplicate = useMemo(() => {
    if (!trimmedName) return false
    const key = trimmedName.toLowerCase()
    return deals.some(d =>
      (d.qbo_customer_name || '').toLowerCase().trim() === key ||
      (d.client_name || '').toLowerCase().trim() === key
    )
  }, [deals, trimmedName])

  const isValid = trimmedName && loanAmount > 0 && paybackAmount > 0 && form.fundedDate && !isDuplicate

  const handleSubmit = async () => {
    if (!isValid || saving) return
    setSaving(true)
    setStatus(null)
    setErrorMsg('')
    try {
      await addDeal({
        client_name: trimmedName,
        qbo_customer_id: form.qboCustomerId.trim(),
        contract_id: form.contractId.trim(),
        actum_merchant_id: form.actumMerchantId.trim(),
        customer_email: form.customerEmail.trim(),
        purchase_price: loanAmount,
        receivables_purchased_amount: paybackAmount,
        syndicated_amount_origination: originationAmount,
        last_payment_amount: parseFloat(form.perTransaction) || 0,
        funded_date: form.fundedDate,
        payment_frequency: form.paymentFrequency
      })
      setStatus('success')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Failed to add deal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={saving ? undefined : onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-200">
                  <Plus className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add New Deal</h2>
                  <p className="text-xs text-gray-600 mt-0.5">Creates a new active deal in the sheet</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={saving}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto max-h-[65vh] space-y-4">
            {/* Client name */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Client / Customer Name *</span>
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={set('clientName')}
                placeholder="e.g. ACME Trucking LLC"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none transition-all ${
                  isDuplicate
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {isDuplicate && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>An active deal for this client already exists — use Edit Deal Terms instead.</span>
                </p>
              )}
            </div>

            {/* Optional identifiers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">QBO Customer ID</span>
                </label>
                <input
                  type="text"
                  value={form.qboCustomerId}
                  onChange={set('qboCustomerId')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Contract ID</span>
                </label>
                <input
                  type="text"
                  value={form.contractId}
                  onChange={set('contractId')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Actum Merchant ID</span>
                </label>
                <input
                  type="text"
                  value={form.actumMerchantId}
                  onChange={set('actumMerchantId')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Customer Email</span>
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={set('customerEmail')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Loan / Payback amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Loan Amount (Syndicated) *</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.loanAmount}
                  onChange={set('loanAmount')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Total Payback *</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.paybackAmount}
                  onChange={set('paybackAmount')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Origination amount + per-transaction */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Syndicated Amt. (Origination)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originationAmount}
                  onChange={set('originationAmount')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Per-Transaction Payment</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.perTransaction}
                  onChange={set('perTransaction')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Funded date + frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Funded Date *</span>
                </label>
                <input
                  type="date"
                  value={form.fundedDate}
                  onChange={set('fundedDate')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Repeat className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Payment Frequency</span>
                </label>
                <select
                  value={form.paymentFrequency}
                  onChange={set('paymentFrequency')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                >
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Live-computed preview */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-emerald-900">Auto-calculated after save</p>
              </div>
              <div className="rounded-md bg-white border border-emerald-200 px-3 py-2 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center space-x-1"><Percent className="h-3 w-3" /><span>Factor Rate</span></span>
                  <span className="font-mono font-semibold text-gray-900">{factorRate.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Origination Fee</span>
                  <span className="font-mono font-semibold text-gray-900">{formatCurrency(originationFee)}</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-700">
                The deal starts as Active with $0 Paid and $0 Fee Collected. Progress, Balance and Est. Payoff
                populate automatically once payments come in through the normal waterfall.
              </p>
            </div>
          </div>

          {/* Status */}
          {status === 'success' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Deal added — Google Sheet will update shortly.
              </span>
            </div>
          )}
          {status === 'error' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Adding...' : 'Add Deal'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddDealModal
