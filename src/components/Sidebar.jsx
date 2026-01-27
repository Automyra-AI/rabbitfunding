import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, BookOpen, X, Rabbit, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth()

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/advances',
      icon: TrendingUp,
      label: 'Advances'
    },
    {
      to: '/ledger',
      icon: BookOpen,
      label: 'Ledger'
    },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      to: '/admin',
      icon: Shield,
      label: 'Admin'
    })
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Narrow width */}
      <aside
        className={`
          fixed lg:relative lg:flex-shrink-0 top-0 left-0 z-40 h-full w-16 bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${open ? 'translate-x-0 w-56' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button (mobile only) */}
          <div className="flex items-center justify-between p-3 lg:hidden border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Rabbit className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">RabbitFunding</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-center lg:justify-center px-2 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <div className="flex items-center space-x-2">
                    <item.icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                    <span className="lg:hidden font-medium text-sm">{item.label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
