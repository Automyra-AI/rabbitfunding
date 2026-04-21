import { useState, useRef, useEffect } from 'react'
import { MoreVertical, CheckCircle2 } from 'lucide-react'

const DealActionsMenu = ({ deal, onMarkAsPaid }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const isAlreadyPaid = deal?.status?.toLowerCase().replace(/\s+/g, '') === 'paidoff'

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev) }}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md border transition-all ${
          open
            ? 'bg-orange-50 border-orange-300 text-orange-600 shadow-sm'
            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
        }`}
        aria-label="Deal actions"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1.5 w-56 rounded-lg bg-white shadow-xl border border-gray-200 z-30 overflow-hidden animate-fadeIn"
        >
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Admin Actions</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onMarkAsPaid?.(deal)
            }}
            disabled={isAlreadyPaid}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-sm text-left text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-medium">{isAlreadyPaid ? 'Already Paid Off' : 'Mark as Paid in Full'}</span>
              {!isAlreadyPaid && (
                <span className="text-[11px] text-gray-400">Record Zelle / Wire / Check payment</span>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

export default DealActionsMenu
