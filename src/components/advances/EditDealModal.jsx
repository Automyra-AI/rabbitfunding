import { useState, useMemo } from 'react'
import { X, Pencil, DollarSign, Calendar, Repeat, TrendingUp, Percent, CheckCircle, XCircle, Save, Briefcase, AlertTriangle } from 'lucide-react'
import { formatCurrency, parseDate } from '../../utils/calculations'
import { updateDeal } from '../../services/googleSheets'

const FREQUENCIES = ['Business Day', 'Weekly', 'Monthly']

// Convert a sheet date string (many formats) into a yyyy-mm-dd value for <input type="date">
const toDateInputValue = (dateString) => {
  if (!dateString) return ''
  const d = parseDate(dateString)
  if (!d || d.getTime() === 0) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const EditDealModal = ({ deal, onClose, onSuccess }) => {
  const initial = useMemo(() => ({
    loanAmount: String(deal?.purchase_price ?? deal?.principal_advanced ?? 0),
    paybackAmount: String(deal?.receivables_purchased_amount ?? 0),
    originationAmount: String(deal?.syndicated_amount_origination ?? 0),
    perTransaction: String(deal?.last_payment_amount ?? 0),
    fundedDate: toDateInputValue(deal?.date_funded || deal?.funded_date),
    paymentFrequency: deal?.payment_frequency || 'Business Day'
  }), [deal])

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!deal) return null

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const loanAmount = parseFloat(form.loanAmount) || 0
  const paybackAmount = parseFloat(form.paybackAmount) || 0
  const originationAmount = parseFloat(form.originationAmount) || 0
  const perTransaction = parseFloat(form.perTransaction) || 0

  const factorRate = loanAmount > 0 ? paybackAmount / loanAmount : 0
  const originationFee = originationAmount > 0 ? loanAmount - originationAmount : 0
  const loanAmountChanged = loanAmount !== (parseFloat(initial.loanAmount) || 0)

  const isValid = loanAmount > 0 && paybackAmount > 0 && form.fundedDate

  const handleSubmit = async () => {
    if (!isValid || saving) return
    setSaving(true)
    setStatus(null)
    setErrorMsg('')
    try {
      await updateDeal(deal, {
        purchase_price: loanAmount,
        receivables_purchased_amount: paybackAmount,
        syndicated_amount_origination: originationAmount,
        last_payment_amount: perTransaction,
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
      setErrorMsg(err.message || 'Failed to update deal')
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
          <div className="px-5 py-4 border-b bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-200">
                  <Pencil className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Deal Terms</h2>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-gray-700 font-medium">
                      {deal.qbo_customer_name || deal.client_name}
                    </span>
                  </div>
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
          <div className="px-5 py-4 overflow-y-auto max-h-[60vh] space-y-4">
            {/* Loan / Payback amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Loan Amount (Syndicated)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.loanAmount}
                  onChange={set('loanAmount')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Total Payback</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.paybackAmount}
                  onChange={set('paybackAmount')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Funded date + frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Funded Date</span>
                </label>
                <input
                  type="date"
                  value={form.fundedDate}
                  onChange={set('fundedDate')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Live-computed preview */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-blue-900">Auto-calculated after save</p>
              </div>
              <div className="rounded-md bg-white border border-blue-200 px-3 py-2 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center space-x-1"><Percent className="h-3 w-3" /><span>Factor Rate</span></span>
                  <span className="font-mono font-semibold text-gray-900">{factorRate.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Origination Fee</span>
                  <span className="font-mono font-semibold text-gray-900">{formatCurrency(originationFee)}</span>
                </div>
              </div>
              <p className="text-[11px] text-blue-700">
                Paid, Fee, Progress, Balance, Est. Payoff and Status are recalculated automatically from this
                deal's existing transactions — they are never edited directly.
              </p>
            </div>

            {loanAmountChanged && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Changing the Loan Amount re-runs the payment waterfall for this deal — how much of each
                  existing settled payment counted as principal vs. fee may shift to reflect the new amount.
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          {status === 'success' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Deal updated — Google Sheet will update shortly.
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
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditDealModal
