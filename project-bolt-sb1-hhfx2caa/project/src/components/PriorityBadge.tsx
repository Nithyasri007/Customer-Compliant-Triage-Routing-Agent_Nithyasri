import React from 'react';
import { AlertCircle, AlertTriangle, MinusCircle, Info } from 'lucide-react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  glow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-gradient-to-r from-red-500 to-red-600',
    text: 'text-white',
    glow: 'shadow-lg shadow-red-500/50'
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    text: 'text-white',
    glow: 'shadow-lg shadow-orange-500/50'
  },
  medium: {
    label: 'Medium',
    icon: MinusCircle,
    gradient: 'from-yellow-500 to-yellow-600',
    bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    text: 'text-white',
    glow: 'shadow-lg shadow-yellow-500/50'
  },
  low: {
    label: 'Low',
    icon: Info,
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-gradient-to-r from-green-500 to-green-600',
    text: 'text-white',
    glow: 'shadow-lg shadow-green-500/50'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, glow = false, size = 'md' }) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.text} ${sizeClasses[size]}
        ${glow ? config.glow : ''}
        transition-all duration-300
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
