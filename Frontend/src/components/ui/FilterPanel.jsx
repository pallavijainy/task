import { Filter, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              icon={X}
            >
              Clear All
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 sm:hidden"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isExpanded || window.innerWidth >= 640 ? '' : 'hidden sm:grid'}`}>
        {/* Date Range Filter */}
        {showDateFilter && (
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(value) => onFiltersChange({ ...filters, startDate: value })}
            onEndDateChange={(value) => onFiltersChange({ ...filters, endDate: value })}
            showLabel={true}
          />
        )}

        {/* User Filter */}
        {showUserFilter && users.length > 0 && (
          <UserFilter
            users={users}
            selectedUserId={filters.userId}
            onUserChange={(value) => onFiltersChange({ ...filters, userId: value })}
            showLabel={true}
          />
        )}

        {/* Status Filter */}
        {showStatusFilter && statusOptions.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
            {filters.startDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                From: {new Date(filters.startDate).toLocaleDateString()}
                <button 
                  onClick={() => onFiltersChange({ ...filters, startDate: '' })}
                  className="hover:text-blue-900 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                To: {new Date(filters.endDate).toLocaleDateString()}
                <button 
                  onClick={() => onFiltersChange({ ...filters, endDate: '' })}
                  className="hover:text-blue-900 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.userId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                User: {users.find(u => u._id === filters.userId)?.name || 'Selected'}
                <button 
                  onClick={() => onFiltersChange({ ...filters, userId: '' })}
                  className="hover:text-green-900 dark:hover:text-green-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                Status: {statusOptions.find(s => s.value === filters.status)?.label || filters.status}
                <button 
                  onClick={() => onFiltersChange({ ...filters, status: '' })}
                  className="hover:text-amber-900 dark:hover:text-amber-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
