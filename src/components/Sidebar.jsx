import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, BookOpen, X, ChevronRight, Rabbit } from 'lucide-react'

const Sidebar = ({ open, onClose }) => {
  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview & metrics'
    },
    {
      to: '/advances',
      icon: TrendingUp,
      label: 'Advances',
      description: 'Deal management'
    },
    {
      to: '/ledger',
      icon: BookOpen,
      label: 'Ledger',
      description: 'Transaction history'
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative lg:flex-shrink-0 top-0 left-0 z-40 h-full w-72 bg-gradient-to-b from-white to-gray-50 border-r-2 border-gray-200 shadow-xl
          transform transition-all duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button (mobile only) */}
          <div className="flex items-center justify-between p-6 lg:hidden border-b-2 border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Rabbit className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">RabbitFunding</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-gray-200 group-hover:bg-orange-100'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">{item.label}</span>
                        <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                    }`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700">System Online</span>
              </div>
              <p className="text-xs text-gray-500">
                v1.0.0 • © 2026
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
