import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryApi } from '../../api/deliveryApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { Truck, MapPin, Loader2, Package, ChevronRight } from 'lucide-react';

const DeliveryDashboard = () => {
  const [tasks, setTasks] = useState({ swarms: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimResult, setClaimResult] = useState(null);

  const load = () => {
    deliveryApi.getTasks()
      .then((d) => setTasks(d || { swarms: [], orders: [] }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('ws-delivery-update', handler);
    return () => window.removeEventListener('ws-delivery-update', handler);
  }, []);

  const handleClaimBatch = () => {
    setClaimError('');
    if (!navigator.geolocation) { setClaimError('Geolocation is not supported by your browser.'); return; }
    setClaiming(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await deliveryApi.claimBatch(pos.coords.latitude, pos.coords.longitude);
          setClaimResult(result);
          load();
        } catch (e) {
          setClaimError(e.response?.data?.error || 'No orders available to claim right now.');
        } finally { setClaiming(false); }
      },
      () => { setClaimError('Location access denied. Enable location to claim batches.'); setClaiming(false); }
    );
  };

  const activeOrders = (tasks.orders || []).filter((o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status));
  const completedOrders = (tasks.orders || []).filter((o) => o.status === 'DELIVERED');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Delivery Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Claim and manage your deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Tasks" value={activeOrders.length} icon={Truck} color="coral" />
        <StatCard title="Completed" value={completedOrders.length} icon={Package} color="teal" />
      </div>

      {/* Claim Batch */}
      <div className="bg-gradient-to-br from-teal to-teal-dark rounded-card p-6 text-white shadow-lg shadow-teal/25">
        <h3 className="font-extrabold text-lg mb-1.5">Claim Nearby Orders</h3>
        <p className="text-sm text-white/75 mb-4">We'll use your location to find the closest pending batch.</p>
        {claimError && <p className="text-xs text-white/90 bg-white/20 rounded-lg px-3 py-2 mb-3">{claimError}</p>}
        {claimResult && <p className="text-xs text-white/90 bg-white/20 rounded-lg px-3 py-2 mb-3">Batch claimed! {claimResult.orderIds?.length || 0} orders assigned.</p>}
        <button onClick={handleClaimBatch} disabled={claiming}
          className="flex items-center gap-2 px-6 py-3 bg-white text-teal font-extrabold text-sm rounded-xl hover:bg-teal-50 transition-all shadow-md disabled:opacity-60">
          {claiming ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {claiming ? 'Locating...' : 'Claim Nearby Batches'}
        </button>
      </div>

      {/* Active Tasks */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Active Tasks</h2>
        {activeOrders.length === 0 ? (
          <EmptyState title="No active tasks" description="Claim a batch to start delivering." icon={Truck} />
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link key={order.id} to={`/delivery/task/${order.id}`}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all">
                <div className="w-11 h-11 rounded-xl bg-coral/10 text-coral flex items-center justify-center flex-shrink-0"><Truck size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5"><p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id}</p><StatusBadge status={order.status} /></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.deliveryAddress || 'No address'}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
