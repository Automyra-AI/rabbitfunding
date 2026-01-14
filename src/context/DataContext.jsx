import { createContext, useContext, useState, useEffect } from 'react'
import { fetchDealsData, fetchPayoutEvents } from '../services/googleSheets'
import { calculateStats } from '../utils/calculations'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [deals, setDeals] = useState([])
  const [payoutEvents, setPayoutEvents] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [dealsData, eventsData] = await Promise.all([
        fetchDealsData(),
        fetchPayoutEvents()
      ])

      setDeals(dealsData)
      setPayoutEvents(eventsData)
      setStats(calculateStats(dealsData, eventsData))
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 60 seconds
    const refreshInterval = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '60000')
    const interval = setInterval(fetchData, refreshInterval)

    return () => clearInterval(interval)
  }, [])

  const value = {
    deals,
    payoutEvents,
    stats,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
