import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Users as UsersIcon, Search, Phone, Mail } from 'lucide-react';

const ROLE_COLORS = {
  CUSTOMER: 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300',
  STORE_ADMIN: 'bg-teal/10 text-teal dark:bg-teal-light/10 dark:text-teal-light',
  DELIVERY_PARTNER: 'bg-coral/10 text-coral',
  SYSTEM_ADMIN: 'bg-purple-50 text-purple-700 dark:bg-purple-900/25 dark:text-purple-300',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    adminApi.getAllUsers()
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} id="users-search"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'CUSTOMER', 'STORE_ADMIN', 'DELIVERY_PARTNER', 'SYSTEM_ADMIN'].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${roleFilter === r ? 'bg-teal text-white border-teal' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal hover:text-teal'}`}>
              {r === 'ALL' ? 'All' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or filter." icon={UsersIcon} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/50">
                <tr>
                  {['Name', 'Phone', 'Email', 'Role', 'Trust Score', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white">{user.fullName || '—'}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{user.phone}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{user.email || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 font-semibold">{user.trustScore ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${user.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/25 dark:text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-800 dark:text-white">{user.fullName || '—'}</p>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>{user.role?.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Phone size={12} />{user.phone}</p>
                {user.email && <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5"><Mail size={12} />{user.email}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
