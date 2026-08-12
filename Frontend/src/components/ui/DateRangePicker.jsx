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

  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 inline-block mr-2" />
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="date"
          label="From Date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={endDate || today}
          placeholder="Start date"
        />
        <Input
          type="date"
          label="To Date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
          max={today}
          placeholder="End date"
        />
      </div>
      {startDate && endDate && new Date(startDate) > new Date(endDate) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Start date must be before end date
        </p>
      )}
    </div>
  );
};

export default DateRangePicker;
