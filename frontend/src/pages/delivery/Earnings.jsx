import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/deliveryApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Coins, Package, CheckCircle2 } from 'lucide-react';

const Earnings = () => {
  const [tasks, setTasks] = useState({ swarms: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryApi.getTasks()
      .then((d) => setTasks(d || { swarms: [], orders: [] }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const delivered = (tasks.orders || []).filter((o) => o.status === 'DELIVERED');

  // Earnings estimate: ₹25 flat per delivery (placeholder — no real earnings endpoint)
  const perDelivery = 25;
  const totalEarnings = delivered.length * perDelivery;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Earnings</h1>

      <div className="bg-gradient-to-br from-teal to-teal-dark rounded-card p-6 text-white shadow-lg shadow-teal/20">
        <p className="text-sm font-semibold text-white/70 mb-1">Total Earnings</p>
        <h2 className="text-4xl font-extrabold">₹{totalEarnings.toFixed(0)}</h2>
        <p className="text-sm text-white/70 mt-2">{delivered.length} deliveries × ₹{perDelivery} estimated</p>
        <p className="text-xs text-white/50 mt-1">Note: Earnings are estimated. Actual payouts depend on the payment integration (not yet implemented).</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Completed Deliveries</h2>
        {delivered.length === 0 ? (
          <EmptyState title="No completed deliveries" description="Delivered orders will appear here." icon={Coins} />
        ) : (
          <div className="space-y-3">
            {delivered.map((order) => (
              <div key={order.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.deliveryAddress || 'No address'}</p>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">+₹{perDelivery}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
