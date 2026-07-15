import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StoreCard = ({ store, distance }) => {
  const { t } = useTranslation();

  const logoUrl = store.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';

  return (
    <Link
      to={`/store/${store.id}`}
      className={`bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-150/60 dark:border-gray-700/60 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] ${
        !store.isOpen ? 'opacity-70' : ''
      }`}
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
          <img src={logoUrl} alt={store.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{store.name}</h4>
            {store.verificationStatus === 'APPROVED' && (
              <ShieldCheck size={16} className="text-teal dark:text-teal-light flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate max-w-[150px]">{store.address || 'Address not listed'}</span>
          </p>

          {distance !== undefined && (
            <p className="text-[11px] font-semibold text-gray-450 dark:text-gray-500">
              {t('common.distance')}: {distance.toFixed(2)} km
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/40 pt-4">
        {/* Freshness Score */}
        <div className="flex items-center gap-1 text-teal dark:text-teal-light">
          <Flame size={15} className="fill-current" />
          <span className="text-xs font-bold">{t('common.freshness')}: {parseFloat(store.freshnessScore || 5.0).toFixed(1)}</span>
        </div>

        {/* Store Open Status */}
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            store.isOpen
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
          }`}
        >
          {store.isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
    </Link>
  );
};

export default StoreCard;
