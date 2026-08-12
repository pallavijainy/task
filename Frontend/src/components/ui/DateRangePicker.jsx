import { Calendar } from 'lucide-react';
import Input from './Input';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  label = "Date Range",
  showLabel = true 
}) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleStartDateChange = (value) => {
    onStartDateChange(value);
    if (endDate && value && new Date(value) > new Date(endDate)) {
      onEndDateChange('');
    }
  };

  const handleEndDateChange = (value) => {
    onEndDateChange(value);
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4" />
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Input
            type="date"
            label="From"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate || today}
            placeholder="Start date"
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Input
            type="date"
            label="To"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate}
            max={today}
            placeholder="End date"
            className="text-sm"
          />
        </div>
      </div>
      {startDate && endDate && new Date(startDate) > new Date(endDate) && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
            Start date must be before or equal to end date
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
