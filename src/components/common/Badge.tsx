import React from 'react';
import { RepairStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const StatusBadge: React.FC<{ status: RepairStatus }> = ({ status }) => {
  const { t } = useLanguage();

  const config: Record<RepairStatus, { label: string; bg: string; text: string }> = {
    received: {
      label: t('status_received'),
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300'
    },
    diagnosing: {
      label: t('status_diagnosing'),
      bg: 'bg-amber-100 dark:bg-amber-950/80',
      text: 'text-amber-700 dark:text-amber-400'
    },
    waiting_approval: {
      label: t('status_waiting_approval'),
      bg: 'bg-purple-100 dark:bg-purple-950/80',
      text: 'text-purple-700 dark:text-purple-400'
    },
    waiting_parts: {
      label: t('status_waiting_parts'),
      bg: 'bg-orange-100 dark:bg-orange-950/80',
      text: 'text-orange-700 dark:text-orange-400'
    },
    in_repair: {
      label: t('status_in_repair'),
      bg: 'bg-blue-100 dark:bg-blue-950/80',
      text: 'text-blue-700 dark:text-blue-400'
    },
    ready_for_pickup: {
      label: t('status_ready_for_pickup'),
      bg: 'bg-emerald-100 dark:bg-emerald-950/80',
      text: 'text-emerald-700 dark:text-emerald-400'
    },
    delivered: {
      label: t('status_delivered'),
      bg: 'bg-teal-100 dark:bg-teal-950/80',
      text: 'text-teal-700 dark:text-teal-400'
    },
    cancelled: {
      label: t('status_cancelled'),
      bg: 'bg-rose-100 dark:bg-rose-950/80',
      text: 'text-rose-700 dark:text-rose-400'
    }
  };

  const item = config[status] || config.received;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.bg} ${item.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5" />
      {item.label}
    </span>
  );
};
