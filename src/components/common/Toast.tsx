import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-emerald-500/90 text-white border-emerald-400 dark:bg-emerald-950/90 dark:border-emerald-800'
                : isError
                ? 'bg-rose-500/90 text-white border-rose-400 dark:bg-rose-950/90 dark:border-rose-800'
                : isWarning
                ? 'bg-amber-500/90 text-white border-amber-400 dark:bg-amber-950/90 dark:border-amber-800'
                : 'bg-slate-900/90 text-white border-slate-700 dark:bg-slate-800/90'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ms-3 p-1 rounded-lg hover:bg-black/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
