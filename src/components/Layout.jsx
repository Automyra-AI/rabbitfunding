import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden max-w-full">
      {/* Top Navbar */}
      <Navbar />

      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
