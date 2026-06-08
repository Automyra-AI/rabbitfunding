import { useState } from 'react'
import { X, Trash2, AlertTriangle, CheckCircle, XCircle, Briefcase } from 'lucide-react'
import { deleteDeal } from '../../services/googleSheets'

const DeleteDealModal = ({ deal, onClose, onSuccess }) => {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!deal) return null

  const dealName = deal.qbo_customer_name || deal.client_name || 'this deal'
  const relatedCount = deal.paymentCount ?? null
  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = async () => {
    if (!isConfirmed || deleting) return
    setDeleting(true)
    setStatus(null)
    setErrorMsg('')
    try {
      await deleteDeal(deal)
      setStatus('success')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Failed to delete deal')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={deleting ? undefined : onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-200">
                  <Trash2 className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Delete Deal</h2>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-gray-700 font-medium">{dealName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={deleting}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start space-x-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">This will hide the customer and all related transactions.</p>
                <p className="text-xs text-amber-700">
                  The deal <strong>{dealName}</strong>
                  {relatedCount !== null && relatedCount > 0
                    ? ` and its ${relatedCount} related transaction${relatedCount === 1 ? '' : 's'}`
                    : ' and its related transactions'}{' '}
                  will be removed from the app.
                </p>
                <p className="text-xs text-amber-700">
                  Nothing is erased from the Google Sheet — the rows are flagged
                  <strong> Deleted = TRUE</strong> and can be restored from the sheet later.
                </p>
              </div>
            </div>

            {/* Type-to-confirm */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Status */}
          {status === 'success' && (
            <div className="mx-5 mb-0 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Deal deleted — Google Sheet will update shortly.
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
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!isConfirmed || deleting}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? 'Deleting...' : 'Delete Deal'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteDealModal
