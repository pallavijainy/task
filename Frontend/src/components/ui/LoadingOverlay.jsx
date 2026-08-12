import { Loader } from 'lucide-react';

const LoadingOverlay = ({ message = "Loading...", subMessage = null }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="flex justify-center mb-4">
          <Loader className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
