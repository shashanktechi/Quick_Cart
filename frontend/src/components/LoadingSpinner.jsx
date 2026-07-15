import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-teal/20 border-t-teal rounded-full animate-spin"></div>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 transition-colors duration-200">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{spinner}</div>;
};

export default LoadingSpinner;
