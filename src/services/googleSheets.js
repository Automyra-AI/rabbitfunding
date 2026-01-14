import { mockDeals, mockPayoutEvents } from '../data/mockData'

const USE_MOCK_DATA = !import.meta.env.VITE_GOOGLE_SHEETS_API_KEY

export const fetchDealsData = async () => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockDeals
  }

  try {
    const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID
    const sheetName = import.meta.env.VITE_GOOGLE_SHEETS_DEALS_TAB || 'Deals'
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch deals data: ${response.statusText}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length === 0) {
      return []
    }

    // First row is headers
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))

    // Convert rows to objects
    const deals = rows.slice(1).map(row => {
      const deal = {}
      headers.forEach((header, index) => {
        deal[header] = row[index] || ''
      })
      return deal
    })

    return deals
  } catch (error) {
    console.error('Error fetching deals from Google Sheets:', error)
    throw error
  }
}

export const fetchPayoutEvents = async () => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockPayoutEvents
  }

  try {
    const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID
    const sheetName = import.meta.env.VITE_GOOGLE_SHEETS_PAYOUT_EVENTS_TAB || 'Payout Events'
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch payout events: ${response.statusText}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length === 0) {
      return []
    }

    // First row is headers
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))

    // Convert rows to objects
    const events = rows.slice(1).map(row => {
      const event = {}
      headers.forEach((header, index) => {
        event[header] = row[index] || ''
      })
      return event
    })

    return events
  } catch (error) {
    console.error('Error fetching payout events from Google Sheets:', error)
    throw error
  }
}
