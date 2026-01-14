import { Calendar, Save } from 'lucide-react'

const LedgerFilters = ({ dateRange, onDateRangeChange, totalCount, filteredCount }) => {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Date Range Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} transactions
          </span>
        </div>

        {/* Saved Reports */}
        <div className="flex items-center space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Saved Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LedgerFilters
