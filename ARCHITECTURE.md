# Architecture Overview

Understanding the MCA Syndication Manager's structure and data flow.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           React Application (SPA)               │    │
│  │                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │Dashboard │  │ Advances │  │  Ledger  │    │    │
│  │  │   Page   │  │   Page   │  │   Page   │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                 │    │
│  │  ┌─────────────────────────────────────┐      │    │
│  │  │      DataContext (Global State)     │      │    │
│  │  │  - Deals                            │      │    │
│  │  │  - Payout Events                    │      │    │
│  │  │  - Calculated Stats                 │      │    │
│  │  │  - Loading/Error States             │      │    │
│  │  └─────────────────────────────────────┘      │    │
│  │                     ▲                          │    │
│  │                     │                          │    │
│  │  ┌──────────────────┴──────────────────┐      │    │
│  │  │    services/googleSheets.js         │      │    │
│  │  │  - fetchDealsData()                 │      │    │
│  │  │  - fetchPayoutEvents()              │      │    │
│  │  └─────────────────────────────────────┘      │    │
│  │                     ▲                          │    │
│  └─────────────────────┼──────────────────────────┘    │
│                        │                               │
└────────────────────────┼───────────────────────────────┘
                         │
                    HTTPS Request
                         │
┌────────────────────────┼───────────────────────────────┐
│                        ▼                               │
│              Google Sheets API v4                      │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │        Your Google Spreadsheet               │    │
│  │                                               │    │
│  │  ┌─────────────┐    ┌─────────────────┐    │    │
│  │  │  Deals Tab  │    │ Payout Events   │    │    │
│  │  │             │    │      Tab        │    │    │
│  │  │ - QBO ID    │    │ - History Key   │    │    │
│  │  │ - Customer  │    │ - Client Name   │    │    │
│  │  │ - Principal │    │ - Amount        │    │    │
│  │  │ - Status    │    │ - Principal     │    │    │
│  │  │ - Fees      │    │ - Fees          │    │    │
│  │  └─────────────┘    └─────────────────┘    │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
│                        ▲                               │
└────────────────────────┼───────────────────────────────┘
                         │
                         │
