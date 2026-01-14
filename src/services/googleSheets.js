import { mockDeals, mockPayoutEvents } from '../data/mockData'

const USE_MOCK_DATA = !import.meta.env.VITE_GOOGLE_SHEETS_API_KEY

// Helper function to parse numbers with commas (e.g., "3,900" -> 3900)
const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0
  // Remove commas and dollar signs, then parse
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

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

    // URL encode the sheet name to handle spaces and special characters
    const encodedSheetName = encodeURIComponent(sheetName)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`

    console.log('Fetching deals from:', sheetName)

    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', errorData)
      throw new Error(`Failed to fetch deals data: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length === 0) {
      console.warn('No data found in Deals sheet')
      return []
    }

    console.log(`✅ Found ${rows.length - 1} deals in Google Sheets`)

    // First row is headers - normalize to lowercase with underscores
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))

    console.log('Sheet headers:', headers)

    // Convert rows to objects with proper data mapping
    const deals = rows.slice(1).map(row => {
      const rawDeal = {}
      headers.forEach((header, index) => {
        rawDeal[header] = row[index] || ''
      })

      // Map to standardized field names and parse values correctly
      // Sheet columns: QBO Customer ID, QBO Customer Name, Contract ID, Expected Payment Amount,
      // Actum Merchant ID, Funded Date, Principal Advanced, Deal ID, Client Name, Principal Collected,
      // Status, Funded Date, Expected Amount, Expected Amount Low, Expected Amount High, Updated Date,
      // Last QBO JE, Last Payment Date, Last Payment Amount, Last HistoryKey ID, Fee Collected, Customer Email

      return {
        // IDs
        qbo_customer_id: rawDeal.qbo_customer_id || '',
        deal_id: rawDeal.deal_id || '',
        contract_id: rawDeal.contract_id || '',
        actum_merchant_id: rawDeal.actum_merchant_id || '',

        // Names
        qbo_customer_name: rawDeal.qbo_customer_name || rawDeal.client_name || '',
        client_name: rawDeal.client_name || rawDeal.qbo_customer_name || '',

        // Financial data - parse numbers correctly (remove commas)
        principal_advanced: parseNumber(rawDeal.principal_advanced),
        principal_collected: parseNumber(rawDeal.principal_collected),
        fee_collected: parseNumber(rawDeal.fee_collected),
        expected_payment_amount: parseNumber(rawDeal.expected_payment_amount),
        expected_amount: parseNumber(rawDeal.expected_amount),
        expected_amount_low: parseNumber(rawDeal.expected_amount_low),
        expected_amount_high: parseNumber(rawDeal.expected_amount_high),
        last_payment_amount: parseNumber(rawDeal.last_payment_amount),
        last_qbo_je: parseNumber(rawDeal.last_qbo_je),

        // Status
        status: rawDeal.status || 'Active',

        // Dates - use funded_date column, map to date_funded for compatibility
        date_funded: rawDeal.funded_date || '',
        funded_date: rawDeal.funded_date || '',
        updated_date: rawDeal.updated_date || '',
        last_payment_date: rawDeal.last_payment_date || '',

        // Other
        customer_email: rawDeal.customer_email || '',
        last_historykey_id: rawDeal.last_historykey_id || '',

        // For compatibility with existing code
        type: 'New', // Default type
        syndication_percentage: 100, // Default 100%
        factor_rate: '' // Not in sheet
      }
    })

    console.log('Sample deal after mapping:', deals[0])
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

    // URL encode the sheet name to handle spaces and special characters
    const encodedSheetName = encodeURIComponent(sheetName)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`

    console.log('Fetching payout events from:', sheetName)

    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', errorData)
      throw new Error(`Failed to fetch payout events: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const rows = data.values

    if (!rows || rows.length === 0) {
      console.warn('No data found in Payout Events sheet')
      return []
    }

    console.log(`✅ Found ${rows.length - 1} payout events in Google Sheets`)

    // First row is headers
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))

    console.log('Payout Events headers:', headers)

    // Convert rows to objects with proper data mapping
    // Sheet columns: History KeyID, Order ID, SubID, Consumer Unique ID, Client Name, Amount,
    // Principal Applied, Fee Applied, Transaction Date, Processed Date, QBO Principal JE,
    // QBO Fee JE, Match Method, Auth Code, Error
    const events = rows.slice(1).map(row => {
      const rawEvent = {}
      headers.forEach((header, index) => {
        rawEvent[header] = row[index] || ''
      })

      return {
        // IDs
        history_keyid: rawEvent.history_keyid || '',
        order_id: rawEvent.order_id || '',
        sub_id: rawEvent.subid || '',
        consumer_unique_id: rawEvent.consumer_unique_id || '',

        // Client name - used to match with deals
        client_name: rawEvent.client_name || '',

        // Financial data - parse numbers correctly
        amount: parseNumber(rawEvent.amount),
        principal_applied: parseNumber(rawEvent.principal_applied),
        fee_applied: parseNumber(rawEvent.fee_applied),
        qbo_principal_je: parseNumber(rawEvent.qbo_principal_je),
        qbo_fee_je: parseNumber(rawEvent.qbo_fee_je),

        // Dates
        transaction_date: rawEvent.transaction_date || '',
        processed_date: rawEvent.processed_date || '',

        // Other
        match_method: rawEvent.match_method || '',
        auth_code: rawEvent.auth_code || '',
        error: rawEvent.error || '',

        // For Ledger compatibility
        date: rawEvent.transaction_date || '',
        type: parseNumber(rawEvent.amount) >= 0 ? 'Credit' : 'Debit',
        client: rawEvent.client_name || '',
        principalApplied: parseNumber(rawEvent.principal_applied),
        feeApplied: parseNumber(rawEvent.fee_applied),
        description: `Payment - ${rawEvent.match_method || 'Direct'}`
      }
    })

    console.log('Sample payout event after mapping:', events[0])
    return events
  } catch (error) {
    console.error('Error fetching payout events from Google Sheets:', error)
    throw error
  }
}
