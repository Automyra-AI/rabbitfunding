import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
