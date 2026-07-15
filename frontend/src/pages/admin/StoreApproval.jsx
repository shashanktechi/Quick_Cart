import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Store, CheckCircle, XCircle, MapPin, Phone, Image, FileText } from 'lucide-react';

const StoreApproval = () => {
  const { storeId } = useParams();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = () => {
    adminApi.getPendingStores()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setStores(list);
        if (storeId) {
          setSelectedStore(list.find((s) => s.id.toString() === storeId) || list[0] || null);
        } else {
          setSelectedStore(list[0] || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [storeId]);

  const handleVerify = async (id, status) => {
    setUpdating(status);
    try {
      await adminApi.verifyStore(id, status);
      setSuccessMsg(`Store ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally { setUpdating(''); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Store Approvals</h1>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
          {successMsg}
        </div>
      )}

      {stores.length === 0 ? (
        <EmptyState title="No pending stores" description="All stores have been reviewed." icon={Store} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
              {/* Store Banner */}
              {store.bannerUrl ? (
                <img src={store.bannerUrl} alt="Banner" className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 bg-gradient-to-br from-teal/20 to-teal-light/10 flex items-center justify-center">
                  <Store size={36} className="text-teal/40" />
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0"><Store size={22} /></div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white">{store.name}</h3>
                    <StatusBadge status={store.verificationStatus} />
                  </div>
                </div>

                {/* Store Details — only real fields */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {store.address && (
                    <p className="flex items-start gap-2"><MapPin size={14} className="text-teal mt-0.5 flex-shrink-0" />{store.address}</p>
                  )}
                  {store.whatsappNumber && (
                    <p className="flex items-center gap-2"><Phone size={14} className="text-teal flex-shrink-0" />{store.whatsappNumber}</p>
                  )}
                  <p className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">Freshness Score:</span> {parseFloat(store.freshnessScore || 5.0).toFixed(1)}
                  </p>
                </div>

                {/* DEFERRED: Verification Documents Section */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText size={14} className="text-gray-400" />
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Verification Documents</h4>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    Not yet submitted — document upload (shop license, ID proof) is a planned feature. Approve or reject based on other information.
                  </p>
                </div>

                {/* Approve / Reject Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleVerify(store.id, 'APPROVED')}
                    disabled={!!updating || store.verificationStatus === 'APPROVED'}
                    id={`approve-store-${store.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-teal text-white rounded-xl hover:bg-teal-dark transition-all shadow-md shadow-teal/20 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {updating === 'APPROVED' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleVerify(store.id, 'REJECTED')}
                    disabled={!!updating || store.verificationStatus === 'REJECTED'}
                    id={`reject-store-${store.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    {updating === 'REJECTED' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreApproval;
