import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Inbox, Package, DollarSign, AlertTriangle } from 'lucide-react';

const ShopkeeperDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [ord, inv] = await Promise.all([storeApi.getIncomingOrders(), storeApi.getInventory()]);
      setOrders(Array.isArray(ord) ? ord : []);
      setInventory(Array.isArray(inv) ? inv : []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // Listen for WS incoming order events and reload
    const handler = () => load();
    window.addEventListener('ws-incoming-order', handler);
    return () => window.removeEventListener('ws-incoming-order', handler);
  }, []);

  // Client-side aggregation (backend has no pre-aggregate endpoints yet)
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const lowStockCount = inventory.filter((i) => i.quantity < 10).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Store Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Live order feed and inventory overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Pending Orders" value={pendingCount} icon={Inbox} color="coral" subtitle="Awaiting acceptance" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} color="coral" subtitle="Quantity below 10" />
        <StatCard title="Total Products" value={inventory.length} icon={Package} color="teal" subtitle="Items in inventory" />
      </div>

      {/* Live Incoming Orders */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coral animate-pulse"></span>
          Incoming Orders
        </h2>
        {orders.length === 0 ? (
          <EmptyState title="No pending orders" description="New orders will appear here in real-time." icon={Inbox} />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 dark:text-white">Order #{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.deliveryAddress || 'No address'}</p>
                  <p className="text-sm font-extrabold text-teal dark:text-teal-light">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={async () => { await storeApi.updateOrderStatus(order.id, 'CONFIRMED'); load(); }}
                    className="px-3 py-1.5 text-xs font-bold bg-teal text-white rounded-lg hover:bg-teal-dark transition-all"
                  >Accept</button>
                  <button
                    onClick={async () => { await storeApi.updateOrderStatus(order.id, 'CANCELLED'); load(); }}
                    className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/25 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