┌────────────────────────┼───────────────────────────────┐
│                        │                               │
│              n8n Automation (Your System)              │
│                                                        │
│  1. Downloads from Actum SFTP daily                   │
│  2. Processes payments (waterfall logic)              │
│  3. Posts to QuickBooks                               │
│  4. Updates Google Sheets                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.jsx (Router)
│
├─ Layout.jsx
│  │
│  ├─ Navbar.jsx
│  │  ├─ Refresh Button
│  │  ├─ Export Button
│  │  └─ User Menu
│  │
│  ├─ Sidebar.jsx
│  │  ├─ Dashboard Link
│  │  ├─ Advances Link
│  │  └─ Ledger Link
│  │
│  └─ [Page Content]
│     │
│     ├─ Dashboard.jsx
│     │  ├─ BalanceCard.jsx
│     │  │  └─ Stat displays × 4
│     │  │
│     │  └─ PerformanceStatsCard.jsx
│     │     ├─ Expandable header
│     │     └─ Stat displays × 7
│     │
│     ├─ Advances.jsx
│     │  ├─ AdvancesFilters.jsx
│     │  │  ├─ Status filter
│     │  │  └─ Column selector
│     │  │
│     │  └─ AdvancesTable.jsx
│     │     ├─ Sortable headers
│     │     ├─ Data rows
│     │     ├─ Progress bars
│     │     ├─ Totals row
│     │     └─ Pagination
│     │
│     └─ Ledger.jsx
│        ├─ Account balance card
│        ├─ LedgerFilters.jsx
│        │  ├─ Date range selector
│        │  └─ Saved reports
│        │
│        └─ LedgerTable.jsx
│           ├─ Transaction rows
│           ├─ Running balance
│           └─ Pagination
│
└─ DataContext.Provider (wraps everything)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Application Startup                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         DataContext initializes                          │
│         - Sets loading = true                            │
│         - Calls fetchData()                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│   Parallel API calls:                                    │
│   ┌────────────────────┐  ┌─────────────────────┐      │
│   │ fetchDealsData()   │  │ fetchPayoutEvents() │      │
│   └────────┬───────────┘  └───────┬─────────────┘      │
│            │                       │                     │
│            ▼                       ▼                     │
│   Google Sheets API      Google Sheets API              │
│   /values/Deals          /values/Payout Events          │
│            │                       │                     │
│            ▼                       ▼                     │
│   Parse headers/rows      Parse headers/rows            │
│   Convert to objects      Convert to objects            │
└────────────┬───────────────────────┬─────────────────────┘
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Both responses received                          │
│         - setDeals(dealsData)                           │
│         - setPayoutEvents(eventsData)                   │
│         - Calculate stats                               │
│         - setStats(calculatedStats)                     │
│         - setLoading(false)                             │
│         - setLastUpdated(new Date())                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Components re-render with data                   │
│         - Dashboard shows stats                          │
│         - Advances shows deals table                     │
│         - Ledger shows transactions                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Auto-refresh timer starts                        │
│         setInterval(() => fetchData(), 60000)           │
│                                                          │
│         Every 60 seconds:                                │
│         - Repeat fetch process                           │
│         - Update state                                   │
│         - Components re-render                           │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────┐
│                   DataContext State                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  deals: Array<Deal>                                     │
│  ├─ qbo_customer_id                                     │
│  ├─ qbo_customer_name                                   │
│  ├─ principal_advanced                                  │
│  ├─ principal_collected                                 │
│  ├─ status                                              │
│  ├─ fee_collected                                       │
│  └─ ... (other fields)                                  │
│                                                          │
│  payoutEvents: Array<PayoutEvent>                       │
│  ├─ history_key_id                                      │
│  ├─ client_name                                         │
│  ├─ amount                                              │
│  ├─ principal_applied                                   │
│  ├─ fee_applied                                         │
│  └─ transaction_date                                    │
│                                                          │
│  stats: Object                                          │
│  ├─ available                                           │
│  ├─ frozen                                              │
│  ├─ pending                                             │
│  ├─ outstandingPurchases                               │
│  ├─ syndicatedAmount                                   │
│  ├─ netSyndicatedAmount  ⭐ NEW                        │
│  ├─ totalCAFs                                          │
│  ├─ tcp                                                │
│  ├─ payback                                            │
│  ├─ paidBack                                           │
│  ├─ outstanding                                        │
│  └─ outstandingPercentage                              │
│                                                          │
│  loading: Boolean                                       │
│  error: String | null                                   │
│  lastUpdated: Date | null                               │
│  refetch: Function                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Calculation Flow

```
Input: deals[], payoutEvents[]
│
├─ Calculate Syndicated Amount
│  └─ SUM(deals.principal_advanced)
│
├─ Calculate Total CAFs
│  └─ SUM(deals.fee_collected)
│
├─ Calculate Net Syndicated Amount  ⭐ NEW
│  └─ syndicatedAmount - totalCAFs
│
├─ Calculate Principal Collected
│  └─ SUM(deals.principal_collected)
│
├─ Calculate TCP
│  └─ syndicatedAmount + totalCAFs
│
├─ Calculate Paid Back
│  └─ principalCollected + totalCAFs
│
├─ Calculate Outstanding
│  └─ syndicatedAmount - principalCollected
│
└─ Calculate Outstanding %
   └─ (outstanding / syndicatedAmount) × 100

Output: stats object
```

## Routing Structure

```
/ (root)
│
├─ /dashboard
│  │
│  ├─ Balance Card
│  └─ Performance Stats Card
│
├─ /advances
│  │
│  ├─ Filters
│  └─ Data Table
│     ├─ Headers (sortable)
│     ├─ Rows
│     ├─ Totals
│     └─ Pagination
│
└─ /ledger
   │
   ├─ Account Balance
   ├─ Filters
   └─ Transaction Table
      ├─ Rows with running balance
      └─ Pagination
```

## Build Process

