import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical, CheckCircle2 } from 'lucide-react'

const MENU_WIDTH = 240
const MENU_ESTIMATED_HEIGHT = 80

const DealActionsMenu = ({ deal, onMarkAsPaid }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Prefer opening below-right of the button; flip up/left if it would overflow
    let top = rect.bottom + 6
    let left = rect.left
    if (left + MENU_WIDTH > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - MENU_WIDTH - 8)
    }
    if (top + MENU_ESTIMATED_HEIGHT > viewportHeight - 8) {
      top = Math.max(8, rect.top - MENU_ESTIMATED_HEIGHT - 6)
    }
    setCoords({ top, left })
  }

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open])

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
    const handleScrollOrResize = () => updatePosition()

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open])

  const isAlreadyPaid = deal?.status?.toLowerCase().replace(/\s+/g, '') === 'paidoff'

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev) }}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md border transition-all ${
          open
            ? 'bg-orange-50 border-orange-300 text-orange-600 shadow-sm'
            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
        }`}
        aria-label="Deal actions"
        aria-expanded={open}
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: MENU_WIDTH }}
          className="rounded-lg bg-white shadow-2xl border border-gray-200 z-[1000] overflow-hidden animate-fadeIn"
        >
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Admin Actions</p>
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
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="font-medium whitespace-nowrap">{isAlreadyPaid ? 'Already Paid Off' : 'Mark as Paid in Full'}</span>
              {!isAlreadyPaid && (
                <span className="text-[11px] text-gray-400 whitespace-nowrap">Zelle / Wire / Check payment</span>
              )}
            </div>
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

export default DealActionsMenu
