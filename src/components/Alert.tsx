'use client';

import { useOutreachStore } from '@/store/useOutreachStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Alert() {
  const { alert, clearAlert } = useOutreachStore();

  if (!alert) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-indigo-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-100',
    error: 'border-rose-500/20 bg-rose-950/20 text-rose-100',
    info: 'border-indigo-500/20 bg-indigo-950/20 text-indigo-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
          borderColors[alert.type]
        }`}
      >
        {icons[alert.type]}
        <p className="text-sm font-medium pr-4">{alert.message}</p>
        <button
          onClick={clearAlert}
          className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
