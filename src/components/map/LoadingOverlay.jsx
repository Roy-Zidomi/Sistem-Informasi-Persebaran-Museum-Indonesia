import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Memuat data museum...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
