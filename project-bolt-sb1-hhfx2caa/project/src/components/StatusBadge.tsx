import React from 'react';
import { Circle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  new: {
    label: 'New',
    icon: Circle,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    text: 'text-white',
    pulse: true
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    text: 'text-white',
    pulse: false
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-gradient-to-r from-green-500 to-green-600',
    text: 'text-white',
    pulse: false
  },
  escalated: {
    label: 'Escalated',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-gradient-to-r from-red-500 to-red-600',
    text: 'text-white',
    pulse: true
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium relative
        ${config.bg} ${config.text} ${sizeClasses[size]}
        transition-all duration-300
      `}
    >
      {config.pulse && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-current"></span>
      )}
      <Icon className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">{config.label}</span>
    </span>
  );
};
