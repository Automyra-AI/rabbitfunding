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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const isAlreadyPaid = deal?.status?.toLowerCase().replace(/\s+/g, '') === 'paidoff'

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev) }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-52 rounded-lg bg-white shadow-lg border border-gray-200 z-20 py-1 animate-fadeIn"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onMarkAsPaid?.(deal)
            }}
            disabled={isAlreadyPaid}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{isAlreadyPaid ? 'Already Paid Off' : 'Mark as Paid in Full'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default DealActionsMenu
