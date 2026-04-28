import { useState, useMemo } from 'react'
import { X, CheckCircle2, DollarSign, Calendar, FileText, Wallet, CreditCard, Banknote, CheckCircle, XCircle, Save, Briefcase, Percent } from 'lucide-react'
import { formatCurrency } from '../../utils/calculations'
import { markDealAsPaid } from '../../services/googleSheets'

const METHODS = [
  { value: 'Zelle', label: 'Zelle', icon: Wallet },
  { value: 'Wire', label: 'Wire', icon: CreditCard },
  { value: 'Check', label: 'Check', icon: Banknote },
  { value: 'Cash', label: 'Cash', icon: DollarSign },
  { value: 'Other', label: 'Other', icon: FileText }
]

const MarkAsPaidModal = ({ deal, onClose, onSuccess }) => {
  const totalPayback = deal?.totalPayback || deal?.receivables_purchased_amount || 0
  const amountPaid = deal?.amountPaid ?? ((deal?.principal_collected || 0) + (deal?.fee_collected || 0))
  const remainingBalance = Math.max(0, totalPayback - amountPaid)

  const today = new Date().toISOString().slice(0, 10)

  const [amount, setAmount] = useState(remainingBalance.toFixed(2))
  const [method, setMethod] = useState('Zelle')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount])
  const discount = Math.max(0, remainingBalance - parsedAmount)
  const hasDiscount = discount > 0.005
  const isValid = parsedAmount > 0 && method && date

  if (!deal) return null

  const handleSubmit = async () => {
    if (!isValid || saving) return
    setSaving(true)
    setStatus(null)
    setErrorMsg('')
    try {
      await markDealAsPaid(deal, {
        amount: parsedAmount,
        method,
        note,
        date,
        discount: hasDiscount ? Number(discount.toFixed(2)) : 0
      })
      setStatus('success')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Failed to mark deal as paid')
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
          <div className="px-5 py-4 border-b bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Mark as Paid in Full</h2>
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
            {/* Deal summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payback</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(totalPayback)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Already Paid</p>
                <p className="text-sm font-bold text-blue-600">{formatCurrency(amountPaid)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 uppercase mb-1">Remaining</p>
                <p className="text-sm font-bold text-orange-700">{formatCurrency(remainingBalance)}</p>
              </div>
            </div>

            {/* Amount paid */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Amount Merchant Pays</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Auto-detected discount breakdown — only when payment < remaining */}
            {hasDiscount && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-900">
                    Early Payoff Discount: {formatCurrency(discount)}
                  </p>
                </div>
                <div className="rounded-md bg-white border border-amber-200 px-3 py-2 text-xs space-y-1">
                  <div className="flex justify-between text-gray-500 line-through">
                    <span>Original Payback</span>
                    <span className="font-mono">{formatCurrency(totalPayback)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Discount (forgiven)</span>
                    <span className="font-mono font-semibold">−{formatCurrency(discount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1 flex justify-between text-gray-900 font-bold">
                    <span>New Payback</span>
                    <span className="font-mono">{formatCurrency(totalPayback - discount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 pt-1">
                    <span>Merchant pays today ({method})</span>
                    <span className="font-mono font-semibold">{formatCurrency(parsedAmount)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700">
                  The deal's <strong>Payback</strong> will be reduced by {formatCurrency(discount)} to reflect the discount, and the deal will be marked Paid in Full.
                </p>
              </div>
            )}

            {/* Method */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <Wallet className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Payment Method</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {METHODS.map(m => {
                  const Icon = m.icon
                  const active = method === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={`flex flex-col items-center space-y-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-white text-gray-500 border border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Payment Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Note */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Reference / Note (optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Zelle confirmation #XYZ123 or payer name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Status */}
          {status === 'success' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Payment recorded — Google Sheet will update shortly.
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
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Record Payment'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MarkAsPaidModal
