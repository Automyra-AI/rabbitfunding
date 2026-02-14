import { Calendar, Search, Download, FileText, Filter } from 'lucide-react'

const LedgerFilters = ({
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
  onExport,
  onSaveReport
}) => {
  return (
    <div className="card py-2 px-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
        {/* Search by Client Name */}
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
            value={statusFilter || 'all'}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending (Debit)</option>
            <option value="settled">Settled (Cleared)</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
            <option value="ytd">YTD</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onExport}
            className="flex items-center space-x-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
          <button
            onClick={onSaveReport}
            className="flex items-center space-x-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-3 w-3" />
            <span>Save</span>
          </button>
        </div>

        {/* Results Count */}
        <div className="flex items-center ml-auto space-x-2">
          <span className="text-xs text-gray-600">
            {filteredCount}/{totalCount}
          </span>
          {(searchQuery || dateRange !== 'all' || (statusFilter && statusFilter !== 'all')) && (
            <button
              onClick={() => {
                onSearchQueryChange('')
                onDateRangeChange('all')
                onStatusFilterChange('all')
              }}
              className="text-xs text-primary hover:text-primary-dark font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LedgerFilters
