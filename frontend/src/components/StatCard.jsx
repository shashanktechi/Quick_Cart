import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'teal', subtitle }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'teal':
        return {
          bg: 'bg-teal/10 dark:bg-teal-light/10',
          text: 'text-teal dark:text-teal-light',
        };
      case 'coral':
        return {
          bg: 'bg-coral/10 dark:bg-coral/10',
          text: 'text-coral',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/25',
          text: 'text-blue-600 dark:text-blue-300',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/25',
          text: 'text-emerald-600 dark:text-emerald-300',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-300',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="space-y-1">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</span>
        <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{subtitle}</p>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${styles.bg} ${styles.text}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
