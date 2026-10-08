import React from 'react';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const normalized = priority.toUpperCase();

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = priority;
  let Icon = ArrowRight;

  switch (normalized) {
    case 'HIGH':
      style = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      label = 'High';
      Icon = AlertCircle;
      break;
    case 'MEDIUM':
      style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      label = 'Medium';
      Icon = ArrowUp;
      break;
    case 'LOW':
      style = 'bg-slate-800/80 text-slate-400 border-slate-700/80';
      label = 'Low';
      Icon = ArrowDown;
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${style} ${sizeClasses}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