```
Source Code (src/)
│
├─ Vite processes
│  ├─ Transpiles JSX → JS
│  ├─ Processes Tailwind CSS
│  ├─ Bundles modules
│  ├─ Tree-shakes unused code
│  ├─ Minifies JS/CSS
│  └─ Generates source maps
│
└─ Output (dist/)
   ├─ index.html
   ├─ assets/
   │  ├─ index-[hash].js
   │  └─ index-[hash].css
   └─ vite.svg

Deploy dist/ folder to hosting
```

## Environment Configuration

```
Development (.env)
├─ Local API key
├─ Test spreadsheet
└─ Debug mode

Production (.env.production)
├─ Production API key
├─ Production spreadsheet
└─ Optimized settings

Build Process
├─ Reads .env.production
├─ Replaces VITE_* variables
└─ Outputs static files
```

## API Request Flow

```
Component needs data
│
└─ Calls useData() hook
   │
   └─ Gets data from DataContext
      │
      ├─ If cached: return immediately
      │
      └─ If fetching needed:
         │
         └─ googleSheets.fetchDealsData()
            │
            ├─ Construct URL
            │  https://sheets.googleapis.com/v4/spreadsheets/
            │  {spreadsheetId}/values/{range}?key={apiKey}
            │
            ├─ Send GET request
            │
            ├─ Receive response
            │  {
            │    "values": [
            │      ["Header1", "Header2", ...],
            │      ["Value1", "Value2", ...],
            │      ...
            │    ]
            │  }
            │
            ├─ Parse data
            │  ├─ Extract headers from row 0
            │  ├─ Convert to lowercase with underscores
            │  └─ Map rows to objects
            │
            └─ Return array of objects
               [
                 { qbo_customer_id: "589", ... },
                 { qbo_customer_id: "612", ... }
               ]
```

## Error Handling Flow

```
Try to fetch data
│
├─ Success
│  ├─ Update state with data
│  ├─ Clear error
│  └─ Set loading = false
│
└─ Error
   ├─ Catch error
   ├─ Log to console
   ├─ Set error message
   ├─ Set loading = false
   └─ Show ErrorMessage component
      └─ User can click "Try Again"
         └─ Calls refetch()
            └─ Retry from start
```

## Performance Optimizations

```
1. Memoization
   ├─ useMemo for filtered data
   ├─ useMemo for sorted data
   ├─ useMemo for calculated stats
   └─ useCallback for event handlers

2. Code Splitting
   ├─ React Router lazy loading
   └─ Dynamic imports (future)

3. Efficient Re-renders
   ├─ Context only updates when data changes
   ├─ Components only re-render when props change
   └─ Pagination limits DOM nodes

4. Caching
   ├─ Browser caches static assets
   ├─ DataContext caches fetched data
   └─ 60-second refresh interval (not on every render)
```

## Security Architecture

```
User Browser
│
├─ No sensitive data stored
├─ API key in environment variables
│  (replaced at build time)
│
└─ Requests to Google Sheets API
   │
   ├─ HTTPS only
   ├─ API key in query string
   ├─ Read-only access
   │
   └─ Google validates
      ├─ API key is valid
      ├─ API restrictions (domains)
      ├─ Sheet is accessible
      └─ Rate limits
```

## Future Architecture Considerations

**When scaling beyond 1000 deals:**
```
Option 1: Backend API
├─ Express/Node server
├─ Cache in Redis
├─ Paginate on server
└─ Aggregate data server-side

Option 2: Database
├─ Sync Sheets → PostgreSQL
├─ Query database directly
└─ Use n8n to keep in sync

Option 3: Serverless
├─ Cloud Functions
├─ Cache in Firestore
└─ Triggered by Sheets changes
```

---

This architecture provides:
- ✅ Scalability (handles 1000+ deals)
- ✅ Maintainability (clear separation of concerns)
- ✅ Performance (memoization, pagination)
- ✅ Security (read-only access, environment variables)
- ✅ Reliability (error handling, retry logic)
- ✅ User Experience (real-time updates, loading states)
