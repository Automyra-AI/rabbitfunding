import { useState } from 'react'
import { Filter, Columns, ChevronDown, Search, DollarSign } from 'lucide-react'

const AdvancesFilters = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  amountFilter,
  onAmountFilterChange,
  visibleColumns,
  onVisibleColumnsChange,
  totalCount,
  filteredCount
}) => {
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  const columnOptions = [
    { key: 'state', label: 'State' },
    { key: 'advanceId', label: 'Advance ID' },
    { key: 'type', label: 'Type' },
    { key: 'syndicated', label: 'Syndicated Amount' },
    { key: 'syndicatedOrigination', label: 'Synd Amount - Origination' },
    { key: 'factorRate', label: 'Factor Rate' },
    { key: 'payback', label: 'Total Payback' },
    { key: 'payments', label: 'Amount Paid' },
    { key: 'paymentPerTransaction', label: 'Payment/Transaction' },
    { key: 'paidBackPercent', label: 'Paid Back %' },
    { key: 'totalTransactions', label: 'Total Transactions' },
    { key: 'remainingTransactions', label: 'Remaining Transactions' },
    { key: 'outstanding', label: 'Remaining Balance' },
    { key: 'dateFunded', label: 'Date Funded' }
  ]

  const toggleColumn = (key) => {
    onVisibleColumnsChange({
      ...visibleColumns,
      [key]: !visibleColumns[key]
    })
  }

  return (
    <div className="card py-2 px-3">
      <div className="flex flex-col gap-2">
        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          {/* Search by Name */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search client..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="paid off">Paid Off</option>
            </select>
          </div>

          {/* Amount Filter */}
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <select
              value={amountFilter}
              onChange={(e) => onAmountFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Amounts</option>
              <option value="under10k">&lt;$10K</option>
              <option value="10k-50k">$10K-$50K</option>
              <option value="50k-100k">$50K-$100K</option>
              <option value="over100k">&gt;$100K</option>
            </select>
          </div>

          {/* Column Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center space-x-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Columns className="h-3 w-3" />
              <span>Cols</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showColumnSelector && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowColumnSelector(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
                  <div className="p-1">
                    <p className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">
                      Toggle Columns
                    </p>
                    {columnOptions.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key]}
                          onChange={() => toggleColumn(column.key)}
                          className="h-3 w-3 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-gray-700">
                          {column.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center ml-auto space-x-2">
            <span className="text-xs text-gray-600">
              {filteredCount}/{totalCount}
            </span>
            {(searchQuery || statusFilter !== 'all' || amountFilter !== 'all') && (
              <button
                onClick={() => {
                  onSearchQueryChange('')
                  onStatusFilterChange('all')
                  onAmountFilterChange('all')
                }}
                className="text-xs text-primary hover:text-primary-dark font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancesFilters
