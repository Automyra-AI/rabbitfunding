import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Advances from './pages/Advances'
import Ledger from './pages/Ledger'
import { DataProvider } from './context/DataContext'

function App() {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/advances" element={<Advances />} />
            <Route path="/ledger" element={<Ledger />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  )
}

export default App
