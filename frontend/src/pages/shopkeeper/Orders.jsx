import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Inbox, CheckCircle, XCircle, Package } from 'lucide-react';

const STATUSES = [
  { label: 'Confirm', value: 'CONFIRMED', color: 'teal' },
  { label: 'Preparing', value: 'PREPARING', color: 'blue' },
  { label: 'Ready', value: 'READY', color: 'indigo' },
  { label: 'Reject', value: 'CANCELLED', color: 'red' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    storeApi.getIncomingOrders()
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('ws-incoming-order', handler);
    return () => window.removeEventListener('ws-incoming-order', handler);
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId + status);
    try {
      await storeApi.updateOrderStatus(orderId, status);
      load();
    } catch (e) {
      console.error(e);
    } finally { setUpdating(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Orders</h1>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-coral/10 text-coral text-xs font-bold rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse"></span>
          {orders.length} Pending
        </span>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No pending orders" description="New orders will appear here automatically." icon={Inbox} />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-teal" />
                  <p className="font-extrabold text-gray-900 dark:text-white">Order #{order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-lg font-extrabold text-teal dark:text-teal-light">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {order.customer && <p><span className="font-semibold">Customer:</span> {order.customer.fullName} · {order.customer.phone}</p>}
                <p><span className="font-semibold">Address:</span> {order.deliveryAddress || 'N/A'}</p>
                {order.estimatedDeliveryTime && <p><span className="font-semibold">ETA:</span> ~{order.estimatedDeliveryTime} mins</p>}
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
                {STATUSES.map((s) => {
                  const isLoading = updating === (order.id + s.value);
                  const colorMap = {
                    teal: 'bg-teal text-white hover:bg-teal-dark',
                    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/25 dark:text-blue-300',
                    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/25 dark:text-indigo-300',
                    red: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/25 dark:text-red-400',
                  };
                  return (
                    <button key={s.value} onClick={() => handleStatusChange(order.id, s.value)}
                      disabled={!!updating || order.status === s.value}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${colorMap[s.color]}`}>
                      {isLoading ? '...' : s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
