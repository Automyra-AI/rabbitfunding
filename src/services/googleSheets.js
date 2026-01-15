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
    // Sheet columns by INDEX (0-based):
    // 0: QBO Customer ID, 1: QBO Customer Name, 2: Contract ID, 3: Expected Payment Amount,
    // 4: Actum Merchant ID, 5: Funded Date (FIRST ONE - has actual date!), 6: Principal Advanced,
    // 7: Deal ID, 8: Client Name, 9: Principal Collected, 10: Status, 11: Funded Date (duplicate - empty),
    // 12: Expected Amount, 13: Expected Amount Low, 14: Expected Amount High, 15: Updated Date,
    // 16: Last QBO JE, 17: Last Payment Date, 18: Last Payment Amount, 19: Last HistoryKey ID,
    // 20: Fee Collected, 21: Customer Email

    const deals = rows.slice(1).map(row => {
      // Use direct index access to handle duplicate column names
      return {
        // IDs
        qbo_customer_id: row[0] || '',
        qbo_customer_name: row[1] || row[8] || '', // Column 1 or 8 (Client Name)
        contract_id: row[2] || '',
        actum_merchant_id: row[4] || '',
        deal_id: row[7] || '',
        client_name: row[8] || row[1] || '',

        // Financial data - parse numbers correctly (remove commas)
        expected_payment_amount: parseNumber(row[3]),
        principal_advanced: parseNumber(row[6]),
        principal_collected: parseNumber(row[9]),
        expected_amount: parseNumber(row[12]),
        expected_amount_low: parseNumber(row[13]),
        expected_amount_high: parseNumber(row[14]),
        last_qbo_je: parseNumber(row[16]),
        last_payment_amount: parseNumber(row[18]),
        fee_collected: parseNumber(row[20]),

        // Status
        status: row[10] || 'Active',

        // Dates - use column 5 (first Funded Date which has actual date!)
        date_funded: row[5] || '', // Column 5 has "JAN 13, 2026 02:01PM"
        funded_date: row[5] || '',
        updated_date: row[15] || '',
        last_payment_date: row[17] || '',

        // Other
        last_historykey_id: row[19] || '',
        customer_email: row[21] || '',

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

    // Convert rows to objects with proper data mapping using direct index access
    // Sheet columns by INDEX (0-based):
    // 0: History KeyID, 1: Order ID, 2: SubID, 3: Consumer Unique ID, 4: Client Name,
    // 5: Amount, 6: Principal Applied, 7: Fee Applied, 8: Transaction Date, 9: Processed Date,
    // 10: QBO Principal JE, 11: QBO Fee JE, 12: Match Method, 13: Auth Code, 14: Error
    const events = rows.slice(1).map(row => {
      const clientName = row[4] || ''
      const amount = parseNumber(row[5])
      const principalApplied = parseNumber(row[6])
      const feeApplied = parseNumber(row[7])
      const transactionDate = row[8] || ''
      const matchMethod = row[12] || ''

      return {
        // IDs
        history_keyid: row[0] || '',
        order_id: row[1] || '',
        sub_id: row[2] || '',
        consumer_unique_id: row[3] || '',

        // Client name - used to match with deals
        client_name: clientName,

        // Financial data - parse numbers correctly
        amount: amount,
        principal_applied: principalApplied,
        fee_applied: feeApplied,
        qbo_principal_je: parseNumber(row[10]),
        qbo_fee_je: parseNumber(row[11]),

        // Dates
        transaction_date: transactionDate,
        processed_date: row[9] || '',

        // Other
        match_method: matchMethod,
        auth_code: row[13] || '',
        error: row[14] || '',

        // For Ledger compatibility
        date: transactionDate,
        type: amount >= 0 ? 'Credit' : 'Debit',
        client: clientName,
        principalApplied: principalApplied,
        feeApplied: feeApplied,
        description: `Payment - ${matchMethod || 'Direct'}`
      }
    })

    console.log('Sample payout event after mapping:', events[0])
    return events
  } catch (error) {
    console.error('Error fetching payout events from Google Sheets:', error)
    throw error
  }
}
