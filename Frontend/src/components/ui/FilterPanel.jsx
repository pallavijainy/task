import { Filter, X, Calendar, User, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';
import DateRangePicker from './DateRangePicker';
import UserFilter from './UserFilter';

const FilterPanel = ({ 
  filters,
  onFiltersChange,
  users = [],
  showUserFilter = true,
  showDateFilter = true,
  showStatusFilter = false,
  statusOptions = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClearFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      userId: '',
      status: ''
    });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.userId || filters.status;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Filter Records
            </h3>
            {hasActiveFilters && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {Object.values(filters).filter(Boolean).length} active filter{Object.values(filters).filter(Boolean).length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Date Range Filter */}
            {showDateFilter && (
              <div className="space-y-2">
                <DateRangePicker
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onStartDateChange={(value) => onFiltersChange({ ...filters, startDate: value })}
                  onEndDateChange={(value) => onFiltersChange({ ...filters, endDate: value })}
                  showLabel={true}
                />
              </div>
            )}

            {/* User Filter */}
            {showUserFilter && users.length > 0 && (
              <div className="space-y-2">
                <UserFilter
                  users={users}
                  selectedUserId={filters.userId}
                  onUserChange={(value) => onFiltersChange({ ...filters, userId: value })}
                  showLabel={true}
                />
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && statusOptions.length > 0 && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4" />
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Applied:
                </span>
                {filters.startDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Calendar className="w-3.5 h-3.5" />
                    From {new Date(filters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <button 
                      onClick={() => onFiltersChange({ ...filters, startDate: '' })}
                      className="hover:text-blue-900 dark:hover:text-blue-200 ml-1 transition-colors"
                      aria-label="Remove start date filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.endDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Calendar className="w-3.5 h-3.5" />
                    To {new Date(filters.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <button 
                      onClick={() => onFiltersChange({ ...filters, endDate: '' })}
                      className="hover:text-blue-900 dark:hover:text-blue-200 ml-1 transition-colors"
                      aria-label="Remove end date filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.userId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <User className="w-3.5 h-3.5" />
                    {users.find(u => u._id === filters.userId)?.name || 'User'}
                    <button 
                      onClick={() => onFiltersChange({ ...filters, userId: '' })}
                      className="hover:text-green-900 dark:hover:text-green-200 ml-1 transition-colors"
                      aria-label="Remove user filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {statusOptions.find(s => s.value === filters.status)?.label || filters.status}
                    <button 
                      onClick={() => onFiltersChange({ ...filters, status: '' })}
                      className="hover:text-amber-900 dark:hover:text-amber-200 ml-1 transition-colors"
                      aria-label="Remove status filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
