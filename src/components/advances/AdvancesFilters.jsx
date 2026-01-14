import { useState } from 'react'
import { Filter, Columns, ChevronDown } from 'lucide-react'

const AdvancesFilters = ({
  statusFilter,
  onStatusFilterChange,
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
    { key: 'syndicated', label: 'Syndicated' },
    { key: 'syndicationPercent', label: 'Syndication %' },
    { key: 'cafs', label: 'CAFs' },
    { key: 'tcp', label: 'TCP' },
    { key: 'factorRate', label: 'Factor Rate' },
    { key: 'payback', label: 'Payback' },
    { key: 'payments', label: 'Payments' },
    { key: 'paidBackPercent', label: 'Paid Back %' },
    { key: 'outstanding', label: 'Outstanding' },
    { key: 'dateFunded', label: 'Date Funded' }
  ]

  const toggleColumn = (key) => {
    onVisibleColumnsChange({
      ...visibleColumns,
      [key]: !visibleColumns[key]
    })
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} advances
          </span>
        </div>

        {/* Column Selector */}
        <div className="relative">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Columns className="h-4 w-4" />
            <span>Columns</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showColumnSelector && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowColumnSelector(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Toggle Columns
                  </p>
                  {columnOptions.map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.key]}
                        onChange={() => toggleColumn(column.key)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {column.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdvancesFilters
