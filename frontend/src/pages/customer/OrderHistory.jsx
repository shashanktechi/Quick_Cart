import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { ShoppingBag, ChevronRight, Clock, Package } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    customerApi.getOrderHistory()
      .then((data) => setOrders(Array.isArray(data) ? data.reverse() : []))
      .catch(() => setError('Failed to load order history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Order History</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Start shopping to see your orders here." icon={ShoppingBag} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/customer/track/${order.id}`}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light flex items-center justify-center flex-shrink-0">
                <Package size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {order.store?.name || 'Unknown store'} · {order.deliveryAddress || 'No address'}
                </p>
                {order.estimatedDeliveryTime && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> ETA ~{order.estimatedDeliveryTime} mins
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-sm font-extrabold text-teal dark:text-teal-light">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
