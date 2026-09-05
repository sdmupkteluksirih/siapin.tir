import React from 'react';
import { BookingStatus } from '../../types';
import { Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const config = {
    BOOKED: {
      label: 'BOOKED (Menunggu)',
      shortLabel: 'BOOKED',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    CONFIRMED: {
      label: 'CONFIRMED (Terkonfirmasi)',
      shortLabel: 'CONFIRMED',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: CheckCircle2,
      dot: 'bg-blue-600'
    },
    COMPLETED: {
      label: 'COMPLETED (Selesai)',
      shortLabel: 'COMPLETED',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCheck,
      dot: 'bg-emerald-600'
    },
    CANCELLED: {
      label: 'CANCELLED (Dibatalkan)',
      shortLabel: 'CANCELLED',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: XCircle,
      dot: 'bg-rose-500'
    }
  };

  const item = config[status] || config.BOOKED;
  const IconComponent = item.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${item.bg} ${sizeClasses[size]} select-none transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{item.shortLabel}</span>
    </span>
  );
};
