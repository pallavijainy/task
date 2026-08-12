import { Users } from 'lucide-react';

const UserFilter = ({ 
  users = [], 
  selectedUserId, 
  onUserChange,
  label = "Filter by User",
  showLabel = true,
  placeholder = "All Users",
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          <Users className="w-4 h-4 inline-block mr-2" />
          {label}
        </label>
      )}
      <select
        value={selectedUserId || ''}
        onChange={(e) => onUserChange(e.target.value)}
        disabled={disabled}
        className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilter;
