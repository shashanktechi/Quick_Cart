import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customerApi } from '../../api/customerApi';
import StoreCard from '../../components/StoreCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Search, MapPin, Store } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [search, setSearch] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const fetchStores = (lat, lng) => {
    setLoading(true);
    setLocationError('');
    customerApi.getNearbyStores(lat, lng)
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => setLocationError('Failed to load nearby stores.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          fetchStores(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback to Bangalore coords from seed data
          setLocationError('Location access denied. Showing stores near default location.');
          fetchStores(12.91, 77.63);
        }
      );
    } else {
      fetchStores(12.91, 77.63);
    }
  }, []);

  const filtered = stores.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Nearby Stores</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={13} />
            {userLat ? `${userLat.toFixed(4)}, ${userLng.toFixed(4)}` : 'Detecting location...'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="home-search"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all"
          />
        </div>
      </div>

      {locationError && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-sm px-4 py-3 rounded-xl">
          <MapPin size={16} className="flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No stores found nearby"
          description="Try a different location or check back later. Stores need to be approved and open to appear here."
          icon={Store}
        />
      ) : (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{filtered.length} stores found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
