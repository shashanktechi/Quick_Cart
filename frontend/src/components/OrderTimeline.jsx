import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Smile, XCircle } from 'lucide-react';

const OrderTimeline = ({ activeStatus }) => {
  const steps = [
    { status: 'PENDING', label: 'Order Placed', desc: 'Waiting for store to accept', icon: Clock },
    { status: 'CONFIRMED', label: 'Confirmed', desc: 'Store has accepted your order', icon: CheckCircle2 },
    { status: 'PREPARING', label: 'Preparing', desc: 'Items are being packed', icon: Package },
    { status: 'READY', label: 'Ready for Pickup', desc: 'Waiting for delivery partner', icon: Package },
    { status: 'PICKED_UP', label: 'Out for Delivery', desc: 'Delivery partner is on the way', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your fresh items!', icon: Smile },
  ];

  if (activeStatus === 'CANCELLED' || activeStatus === 'REFUNDED') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-card p-6 flex items-start gap-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
          <XCircle size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-red-800 dark:text-red-300">Order {activeStatus === 'CANCELLED' ? 'Cancelled' : 'Refunded'}</h4>
          <p className="text-sm text-red-650 dark:text-red-400/80 mt-1">This order was cancelled. Please check your credit transactions or contact support if you have any questions.</p>
        </div>
      </div>
    );
  }

  // Find index of active step
  let activeIndex = steps.findIndex((step) => step.status === activeStatus);
  if (activeStatus === 'READY' && activeIndex === -1) {
    activeIndex = 3; // Fallback
  }

  return (
    <div className="space-y-6">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < activeIndex;
        const isActive = idx === activeIndex;
        const isUpcoming = idx > activeIndex;

        return (
          <div key={step.status} className="flex gap-4 relative last:pb-0 pb-6 group">
            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-[1px] transition-all duration-350 ${
                  idx < activeIndex ? 'bg-teal' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}

            {/* Stepper Icon Indicator */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-350 z-10 ${
                isCompleted
                  ? 'bg-teal border-teal text-white'
                  : isActive
                  ? 'bg-white border-teal text-teal dark:bg-gray-800 animate-pulse'
                  : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <Icon size={18} />
            </div>

            {/* Content details */}
            <div className="flex-1 pt-1">
              <h4
                className={`text-sm font-bold transition-colors ${
                  isActive
                    ? 'text-teal dark:text-teal-light'
                    : isCompleted
                    ? 'text-gray-850 dark:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </h4>
              <p
                className={`text-xs mt-0.5 transition-colors ${
                  isActive
                    ? 'text-teal/80 dark:text-teal-light/80'
                    : isCompleted
                    ? 'text-gray-550 dark:text-gray-400'
                    : 'text-gray-400/80 dark:text-gray-600'
                }`}
              >
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
