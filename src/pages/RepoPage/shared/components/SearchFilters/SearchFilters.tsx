import { useEffect, useState } from 'react'

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

interface FilterState {
  searchTerm: string
  status: string[]
  dateRange: { start: string; end: string } | null
}

export function SearchFilters({
  onFilterChange,
  initialFilters,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      searchTerm: '',
      status: [],
      dateRange: null,
    }
  )
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (initialFilters && !hasChanges) {
      setFilters(initialFilters)
    }
  }, [initialFilters, hasChanges])

  useEffect(() => {
    if (hasChanges) {
      onFilterChange(filters)
      setHasChanges(false)
    }
  }, [filters, hasChanges, onFilterChange])

  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }))
    setHasChanges(true)
  }

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }))
    setHasChanges(true)
  }

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }))
    setHasChanges(true)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      status: [],
      dateRange: null,
    }
    setFilters(clearedFilters)
    setHasChanges(true)
  }

  return (
    <div className="space-y-4 rounded-lg border border-ds-gray-tertiary bg-white p-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Search</label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full rounded border border-ds-gray-tertiary px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Status</label>
        <div className="space-y-2">
          {['passed', 'failed', 'skipped'].map((status) => (
            <label key={status} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="size-4"
              />
              <span className="text-sm capitalize">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Date Range</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(e) =>
              handleDateRangeChange(
                e.target.value,
                filters.dateRange?.end || ''
              )
            }
            className="flex-1 rounded border border-ds-gray-tertiary px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.dateRange?.end || ''}
            onChange={(e) =>
              handleDateRangeChange(
                filters.dateRange?.start || '',
                e.target.value
              )
            }
            className="flex-1 rounded border border-ds-gray-tertiary px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleClearFilters}
        className="w-full rounded border border-ds-gray-tertiary bg-ds-gray-primary px-3 py-2 text-sm font-medium hover:bg-ds-gray-secondary"
      >
        Clear Filters
      </button>
    </div>
  )
}

export default SearchFilters
