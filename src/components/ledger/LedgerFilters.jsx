import { Calendar, Search, Download, FileText } from 'lucide-react'

const LedgerFilters = ({
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchQueryChange,
  totalCount,
  filteredCount,
  onExport,
  onSaveReport
}) => {
  return (
    <div className="card">
      <div className="flex flex-col gap-4">
        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search by Client Name */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onSaveReport}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Save Report</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} transactions
          </span>
          {(searchQuery || dateRange !== 'all') && (
            <button
              onClick={() => {
                onSearchQueryChange('')
                onDateRangeChange('all')
              }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LedgerFilters
