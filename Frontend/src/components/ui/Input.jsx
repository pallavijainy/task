import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border border-slate-300
            ${Icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
            text-slate-900 placeholder-slate-400
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-slate-50 disabled:text-slate-500
            transition-colors
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
