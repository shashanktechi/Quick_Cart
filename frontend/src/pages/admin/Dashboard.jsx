import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Store, Users, ShieldCheck, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [pendingStores, setPendingStores] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getPendingStores(), adminApi.getAllUsers()])
      .then(([stores, users]) => {
        setPendingStores(Array.isArray(stores) ? stores : []);
        setAllUsers(Array.isArray(users) ? users : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const customerCount = allUsers.filter((u) => u.role === 'CUSTOMER').length;
  const storeCount = allUsers.filter((u) => u.role === 'STORE_ADMIN').length;
  const deliveryCount = allUsers.filter((u) => u.role === 'DELIVERY_PARTNER').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform overview and pending approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Approvals" value={pendingStores.length} icon={ShieldCheck} color="coral" subtitle="Stores awaiting review" />
        <StatCard title="Total Users" value={allUsers.length} icon={Users} color="teal" />
        <StatCard title="Customers" value={customerCount} icon={Users} color="blue" />
        <StatCard title="Delivery Partners" value={deliveryCount} icon={Store} color="emerald" />
      </div>

      {/* Pending Store Approvals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Pending Approvals</h2>
          <Link to="/admin/approvals" className="text-xs text-teal dark:text-teal-light font-semibold hover:underline">View all →</Link>
        </div>

        {pendingStores.length === 0 ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-card p-5 text-center">
            <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">All stores are reviewed! No pending approvals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingStores.slice(0, 5).map((store) => (
              <Link key={store.id} to={`/admin/approvals/${store.id}`}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Store size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{store.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{store.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={store.verificationStatus} />
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
