import { useState, useEffect } from 'react'
import { X, Clock, BadgeCheck, Hash, Calendar, User, DollarSign, FileText, AlertTriangle, Save, ArrowRightLeft, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/calculations'

const TransactionModal = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client: '',
    amount: 0,
    principalApplied: 0,
    feeApplied: 0,
    description: '',
    error: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (transaction) {
      setFormData({
        client: transaction.client || '',
        amount: transaction.amount || 0,
        principalApplied: transaction.principalApplied || 0,
        feeApplied: transaction.feeApplied || 0,
        description: transaction.description || '',
        error: transaction.error || '',
        notes: transaction.notes || ''
      })
    }
  }, [transaction])

  if (!transaction) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    setSaveError('')
    try {
      await onSave({ ...transaction, ...formData })
      setSaveStatus('success')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const statusConfig = transaction.isSettled
    ? { label: 'Settled', color: 'green', icon: BadgeCheck, bgClass: 'bg-green-50 border-green-200', textClass: 'text-green-700', badgeClass: 'bg-green-100 text-green-800' }
    : { label: 'Pending', color: 'amber', icon: Clock, bgClass: 'bg-amber-50 border-amber-200', textClass: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-800' }

  const StatusIcon = statusConfig.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-5 py-4 border-b ${statusConfig.bgClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${transaction.isSettled ? 'bg-green-200' : 'bg-amber-200'}`}>
                  <StatusIcon className={`h-5 w-5 ${statusConfig.textClass}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.badgeClass}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">#{transaction.history_keyid}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto max-h-[60vh] space-y-4">
            {/* Read-only info row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(transaction.date)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">History Key ID</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 font-mono">{transaction.history_keyid || '-'}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Client Name</span>
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={e => handleChange('client', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Amount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => handleChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Principal</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.principalApplied}
                  onChange={e => handleChange('principalApplied', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center space-x-1.5 mb-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Fee</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.feeApplied}
                  onChange={e => handleChange('feeApplied', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Match Method</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            {/* Error field */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Error</span>
              </label>
              <input
                type="text"
                value={formData.error}
                onChange={e => handleChange('error', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="No errors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center space-x-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Notes</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="Add notes about this transaction..."
              />
            </div>

            {/* Transaction summary */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-xs font-medium text-orange-600 uppercase mb-2">Transaction Summary</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold">{formatCurrency(formData.principalApplied)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-semibold">{formatCurrency(formData.feeApplied)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold">{formatCurrency(transaction.balance || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Status Message */}
          {saveStatus === 'success' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">Transaction updated in Google Sheet</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">{saveError}</span>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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

export default TransactionModal
