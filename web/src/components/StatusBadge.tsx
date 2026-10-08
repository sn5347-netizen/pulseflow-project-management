import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status;

  switch (normalized) {
    case 'NOT_STARTED':
      style = 'bg-slate-800/80 text-slate-300 border-slate-700/80';
      label = 'Not Started';
      break;
    case 'IN_PROGRESS':
      style = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      label = 'In Progress';
      break;
    case 'COMPLETED':
      style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      label = 'Completed';
      break;
    case 'PENDING':
      style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      label = 'Pending';
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70 animate-pulse" />
      {label}
    </span>
  );
};

