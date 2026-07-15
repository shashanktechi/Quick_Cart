import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getStatusStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30';
      case 'PREPARING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30';
      case 'READY':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/30';
      case 'PICKED_UP':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/25 dark:text-orange-300 border-orange-200/50 dark:border-orange-800/30';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30';
      case 'CANCELLED':
      case 'REFUNDED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/25 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/30';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = () => {
    return t(`status.${status}`, status);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
